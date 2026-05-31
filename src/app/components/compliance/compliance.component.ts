import { Component } from '@angular/core';

interface ComplianceCard {
  readonly title: string;
  readonly description: string;
}

@Component({
  selector: 'app-compliance',
  templateUrl: './compliance.component.html',
  styleUrl: './compliance.component.css',
})
export class ComplianceComponent {
  protected readonly complianceCards: readonly ComplianceCard[] = [
    {
      title: 'GDPR-minded enquiry handling',
      description:
        'We collect only the trade details needed for quotation, shipment planning, and importer communication.',
    },
    {
      title: 'Origin and customs discipline',
      description:
        'Product classification, invoice data, packing records, and origin evidence are treated as order-critical records.',
    },
    {
      title: 'EU product readiness',
      description:
        'We prepare buyer discussions around applicable documentation, labelling, SPS, technical standards, and market-specific checks.',
    },
  ];

  protected showTradeDetails = false;

  protected toggleTradeDetails(): void {
    this.showTradeDetails = !this.showTradeDetails;
  }
}
