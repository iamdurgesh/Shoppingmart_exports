import { computed, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators, type AbstractControl } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { debounceTime, filter, map, startWith } from 'rxjs';

import {
  QuoteEnquiryService,
  type QuoteEnquiryDraft,
  type QuoteSubmissionRecord,
} from '../../services/quote-enquiry.service';
import { QuoteRequestStore } from './quote-request.store';

interface QuoteResultView {
  readonly titleKey: string;
  readonly titleParams?: Record<string, string>;
  readonly descriptionKey: string;
  readonly descriptionParams?: Record<string, string>;
}

interface TranslationMessage {
  readonly key: string;
  readonly params?: Record<string, string>;
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
  providers: [QuoteRequestStore],
})
export class QuoteFormComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly quoteEnquiryService = inject(QuoteEnquiryService);
  private readonly quoteRequestStore = inject(QuoteRequestStore);
  private readonly translocoService = inject(TranslocoService);
  private readonly initialSnapshot = this.quoteEnquiryService.loadDraftSnapshot();
  private readonly submittedRecord = signal<QuoteSubmissionRecord | null>(null);
  private readonly lastSavedAt = signal<string | null>(this.initialSnapshot.savedAt);

  protected readonly volumes = this.quoteEnquiryService.volumeOptions;
  protected readonly isSubmitting = this.quoteRequestStore.isSubmitting;
  protected readonly submitError = this.quoteRequestStore.errorMessage;

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
  private readonly translationLoaded = toSignal(
    this.translocoService.events$.pipe(
      filter((event) => event.type === 'translationLoadSuccess' || event.type === 'langChanged'),
      startWith(null),
    ),
    { initialValue: null },
  );

  protected readonly result = computed<QuoteResultView>(() => {
    this.activeLanguage();
    this.translationLoaded();
    const submitted = this.submittedRecord();

    if (submitted) {
      const contactName =
        submitted.payload.contact.fullName.trim() || this.translocoService.translate('quote.result.fallbackTeam');
      const descriptionParams: Record<string, string> = {
        contactName,
        requestId: submitted.payload.requestId,
        email: submitted.payload.contact.email,
      };

      const submittedResult: QuoteResultView = {
        titleKey: 'quote.result.submissionTitle',
        descriptionKey: 'quote.result.submissionDescription',
        descriptionParams,
      };

      return submittedResult;
    }

    const draft = this.draftValue();
    const name = draft.name.trim();
    const message = draft.message.trim();

    if (!name && !message) {
      const emptyResult: QuoteResultView = {
        titleKey: 'quote.result.emptyTitle',
        descriptionKey: 'quote.result.emptyDescription',
      };

      return emptyResult;
    }

    const titleParams: Record<string, string> = {
      name: name || this.translocoService.translate('quote.result.fallbackTeam'),
    };
    const descriptionParams: Record<string, string> = {
      volumeFocus: this.translocoService.translate(`quote.volumeFocus.${draft.volume}`),
    };

    const readyResult: QuoteResultView = {
      titleKey: 'quote.result.readyTitle',
      titleParams,
      descriptionKey: 'quote.result.readyDescriptionSimple',
      descriptionParams,
    };

    return readyResult;
  });

  protected readonly resultLabelKey = computed(() =>
    this.submittedRecord() ? 'quote.result.queuedLabel' : 'quote.result.previewLabel',
  );
  protected readonly successNotice = computed<TranslationMessage | null>(() => {
    const submitted = this.submittedRecord();

    if (!submitted) {
      return null;
    }

    return {
      key: 'quote.success.description',
      params: {
        requestId: submitted.payload.requestId,
        email: submitted.payload.contact.email,
      },
    };
  });

  protected readonly draftStatus = computed<TranslationMessage>(() => {
    this.activeLanguage();
    const submitted = this.submittedRecord();

    if (submitted) {
      const params: Record<string, string> = {
        date: this.formatTimestamp(submitted.savedAt),
        requestId: submitted.payload.requestId,
      };

      return {
        key: 'quote.result.prepared',
        params,
      };
    }

    const savedAt = this.lastSavedAt();

    if (savedAt) {
      const params: Record<string, string> = {
        date: this.formatTimestamp(savedAt),
      };

      return {
        key: 'quote.result.draftSaved',
        params,
      };
    }

    return { key: 'quote.result.draftEmpty' };
  });

  protected readonly canSubmit = computed(() => this.formStatus() === 'VALID' && !this.isSubmitting());

  protected async submitEnquiry(): Promise<void> {
    if (!this.canSubmit()) {
      this.quoteForm.markAllAsTouched();
      return;
    }

    try {
      const submission = await this.quoteRequestStore.submitDraft(this.draftValue());
      const nextDraft = this.quoteEnquiryService.createDefaultDraft();

      this.submittedRecord.set(submission);
      this.lastSavedAt.set(submission.savedAt);
      this.quoteEnquiryService.clearDraft();
      this.quoteForm.reset(nextDraft, { emitEvent: false });
      this.quoteForm.markAsPristine();
      this.quoteForm.markAsUntouched();
    } catch {
      this.submittedRecord.set(null);
    }
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
}
