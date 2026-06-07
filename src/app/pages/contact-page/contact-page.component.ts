import { Component, inject } from '@angular/core';

import { QuoteEnquiryService } from '../../services/quote-enquiry.service';

@Component({
  selector: 'app-contact-page',
  templateUrl: './contact-page.component.html',
  styleUrl: './contact-page.component.scss',
})
export class ContactPageComponent {
  private readonly quoteEnquiryService = inject(QuoteEnquiryService);

  protected readonly salesEmail = this.quoteEnquiryService.salesEmail;
}
