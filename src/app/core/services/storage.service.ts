import { Injectable } from '@angular/core';

/**
 * Encapsulates all browser localStorage access.
 * A single seam for swapping storage backends (e.g. sessionStorage, IndexedDB)
 * and for testing (no scattered `localStorage` calls in components/services).
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Quota exceeded or private mode — fail silently
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }

  /** Remove all app-managed keys from localStorage. */
  clearAll(): void {
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
  }
}
