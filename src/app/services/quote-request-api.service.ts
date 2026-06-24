import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { type QuoteRequestPayload } from './quote-enquiry.service';

export interface QuoteRequestResponse {
  readonly requestId: string;
  readonly savedAt: string;
  readonly status: 'queued';
}

@Injectable({ providedIn: 'root' })
export class QuoteRequestApiService {
  private readonly http = inject(HttpClient);

  readonly endpoint = '/api/quote-requests';

  submitQuoteRequest(payload: QuoteRequestPayload): Observable<QuoteRequestResponse> {
    return this.http.post<QuoteRequestResponse>(this.endpoint, payload);
  }
}
