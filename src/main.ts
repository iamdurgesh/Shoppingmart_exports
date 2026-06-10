import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { isDevMode } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideTransloco, translocoConfig } from '@jsverse/transloco';

import { AppComponent } from './app/app.component';
import { getInitialLanguage, SUPPORTED_LANGUAGES } from './app/i18n/i18n.constants';
import { TranslocoHttpLoader } from './app/i18n/transloco-loader';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled',
      }),
    ),
    provideTransloco({
      config: translocoConfig({
        availableLangs: [...SUPPORTED_LANGUAGES],
        defaultLang: getInitialLanguage(),
        fallbackLang: 'en',
        prodMode: !isDevMode(),
        reRenderOnLangChange: true,
      }),
      loader: TranslocoHttpLoader,
    }),
  ],
}).catch((error) => console.error(error));
