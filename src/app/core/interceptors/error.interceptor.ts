import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { LoggerService } from '../services/logger.service';

/**
 * Global HTTP error interceptor.
 * Converts raw HttpErrorResponse into user-friendly Error objects and logs
 * every failed request via LoggerService so callers receive a consistent Error.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(LoggerService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const message =
        error.status === 0
          ? 'Network error — please check your connection and try again.'
          : `Server error (HTTP ${error.status}): ${error.statusText || 'Unknown error'}`;

      logger.error(`[HTTP] ${req.method} ${req.urlWithParams}`, message);

      return throwError(() => new Error(message));
    })
  );
};
