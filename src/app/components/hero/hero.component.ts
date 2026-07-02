import {
  afterNextRender,
  Component,
  ElementRef,
  viewChild,
} from '@angular/core';
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

  private readonly heroVideo = viewChild<ElementRef<HTMLVideoElement>>('heroVideo');

  constructor() {
    // Load the decorative background video in the browser only, after the first
    // paint. Skipped on small screens and data-saver connections so the poster
    // image stays the Largest Contentful Paint and no heavy video is fetched.
    afterNextRender(() => this.loadHeroVideo());
  }

  private loadHeroVideo(): void {
    const video = this.heroVideo()?.nativeElement;

    if (!video || !this.shouldLoadVideo()) {
      return;
    }

    const start = (): void => {
      video.load();
      video.muted = true;
      video.defaultMuted = true;
      video
        .play()
        .then(() => video.classList.add('is-playing'))
        .catch(() => {
          // Autoplay blocked: keep the poster image visible.
        });
    };

    // Defer until the page is idle so the video never competes with the
    // critical hero paint.
    const idle = (
      window as unknown as {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => void;
      }
    ).requestIdleCallback;

    if (typeof idle === 'function') {
      idle(start, { timeout: 3000 });
    } else {
      setTimeout(start, 1200);
    }
  }

  private shouldLoadVideo(): boolean {
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;

    if (connection?.saveData) {
      return false;
    }

    return window.matchMedia('(min-width: 641px)').matches;
  }
}
