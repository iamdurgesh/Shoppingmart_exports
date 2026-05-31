import { Component } from '@angular/core';

interface HeroMetric {
  readonly label: string;
  readonly value: string;
}

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css',
})
export class HeroComponent {
  protected readonly metrics: readonly HeroMetric[] = [
    { label: 'End-to-end', value: 'Sourcing support' },
    { label: 'EU-aware', value: 'Trade readiness' },
    { label: 'Fast', value: 'Quote preparation' },
  ];
}
