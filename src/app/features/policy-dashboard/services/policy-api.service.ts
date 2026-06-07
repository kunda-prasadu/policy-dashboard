import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Policy } from '../models/policy.model';
import { PolicyFilter } from '../models/policy-filter.model';

@Injectable({
  providedIn: 'root'
})
export class PolicyApiService {
private readonly http = inject(HttpClient);

private readonly baseUrl = `${environment.apiUrl}/policies`;

/**
 * Fetches policies from the server. Enum-type filters (status, region,
 * lineOfBusiness) and minPremium are sent as query params so the server
 * narrows the result set. Free-text search and date range are handled
 * client-side because JSON Server v1 lacks cross-field OR search and
 * reliable ISO-date range comparison.
 */
getPolicies(filters?: Partial<PolicyFilter>): Observable<Policy[]> {
  let params = new HttpParams();
  if (filters?.status)         params = params.set('status',           filters.status);
  if (filters?.region)         params = params.set('region',           filters.region);
  if (filters?.lineOfBusiness) params = params.set('lineOfBusiness',   filters.lineOfBusiness);
  if (filters?.minPremium)     params = params.set('premiumAmount_gte', String(filters.minPremium));
  return this.http.get<Policy[]>(this.baseUrl, { params });
}

flagPolicy(id: string): Observable<Policy> {
  return this.http.patch<Policy>(`${this.baseUrl}/${id}`, { flaggedForReview: true });
}

renewPolicy(id: string): Observable<Policy> {
  return this.http.patch<Policy>(`${this.baseUrl}/${id}`, { status: 'Active' });
}
}