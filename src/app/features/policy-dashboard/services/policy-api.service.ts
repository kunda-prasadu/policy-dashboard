import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Policy } from '../models/policy.model';

@Injectable({
  providedIn: 'root'
})
export class PolicyApiService {
private readonly http = inject(HttpClient);

private readonly baseUrl = `${environment.apiUrl}/policies`;

getPolicies(): Observable<Policy[]> {
  return this.http.get<Policy[]>(this.baseUrl);    
}

flagPolicy(id: string): Observable<Policy> {
  return this.http.patch<Policy>(`${this.baseUrl}/${id}`, { flaggedForReview: true });
}
}