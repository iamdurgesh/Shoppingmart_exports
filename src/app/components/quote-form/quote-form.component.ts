import { computed, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators, type AbstractControl } from '@angular/forms';
import { debounceTime, map, startWith } from 'rxjs';

import {
  QuoteEnquiryService,
  type EnquiryResult,
  type QuoteEnquiryDraft,
  type QuoteSubmissionRecord,
} from '../../services/quote-enquiry.service';

function noWhitespaceValidator(control: AbstractControl<string>): { whitespace: true } | null {
  return control.value.trim().length > 0 ? null : { whitespace: true };
}

@Component({
  selector: 'app-quote-form',
  imports: [ReactiveFormsModule],
  templateUrl: './quote-form.component.html',
  styleUrl: './quote-form.component.scss',
})
export class QuoteFormComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly quoteEnquiryService = inject(QuoteEnquiryService);
  private readonly initialSnapshot = this.quoteEnquiryService.loadDraftSnapshot();
  private readonly submittedRecord = signal<QuoteSubmissionRecord | null>(null);
  private readonly lastSavedAt = signal<string | null>(this.initialSnapshot.savedAt);

  protected readonly markets = this.quoteEnquiryService.markets;
  protected readonly categories = this.quoteEnquiryService.categories;
  protected readonly volumes = this.quoteEnquiryService.volumes;

  protected readonly quoteForm = this.formBuilder.group({
    name: this.formBuilder.control(this.initialSnapshot.draft.name, {
      validators: [Validators.required, Validators.minLength(2), noWhitespaceValidator],
    }),
    email: this.formBuilder.control(this.initialSnapshot.draft.email, {
      validators: [Validators.required, Validators.email],
    }),
    company: this.formBuilder.control(this.initialSnapshot.draft.company),
    contactDetails: this.formBuilder.control(this.initialSnapshot.draft.contactDetails),
    market: this.formBuilder.control(this.initialSnapshot.draft.market, {
      validators: [Validators.required],
    }),
    category: this.formBuilder.control(this.initialSnapshot.draft.category, {
      validators: [Validators.required],
    }),
    volume: this.formBuilder.control(this.initialSnapshot.draft.volume, {
      validators: [Validators.required],
    }),
    message: this.formBuilder.control(this.initialSnapshot.draft.message, {
      validators: [Validators.required, Validators.minLength(24), noWhitespaceValidator],
    }),
    privacyAccepted: this.formBuilder.control(this.initialSnapshot.draft.privacyAccepted, {
      validators: [Validators.requiredTrue],
    }),
  });

  private readonly draftValue = toSignal(
    this.quoteForm.valueChanges.pipe(
      debounceTime(250),
      map(() => {
        const draft = this.quoteForm.getRawValue();

        if (this.quoteForm.dirty) {
          const snapshot = this.quoteEnquiryService.persistDraft(draft);
          this.lastSavedAt.set(snapshot.savedAt);
          this.submittedRecord.set(null);
        }

        return draft;
      }),
      startWith(this.quoteForm.getRawValue()),
    ),
    { initialValue: this.quoteForm.getRawValue() },
  );

  private readonly formStatus = toSignal(
    this.quoteForm.statusChanges.pipe(startWith(this.quoteForm.status)),
    { initialValue: this.quoteForm.status },
  );

  protected readonly result = computed<EnquiryResult>(() => {
    const submitted = this.submittedRecord();
    return submitted
      ? this.quoteEnquiryService.buildSubmissionResult(submitted)
      : this.quoteEnquiryService.buildPreviewResult(this.draftValue());
  });

  protected readonly resultLabel = computed(() =>
    this.submittedRecord() ? 'Payload queued' : 'Quotation preview',
  );

  protected readonly draftStatus = computed(() => {
    const submitted = this.submittedRecord();

    if (submitted) {
      return `Prepared on ${this.formatTimestamp(submitted.savedAt)}. Request ID: ${submitted.payload.requestId}.`;
    }

    const savedAt = this.lastSavedAt();

    return savedAt
      ? `Draft autosaved on ${this.formatTimestamp(savedAt)}. The final submit creates the backend-ready JSON object.`
      : 'The form currently keeps a browser draft. Submit creates the JSON contract for backend storage.';
  });

  protected readonly canSubmit = computed(() => this.formStatus() === 'VALID');

  protected submitEnquiry(): void {
    if (!this.canSubmit()) {
      this.quoteForm.markAllAsTouched();
      return;
    }

    const submission = this.quoteEnquiryService.queueSubmission(this.draftValue());

    this.submittedRecord.set(submission);
    this.lastSavedAt.set(submission.savedAt);
    this.quoteForm.markAsPristine();
  }

  protected showError(field: keyof QuoteEnquiryDraft): boolean {
    const control = this.quoteForm.controls[field];
    return control.invalid && (control.dirty || control.touched);
  }

  protected errorMessage(field: keyof QuoteEnquiryDraft): string | null {
    const control = this.quoteForm.controls[field];

    if (!this.showError(field)) {
      return null;
    }

    if (control.hasError('required') || control.hasError('whitespace')) {
      return 'This field is required.';
    }

    if (control.hasError('requiredTrue')) {
      return 'Please confirm quotation follow-up permission.';
    }

    if (control.hasError('email')) {
      return 'Enter a valid business email address.';
    }

    if (control.hasError('minlength')) {
      const requiredLength = control.getError('minlength')['requiredLength'] as number;
      return `Use at least ${requiredLength} characters.`;
    }

    return 'Please review this field.';
  }

  private formatTimestamp(value: string): string {
    return new Intl.DateTimeFormat('en', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  }
}
