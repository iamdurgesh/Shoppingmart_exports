import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import {
  QuoteEnquiryService,
  type QuoteEnquiryDraft,
  type QuoteSubmissionRecord,
} from '../../services/quote-enquiry.service';
import { QuoteRequestApiService } from '../../services/quote-request-api.service';

type QuoteSubmitStatus = 'idle' | 'submitting' | 'submitted' | 'failed';

@Injectable()
export class QuoteRequestStore {
  private readonly quoteEnquiryService = inject(QuoteEnquiryService);
  private readonly quoteRequestApiService = inject(QuoteRequestApiService);
  private readonly statusState = signal<QuoteSubmitStatus>('idle');
  private readonly errorMessageState = signal<string | null>(null);

  readonly status = this.statusState.asReadonly();
  readonly errorMessage = this.errorMessageState.asReadonly();
  readonly isSubmitting = computed(() => this.statusState() === 'submitting');

  async submitDraft(draft: QuoteEnquiryDraft): Promise<QuoteSubmissionRecord> {
    const payload = this.quoteEnquiryService.buildQuoteRequestPayload(draft);

    this.statusState.set('submitting');
    this.errorMessageState.set(null);

    try {
      const response = await firstValueFrom(this.quoteRequestApiService.submitQuoteRequest(payload));
      const submittedPayload = {
        ...payload,
        requestId: response.requestId,
        submittedAt: response.savedAt,
        status: response.status,
      } satisfies QuoteSubmissionRecord['payload'];
      const record: QuoteSubmissionRecord = {
        payload: submittedPayload,
        savedAt: response.savedAt,
        source: 'website-quote-form',
        status: response.status,
      };

      this.quoteEnquiryService.markSubmissionSaved(draft, response.savedAt);
      this.statusState.set('submitted');

      return record;
    } catch {
      this.statusState.set('failed');
      this.errorMessageState.set('quote.errors.submitFailed');
      throw new Error('Quote request submission failed.');
    }
  }
}
