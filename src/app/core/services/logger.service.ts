import { Injectable, isDevMode } from '@angular/core';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Centralised logging service.
 * - Debug/info messages are suppressed in production.
 * - Can be extended to forward to a remote logging backend (Datadog, Splunk, etc.)
 */
@Injectable({ providedIn: 'root' })
export class LoggerService {
  private readonly prefix = '[PolicyHub]';

  debug(message: string, ...args: unknown[]): void {
    if (isDevMode()) console.debug(`${this.prefix} ${message}`, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    if (isDevMode()) console.info(`${this.prefix} ${message}`, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(`${this.prefix} ${message}`, ...args);
  }

  error(message: string, error?: unknown): void {
    console.error(`${this.prefix} ${message}`, error ?? '');
  }
}
