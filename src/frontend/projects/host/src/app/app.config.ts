import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { UserContextService } from '@fiap/shared-context';
import { routes } from './app.routes';
import { provideStoreApollo } from './apollo.provider';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch()),
    provideRouter(routes),
    provideStoreApollo(),
    provideAppInitializer(() => inject(UserContextService).hydrate().catch(() => null)),
  ],
};
