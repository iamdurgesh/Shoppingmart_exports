import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { afterNextRender, inject, Injectable, PLATFORM_ID } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

import {
  getInitialLanguage,
  isSupportedLanguage,
  LANGUAGE_OPTIONS,
  persistLanguage,
  type SupportedLanguage,
} from './i18n.constants';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly translocoService = inject(TranslocoService);

  readonly languages = LANGUAGE_OPTIONS;

  constructor() {
    const preferredLanguage = this.isBrowser ? getInitialLanguage() : 'en';

    // The static document is rendered in English. The browser must start from
    // the same state for hydration, then it can restore the saved preference.
    this.applyLanguage('en', false);

    afterNextRender(() => {
      if (this.isBrowser && preferredLanguage !== 'en') {
        this.setLanguage(preferredLanguage);
      }
    });
  }

  get activeLanguage(): SupportedLanguage {
    const activeLanguage = this.translocoService.getActiveLang();
    return isSupportedLanguage(activeLanguage) ? activeLanguage : 'en';
  }

  setLanguage(language: SupportedLanguage): void {
    this.applyLanguage(language, true);
  }

  private applyLanguage(language: SupportedLanguage, persist: boolean): void {
    this.translocoService.setActiveLang(language);
    this.document.documentElement.lang = language;

    if (persist) {
      persistLanguage(language);
    }
  }
}
