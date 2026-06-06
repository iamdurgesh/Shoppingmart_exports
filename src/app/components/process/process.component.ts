import { Component } from '@angular/core';

interface ProcessStep {
  readonly number: string;
  readonly title: string;
  readonly description: string;
}

@Component({
  selector: 'app-process',
  templateUrl: './process.component.html',
  styleUrl: './process.component.scss',
})
export class ProcessComponent {
  protected readonly steps: readonly ProcessStep[] = [
    {
      number: '1',
      title: 'Requirement capture',
      description: 'Product, target market, packaging, certificates, and quantity expectations are documented first.',
    },
    {
      number: '2',
      title: 'Supplier and sample check',
      description: 'Shortlisted supply options are compared on specification fit, pricing, lead time, and repeatability.',
    },
    {
      number: '3',
      title: 'Export preparation',
      description: 'Packing, invoices, shipment coordination, and required trade documents are prepared for review.',
    },
  ];
}
