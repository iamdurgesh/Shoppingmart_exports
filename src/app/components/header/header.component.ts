import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, computed, HostListener, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { BrandLogoComponent } from '../brand-logo/brand-logo.component';
import { LanguageService } from '../../i18n/language.service';
import { isSupportedLanguage } from '../../i18n/i18n.constants';

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
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly translocoService = inject(TranslocoService);

  protected readonly navItems: readonly NavItem[] = [
    { labelKey: 'nav.products', routerLink: '/', fragment: 'products' },
    { labelKey: 'nav.customSourcing', routerLink: '/products/custom-sourcing' },
    { labelKey: 'nav.process', routerLink: '/', fragment: 'process' },
    { labelKey: 'nav.compliance', routerLink: '/compliance' },
    { labelKey: 'nav.quote', routerLink: '/', fragment: 'quote' },
    { labelKey: 'nav.contact', routerLink: '/contact' },
  ];
  protected readonly languages = this.languageService.languages;
  protected readonly activeLanguage = toSignal(this.translocoService.langChanges$, {
    initialValue: this.languageService.activeLanguage,
  });
  protected readonly activeLanguageOption = computed(() =>
    this.languages.find((language) => language.code === this.activeLanguage()) ?? this.languages[0],
  );

  protected isLanguageMenuOpen = false;
  protected isMenuOpen = false;
  protected isScrolled = false;

  ngOnInit(): void {
    this.updateScrolledState();
  }

  @HostListener('window:scroll')
  protected onWindowScroll(): void {
    this.updateScrolledState();
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    const target = event.target;

    if (!(target instanceof Element) || !target.closest('.language-switcher')) {
      this.closeLanguageMenu();
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscapeKey(): void {
    this.closeLanguageMenu();
  }

  private updateScrolledState(): void {
    if (!this.isBrowser) {
      return;
    }

    this.isScrolled = window.scrollY > 18;
  }

  protected toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    this.closeLanguageMenu();
    this.document.body.classList.toggle('nav-open', this.isMenuOpen);
  }

  protected closeMenu(): void {
    this.isMenuOpen = false;
    this.closeLanguageMenu();
    this.document.body.classList.remove('nav-open');
  }

  protected toggleLanguageMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isLanguageMenuOpen = !this.isLanguageMenuOpen;
  }

  protected closeLanguageMenu(): void {
    this.isLanguageMenuOpen = false;
  }

  protected selectLanguage(language: string): void {
    if (!isSupportedLanguage(language)) {
      return;
    }

    this.languageService.setLanguage(language);
    this.closeLanguageMenu();
  }
}
