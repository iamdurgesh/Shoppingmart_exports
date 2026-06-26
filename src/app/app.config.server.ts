import { inject, mergeApplicationConfig, provideAppInitializer, type ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { provideTranslocoLoader, TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';

import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { TranslocoServerLoader } from './i18n/transloco-server-loader';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    provideTranslocoLoader(TranslocoServerLoader),
    provideAppInitializer(() => {
      const translocoService = inject(TranslocoService);
      return firstValueFrom(translocoService.load(translocoService.getActiveLang()));
    }),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
