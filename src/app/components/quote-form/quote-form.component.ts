import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface EnquiryModel {
  market: string;
  category: string;
  volume: string;
}

interface EnquiryResult {
  readonly title: string;
  readonly description: string;
}

interface OptionItem {
  readonly value: string;
  readonly label: string;
}

@Component({
  selector: 'app-quote-form',
  imports: [FormsModule],
  templateUrl: './quote-form.component.html',
  styleUrl: './quote-form.component.scss',
})
export class QuoteFormComponent {
  protected readonly markets = ['European Union', 'United Kingdom', 'Middle East', 'North America', 'Other market'];
  protected readonly categories = ['Consumer Goods', 'Food and Staples', 'Textiles', 'Custom Sourcing'];
  protected readonly volumes: readonly OptionItem[] = [
    { value: 'sample', label: 'Samples or trial order' },
    { value: 'pallet', label: 'Pallet-level order' },
    { value: 'container', label: 'Container load' },
    { value: 'mixed', label: 'Mixed product shipment' },
  ];

  protected enquiry: EnquiryModel = {
    market: 'European Union',
    category: 'Consumer Goods',
    volume: 'sample',
  };

  protected result: EnquiryResult = {
    title: 'Define product specification and destination requirements.',
    description: 'Choose your trade details to generate a practical enquiry summary for the next conversation.',
  };

  protected prepareEnquiry(): void {
    const volumeLabel = this.getVolumeFocus(this.enquiry.volume);
    const complianceFocus =
      this.enquiry.market === 'European Union'
        ? 'GDPR-minded communication, origin evidence, and importer document checks'
        : 'destination-market document checks';

    this.result = {
      title: `${this.enquiry.category}: start with ${volumeLabel} for ${this.enquiry.market}.`,
      description: `Next, confirm specifications, packaging, target quantity, certificates, and ${complianceFocus} before pricing.`,
    };
  }

  private getVolumeFocus(volume: string): string {
    const labels: Record<string, string> = {
      sample: 'sample validation',
      pallet: 'pallet packing plan',
      container: 'container loading plan',
      mixed: 'mixed shipment consolidation',
    };

    return labels[volume] ?? 'shipment planning';
  }
}
