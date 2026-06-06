import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { PolicyApiService } from './policy-api.service';
import { environment } from '../../../environments/environment';

const BASE = `${environment.apiUrl}/policies`;

describe('PolicyApiService', () => {
  let service: PolicyApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PolicyApiService,
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service   = TestBed.inject(PolicyApiService);
    httpMock  = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  describe('getPolicies', () => {
    it('sends GET to /policies and returns the response', () => {
      const mockPolicies = [{ id: 'p1', policyNumber: 'POL-001' }];
      service.getPolicies().subscribe(result => {
        expect(result).toEqual(mockPolicies as any);
      });
      const req = httpMock.expectOne(BASE);
      expect(req.request.method).toBe('GET');
      req.flush(mockPolicies);
    });
  });

  describe('flagPolicy', () => {
    it('sends PATCH to /policies/:id with flaggedForReview: true', () => {
      service.flagPolicy('p1').subscribe();
      const req = httpMock.expectOne(`${BASE}/p1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ flaggedForReview: true });
      req.flush({ id: 'p1', flaggedForReview: true });
    });
  });

  describe('renewPolicy', () => {
    it('sends PATCH to /policies/:id with status: Active', () => {
      service.renewPolicy('p2').subscribe();
      const req = httpMock.expectOne(`${BASE}/p2`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ status: 'Active' });
      req.flush({ id: 'p2', status: 'Active' });
    });
  });
});
