import { isPlatformBrowser } from '@angular/common';
import { Component, HostListener, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { BrandLogoComponent } from '../brand-logo/brand-logo.component';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, BrandLogoComponent, TranslocoPipe],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent implements OnInit {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly currentYear = new Date().getFullYear();
  protected isScrollToTopVisible = false;

  ngOnInit(): void {
    this.updateScrollToTopVisibility();
  }

  @HostListener('window:scroll')
  protected onWindowScroll(): void {
    this.updateScrollToTopVisibility();
  }

  protected scrollToTop(): void {
    if (!this.isBrowser) {
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  }

  private updateScrollToTopVisibility(): void {
    if (!this.isBrowser) {
      return;
    }

    this.isScrollToTopVisible = window.scrollY > 360;
  }
}
