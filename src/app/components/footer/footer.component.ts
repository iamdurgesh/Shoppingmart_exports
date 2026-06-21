import { Component, HostListener, OnInit } from '@angular/core';
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
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  }

  private updateScrollToTopVisibility(): void {
    this.isScrollToTopVisible = window.scrollY > 360;
  }
}
