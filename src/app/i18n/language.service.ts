import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
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
  private readonly translocoService = inject(TranslocoService);

  readonly languages = LANGUAGE_OPTIONS;

  constructor() {
    this.setLanguage(getInitialLanguage());
    this.translocoService.langChanges$.subscribe((language) => {
      if (isSupportedLanguage(language)) {
        this.document.documentElement.lang = language;
        persistLanguage(language);
      }
    });
  }

  get activeLanguage(): SupportedLanguage {
    const activeLanguage = this.translocoService.getActiveLang();
    return isSupportedLanguage(activeLanguage) ? activeLanguage : 'en';
  }

  setLanguage(language: SupportedLanguage): void {
    this.translocoService.setActiveLang(language);
    this.document.documentElement.lang = language;
    persistLanguage(language);
  }
}
