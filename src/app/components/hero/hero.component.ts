import { Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

interface HeroMetric {
  readonly labelKey: string;
  readonly valueKey: string;
}

@Component({
  selector: 'app-hero',
  imports: [TranslocoPipe],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent {
  protected readonly metrics: readonly HeroMetric[] = [
    { labelKey: 'hero.metrics.endToEnd.label', valueKey: 'hero.metrics.endToEnd.value' },
    { labelKey: 'hero.metrics.euAware.label', valueKey: 'hero.metrics.euAware.value' },
    { labelKey: 'hero.metrics.fast.label', valueKey: 'hero.metrics.fast.value' },
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
