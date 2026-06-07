import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideAnimationsAsync(),
    // withFetch: uses native Fetch API instead of XHR — better HTTP/2 & streaming support
    provideHttpClient(withFetch()),
    // PreloadAllModules: starts downloading lazy chunks in the background after initial load
    provideRouter(routes, withPreloading(PreloadAllModules)),
  ]
};
