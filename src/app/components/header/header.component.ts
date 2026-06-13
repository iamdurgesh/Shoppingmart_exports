import { DOCUMENT } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { BrandLogoComponent } from '../brand-logo/brand-logo.component';
import { LanguageService } from '../../i18n/language.service';
import { type SupportedLanguage } from '../../i18n/i18n.constants';

interface NavItem {
  readonly labelKey: string;
  readonly routerLink: string;
  readonly fragment?: string;
}

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, BrandLogoComponent, TranslocoPipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  private readonly document = inject(DOCUMENT);
  private readonly languageService = inject(LanguageService);
  private readonly translocoService = inject(TranslocoService);

  protected readonly navItems: readonly NavItem[] = [
    { labelKey: 'nav.products', routerLink: '/', fragment: 'products' },
    { label: 'Custom Sourcing', routerLink: '/products/custom-sourcing' },
    { labelKey: 'nav.process', routerLink: '/', fragment: 'process' },
    { labelKey: 'nav.compliance', routerLink: '/compliance' },
    { labelKey: 'nav.quote', routerLink: '/', fragment: 'quote' },
    { labelKey: 'nav.contact', routerLink: '/contact' },
  ];
  protected readonly languages = this.languageService.languages;
  protected readonly activeLanguage = toSignal(this.translocoService.langChanges$, {
    initialValue: this.languageService.activeLanguage,
  });

  protected isMenuOpen = false;
  protected isScrolled = false;

  ngOnInit(): void {
    this.updateScrolledState();
  }

  @HostListener('window:scroll')
  protected onWindowScroll(): void {
    this.updateScrolledState();
  }

  private updateScrolledState(): void {
    this.isScrolled = window.scrollY > 18;
  }

  protected toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    this.document.body.classList.toggle('nav-open', this.isMenuOpen);
  }

  protected closeMenu(): void {
    this.isMenuOpen = false;
    this.document.body.classList.remove('nav-open');
  }

  protected selectLanguage(language: SupportedLanguage): void {
    this.languageService.setLanguage(language);
  }
}
