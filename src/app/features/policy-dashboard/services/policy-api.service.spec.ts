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
    it('sends GET to /policies with no params when called without filters', () => {
      const mockPolicies = [{ id: 'p1', policyNumber: 'POL-001' }];
      service.getPolicies().subscribe(result => {
        expect(result).toEqual(mockPolicies as any);
      });
      const req = httpMock.expectOne(r => r.url === BASE);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush(mockPolicies);
    });

    it('sends status, region, lineOfBusiness, premiumAmount_gte as query params', () => {
      service.getPolicies({
        status: 'Active',
        region: 'Singapore',
        lineOfBusiness: 'Property',
        minPremium: 50_000,
      }).subscribe();
      const req = httpMock.expectOne(r => r.url === BASE);
      expect(req.request.params.get('status')).toBe('Active');
      expect(req.request.params.get('region')).toBe('Singapore');
      expect(req.request.params.get('lineOfBusiness')).toBe('Property');
      expect(req.request.params.get('premiumAmount_gte')).toBe('50000');
      req.flush([]);
    });

    it('omits params when filter values are empty or zero', () => {
      service.getPolicies({ status: '', region: '', lineOfBusiness: '', minPremium: 0 }).subscribe();
      const req = httpMock.expectOne(r => r.url === BASE);
      expect(req.request.params.keys().length).toBe(0);
      req.flush([]);
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
