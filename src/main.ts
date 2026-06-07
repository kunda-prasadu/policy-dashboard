import { bootstrapApplication } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localeEnGb from '@angular/common/locales/en-GB';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Register en-GB locale data so Angular's i18n pipes (DatePipe, CurrencyPipe,
// DecimalPipe) format numbers and dates correctly for APAC English operations.
registerLocaleData(localeEnGb);

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
