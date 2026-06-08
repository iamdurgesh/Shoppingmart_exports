import { Component } from '@angular/core';

interface HeroMetric {
  readonly label: string;
  readonly value: string;
}

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent {
  protected readonly metrics: readonly HeroMetric[] = [
    { label: 'End-to-end', value: 'Sourcing support' },
    { label: 'EU-aware', value: 'Trade readiness' },
    { label: 'Fast', value: 'Quote preparation' },
  ];

  protected playHeroVideo(event: Event): void {
    const video = event.currentTarget;

    if (!(video instanceof HTMLVideoElement)) {
      return;
    }

    video.muted = true;
    video.defaultMuted = true;
    video.play().catch(() => {
      // Keep the poster image visible when a browser or device blocks autoplay.
    });
  }
}
