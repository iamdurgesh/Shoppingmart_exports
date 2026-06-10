import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { LanguageService } from './i18n/language.service';
import { SeoI18nService } from './i18n/seo-i18n.service';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, RouterOutlet, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly languageService = inject(LanguageService);
  private readonly seoI18nService = inject(SeoI18nService);

  constructor() {
    void this.languageService.activeLanguage;
    this.seoI18nService.start();
  }
}
