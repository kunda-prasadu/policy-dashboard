import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideAnimationsAsync(),
    // Internationalisation: default locale for APAC English operations.
    // Swap to a runtime value (e.g. from user profile / environment) to support
    // multi-locale deployments without rebuilding.
    { provide: LOCALE_ID, useValue: 'en-GB' },
    provideHttpClient(withFetch()),
    // PreloadAllModules: starts downloading lazy chunks in the background after initial load
    provideRouter(routes, withPreloading(PreloadAllModules)),
  ]
};
