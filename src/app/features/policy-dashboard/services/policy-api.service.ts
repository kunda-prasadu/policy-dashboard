import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, forkJoin, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Policy } from '../models/policy.model';
import { PolicyFilter } from '../models/policy-filter.model';
import { SortState } from '../models/sort.model';
import { LoggerService } from '../../../core/services/logger.service';

@Injectable({
  providedIn: 'root'
})
export class PolicyApiService {
private readonly http = inject(HttpClient);
private readonly logger = inject(LoggerService);

private readonly baseUrl = `${environment.apiUrl}/policies`;

/**
 * Fetches policies from the server. Enum-type filters (status, region,
 * lineOfBusiness) and minPremium are sent as query params so the server
 * narrows the result set. Free-text search and date range are handled
 * client-side because JSON Server v1 lacks cross-field OR search and
 * reliable ISO-date range comparison.
 */
getPolicies(filters?: Partial<PolicyFilter>, sort?: SortState): Observable<Policy[]> {
  let params = new HttpParams();
  if (filters?.status)         params = params.set('status',           filters.status);
  if (filters?.region)         params = params.set('region',           filters.region);
  if (filters?.lineOfBusiness) params = params.set('lineOfBusiness',   filters.lineOfBusiness);
  if (filters?.minPremium)     params = params.set('premiumAmount_gte', String(filters.minPremium));
  // Server-side sort: JSON Server v1 uses _sort / _order query params
  if (sort?.active && sort?.direction) {
    params = params.set('_sort',  sort.active);
    params = params.set('_order', sort.direction);
  }
  return this.http.get<Policy[]>(this.baseUrl, { params });
}

flagPolicy(id: string): Observable<Policy> {
  return this.http.patch<Policy>(`${this.baseUrl}/${id}`, { flaggedForReview: true }).pipe(
    catchError((err: HttpErrorResponse) => {
      this.logger.error(`Failed to flag policy ${id}`, err);
      return throwError(() => new Error(err.error?.message || err.statusText || 'Failed to flag policy'));
    })
  );
}

/**
 * Flags multiple policies in parallel. Uses forkJoin so a single subscription
 * in the store can handle success/failure for the entire batch.
 */
flagPolicies(ids: string[]): Observable<Policy[]> {
  return forkJoin(ids.map(id => this.flagPolicy(id)));
}

renewPolicy(id: string): Observable<Policy> {
  return this.http.patch<Policy>(`${this.baseUrl}/${id}`, { status: 'Active' });
}
}