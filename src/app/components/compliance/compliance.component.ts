import { Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

interface ComplianceCard {
  readonly titleKey: string;
  readonly descriptionKey: string;
}

@Component({
  selector: 'app-compliance',
  imports: [TranslocoPipe],
  templateUrl: './compliance.component.html',
  styleUrl: './compliance.component.scss',
})
export class ComplianceComponent {
  protected readonly complianceCards: readonly ComplianceCard[] = [
    {
      titleKey: 'compliance.cards.gdpr.title',
      descriptionKey: 'compliance.cards.gdpr.description',
    },
    {
      titleKey: 'compliance.cards.origin.title',
      descriptionKey: 'compliance.cards.origin.description',
    },
    {
      titleKey: 'compliance.cards.readiness.title',
      descriptionKey: 'compliance.cards.readiness.description',
    },
  ];

  protected showTradeDetails = false;

  protected toggleTradeDetails(): void {
    this.showTradeDetails = !this.showTradeDetails;
  }
}
