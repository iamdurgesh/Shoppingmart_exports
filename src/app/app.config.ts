import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideTransloco, translocoConfig } from '@jsverse/transloco';

import { getInitialLanguage, SUPPORTED_LANGUAGES } from './i18n/i18n.constants';
import { TranslocoHttpLoader } from './i18n/transloco-loader';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
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
};
