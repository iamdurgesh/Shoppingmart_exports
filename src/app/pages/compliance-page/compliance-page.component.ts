import { Component } from '@angular/core';

interface CompliancePillar {
  readonly title: string;
  readonly description: string;
}

interface ReadinessItem {
  readonly label: string;
  readonly details: string;
}

interface SourceLink {
  readonly label: string;
  readonly href: string;
}

@Component({
  selector: 'app-compliance-page',
  templateUrl: './compliance-page.component.html',
  styleUrl: './compliance-page.component.css',
})
export class CompliancePageComponent {
  protected showChecklist = false;

  protected readonly pillars: readonly CompliancePillar[] = [
    {
      title: 'GDPR and DSGVO respect',
      description:
        'We design enquiry flows around data minimization, purpose limitation, access control, and clear buyer communication.',
    },
    {
      title: 'Rules of origin readiness',
      description:
        'Supplier declarations, product origin evidence, HS classification, and invoice records are treated as core export inputs.',
    },
    {
      title: 'EU market documentation',
      description:
        'We prepare product discussions around labelling, safety documentation, SPS needs, technical standards, and importer review.',
    },
    {
      title: 'Responsible trade records',
      description:
        'Commercial invoices, packing lists, certificates, and shipment milestones are structured for repeat orders and auditability.',
    },
  ];

  protected readonly readinessItems: readonly ReadinessItem[] = [
    {
      label: 'FTA status check',
      details:
        'EU-India FTA negotiations concluded on 27 January 2026, but product planning must still respect final legal text, signature, and entry-into-force status.',
    },
    {
      label: 'Product-specific compliance',
      details:
        'Food, textiles, consumer goods, and regulated products can trigger different EU documentation, labelling, safety, or sanitary requirements.',
    },
    {
      label: 'Customs and origin file',
      details:
        'Each order should maintain classification, origin evidence, supplier records, commercial invoice, packing list, and shipment terms.',
    },
    {
      label: 'Data handling',
      details:
        'Buyer and supplier contact details should be collected only when needed and handled under GDPR-minded retention and access practices.',
    },
  ];

  protected readonly sourceLinks: readonly SourceLink[] = [
    {
      label: 'EU-India agreements',
      href: 'https://policy.trade.ec.europa.eu/eu-trade-relationships-country-and-region/countries-and-regions/india/eu-india-agreements_en',
    },
    {
      label: 'Published agreement texts',
      href: 'https://policy.trade.ec.europa.eu/eu-trade-relationships-country-and-region/countries-and-regions/india/eu-india-agreements/text-agreements_en',
    },
    {
      label: 'FTA benefits factsheet',
      href: 'https://policy.trade.ec.europa.eu/eu-trade-relationships-country-and-region/countries-and-regions/india/eu-india-agreements/factsheet-eu-india-free-trade-agreement-main-benefits_en',
    },
  ];

  protected toggleChecklist(): void {
    this.showChecklist = !this.showChecklist;
  }
}
