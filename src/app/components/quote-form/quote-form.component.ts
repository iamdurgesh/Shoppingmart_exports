import { computed, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators, type AbstractControl } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { debounceTime, map, startWith } from 'rxjs';

import {
  QuoteEnquiryService,
  type Category,
  type Market,
  type OptionItem,
  type QuoteEnquiryDraft,
  type QuoteSubmissionRecord,
  type Volume,
} from '../../services/quote-enquiry.service';

interface QuoteResultView {
  readonly title: string;
  readonly description: string;
}

interface ValidationMessage {
  readonly key: string;
  readonly params?: Record<string, number>;
}

function noWhitespaceValidator(control: AbstractControl<string>): { whitespace: true } | null {
  return control.value.trim().length > 0 ? null : { whitespace: true };
}

@Component({
  selector: 'app-quote-form',
  imports: [ReactiveFormsModule, TranslocoPipe],
  templateUrl: './quote-form.component.html',
  styleUrl: './quote-form.component.scss',
})
export class QuoteFormComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly quoteEnquiryService = inject(QuoteEnquiryService);
  private readonly translocoService = inject(TranslocoService);
  private readonly initialSnapshot = this.quoteEnquiryService.loadDraftSnapshot();
  private readonly submittedRecord = signal<QuoteSubmissionRecord | null>(null);
  private readonly lastSavedAt = signal<string | null>(this.initialSnapshot.savedAt);

  protected readonly markets = this.quoteEnquiryService.marketOptions;
  protected readonly categories = this.quoteEnquiryService.categoryOptions;
  protected readonly volumes = this.quoteEnquiryService.volumeOptions;

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
  private readonly activeLanguage = toSignal(
    this.translocoService.langChanges$.pipe(startWith(this.translocoService.getActiveLang())),
    { initialValue: this.translocoService.getActiveLang() },
  );

  protected readonly result = computed<QuoteResultView>(() => {
    this.activeLanguage();
    const submitted = this.submittedRecord();

    if (submitted) {
      const contactName =
        submitted.payload.contact.fullName.trim() || this.translocoService.translate('quote.result.fallbackTeam');

      return {
        title: this.translocoService.translate('quote.result.submissionTitle'),
        description: this.translocoService.translate('quote.result.submissionDescription', {
          contactName,
          requestId: submitted.payload.requestId,
          email: submitted.payload.contact.email,
        }),
      };
    }

    const draft = this.draftValue();
    const name = draft.name.trim();
    const message = draft.message.trim();

    if (!name && !message) {
      return {
        title: this.translocoService.translate('quote.result.emptyTitle'),
        description: this.translocoService.translate('quote.result.emptyDescription'),
      };
    }

    return {
      title: this.translocoService.translate('quote.result.readyTitle', {
        name: name || this.translocoService.translate('quote.result.fallbackTeam'),
      }),
      description: this.translocoService.translate('quote.result.readyDescription', {
        volumeFocus: this.translocoService.translate(`quote.volumeFocus.${draft.volume}`),
        category: this.translocoService.translate(this.getOptionLabelKey(draft.category, this.categories)),
        market: this.translocoService.translate(this.getOptionLabelKey(draft.market, this.markets)),
        complianceFocus: this.translocoService.translate(
          draft.market === 'European Union' ? 'quote.complianceFocus.eu' : 'quote.complianceFocus.standard',
        ),
      }),
    };
  });

  protected readonly resultLabel = computed(() => {
    this.activeLanguage();
    return this.translocoService.translate(
      this.submittedRecord() ? 'quote.result.queuedLabel' : 'quote.result.previewLabel',
    );
  });

  protected readonly draftStatus = computed(() => {
    this.activeLanguage();
    const submitted = this.submittedRecord();

    if (submitted) {
      return this.translocoService.translate('quote.result.prepared', {
        date: this.formatTimestamp(submitted.savedAt),
        requestId: submitted.payload.requestId,
      });
    }

    const savedAt = this.lastSavedAt();

    return savedAt
      ? this.translocoService.translate('quote.result.draftSaved', {
          date: this.formatTimestamp(savedAt),
        })
      : this.translocoService.translate('quote.result.draftEmpty');
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

  protected errorMessage(field: keyof QuoteEnquiryDraft): ValidationMessage | null {
    const control = this.quoteForm.controls[field];

    if (!this.showError(field)) {
      return null;
    }

    if (control.hasError('required') || control.hasError('whitespace')) {
      return { key: 'quote.errors.required' };
    }

    if (control.hasError('requiredTrue')) {
      return { key: 'quote.errors.privacy' };
    }

    if (control.hasError('email')) {
      return { key: 'quote.errors.email' };
    }

    if (control.hasError('minlength')) {
      const requiredLength = control.getError('minlength')['requiredLength'] as number;
      return {
        key: 'quote.errors.minlength',
        params: { requiredLength },
      };
    }

    return { key: 'quote.errors.review' };
  }

  private formatTimestamp(value: string): string {
    return new Intl.DateTimeFormat(this.activeLanguage(), {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  }

  private getOptionLabelKey<TValue extends Market | Category | Volume>(
    value: TValue,
    options: readonly OptionItem<TValue>[],
  ): string {
    return options.find((option) => option.value === value)?.labelKey ?? '';
  }
}
