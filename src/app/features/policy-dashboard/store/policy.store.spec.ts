import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';
import { PolicyStore } from './policy.store';
import { PolicyApiService } from '../services/policy-api.service';
import { Policy } from '../models/policy.model';

// ── Helpers ────────────────────────────────────────────────────────────────────

function makePolicy(overrides: Partial<Policy> = {}): Policy {
  return {
    id: 'p1',
    policyNumber: 'POL-001',
    policyHolderName: 'Acme Corp',
    lineOfBusiness: 'Property',
    status: 'Active',
    premiumAmount: 50_000,
    currency: 'USD',
    region: 'Singapore',
    effectiveDate: new Date('2025-01-01'),
    expiryDate: new Date('2026-12-31'),
    underwriter: 'John Smith',
    flaggedForReview: false,
    ...overrides,
  };
}

function daysFromToday(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

const mockApiService = {
  getPolicies: jasmine.createSpy('getPolicies').and.returnValue(of([])),
  flagPolicy:  jasmine.createSpy('flagPolicy').and.returnValue(of({})),
  renewPolicy: jasmine.createSpy('renewPolicy').and.returnValue(of({})),
};

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('PolicyStore', () => {
  let store: PolicyStore;

  beforeEach(() => {
    mockApiService.getPolicies.calls.reset();
    mockApiService.flagPolicy.calls.reset();
    mockApiService.renewPolicy.calls.reset();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        PolicyStore,
        { provide: PolicyApiService, useValue: mockApiService },
      ],
    });
    store = TestBed.inject(PolicyStore);
  });

  // ── filteredPolicies ─────────────────────────────────────────────────────────

  describe('filteredPolicies', () => {
    it('returns all policies when no filters are set', () => {
      const policies = [makePolicy({ id: 'p1' }), makePolicy({ id: 'p2' })];
      store.policies.set(policies);
      expect(store.filteredPolicies().length).toBe(2);
    });

    it('filters by searchTerm matching policyNumber', () => {
      store.policies.set([
        makePolicy({ id: 'p1', policyNumber: 'POL-ALPHA-001' }),
        makePolicy({ id: 'p2', policyNumber: 'POL-BETA-002' }),
      ]);
      store.updateFilters({ searchTerm: 'alpha' });
      const result = store.filteredPolicies();
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('p1');
    });

    it('filters by searchTerm matching policyHolderName (case-insensitive)', () => {
      store.policies.set([
        makePolicy({ id: 'p1', policyHolderName: 'Acme Corp' }),
        makePolicy({ id: 'p2', policyHolderName: 'Global Risk Ltd' }),
      ]);
      store.updateFilters({ searchTerm: 'GLOBAL' });
      expect(store.filteredPolicies()[0].id).toBe('p2');
    });

    it('filters by searchTerm matching underwriter', () => {
      store.policies.set([
        makePolicy({ id: 'p1', underwriter: 'Alice Wong' }),
        makePolicy({ id: 'p2', underwriter: 'Bob Lee' }),
      ]);
      store.updateFilters({ searchTerm: 'alice' });
      expect(store.filteredPolicies()[0].id).toBe('p1');
    });

    it('filters by status', () => {
      store.policies.set([
        makePolicy({ id: 'p1', status: 'Active' }),
        makePolicy({ id: 'p2', status: 'Expired' }),
        makePolicy({ id: 'p3', status: 'Pending' }),
      ]);
      store.updateFilters({ status: 'Expired' });
      const result = store.filteredPolicies();
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('p2');
    });

    it('returns all policies when status filter is empty string', () => {
      store.policies.set([makePolicy({ status: 'Active' }), makePolicy({ id: 'p2', status: 'Cancelled' })]);
      store.updateFilters({ status: '' });
      expect(store.filteredPolicies().length).toBe(2);
    });

    it('filters by region', () => {
      store.policies.set([
        makePolicy({ id: 'p1', region: 'Singapore' }),
        makePolicy({ id: 'p2', region: 'Japan' }),
      ]);
      store.updateFilters({ region: 'Japan' });
      expect(store.filteredPolicies()[0].id).toBe('p2');
    });

    it('filters by lineOfBusiness', () => {
      store.policies.set([
        makePolicy({ id: 'p1', lineOfBusiness: 'Property' }),
        makePolicy({ id: 'p2', lineOfBusiness: 'Marine' }),
      ]);
      store.updateFilters({ lineOfBusiness: 'Marine' });
      expect(store.filteredPolicies()[0].id).toBe('p2');
    });

    it('filters by minPremium — excludes below threshold', () => {
      store.policies.set([
        makePolicy({ id: 'p1', premiumAmount: 10_000 }),
        makePolicy({ id: 'p2', premiumAmount: 100_000 }),
        makePolicy({ id: 'p3', premiumAmount: 50_000 }),
      ]);
      store.updateFilters({ minPremium: 50_000 });
      const result = store.filteredPolicies();
      expect(result.length).toBe(2);
      expect(result.map(p => p.id)).toEqual(jasmine.arrayContaining(['p2', 'p3']));
    });

    it('applies multiple filters combined (AND logic)', () => {
      store.policies.set([
        makePolicy({ id: 'p1', status: 'Active',  region: 'Singapore', premiumAmount: 80_000 }),
        makePolicy({ id: 'p2', status: 'Active',  region: 'Japan',     premiumAmount: 80_000 }),
        makePolicy({ id: 'p3', status: 'Expired', region: 'Singapore', premiumAmount: 80_000 }),
        makePolicy({ id: 'p4', status: 'Active',  region: 'Singapore', premiumAmount: 5_000  }),
      ]);
      store.updateFilters({ status: 'Active', region: 'Singapore', minPremium: 50_000 });
      const result = store.filteredPolicies();
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('p1');
    });

    it('filters by startDate — excludes policies expiring before it', () => {
      store.policies.set([
        makePolicy({ id: 'p1', expiryDate: new Date('2025-01-01') }),
        makePolicy({ id: 'p2', expiryDate: new Date('2027-06-01') }),
      ]);
      store.updateFilters({ startDate: new Date('2026-01-01') });
      expect(store.filteredPolicies().length).toBe(1);
      expect(store.filteredPolicies()[0].id).toBe('p2');
    });

    it('filters by endDate — excludes policies expiring after it', () => {
      store.policies.set([
        makePolicy({ id: 'p1', expiryDate: new Date('2025-03-01') }),
        makePolicy({ id: 'p2', expiryDate: new Date('2027-12-31') }),
      ]);
      store.updateFilters({ endDate: new Date('2026-01-01') });
      expect(store.filteredPolicies().length).toBe(1);
      expect(store.filteredPolicies()[0].id).toBe('p1');
    });
  });

  // ── summary ──────────────────────────────────────────────────────────────────

  describe('summary', () => {
    it('counts policies by status correctly', () => {
      store.policies.set([
        makePolicy({ id: 'p1', status: 'Active' }),
        makePolicy({ id: 'p2', status: 'Active' }),
        makePolicy({ id: 'p3', status: 'Pending' }),
        makePolicy({ id: 'p4', status: 'Expired' }),
        makePolicy({ id: 'p5', status: 'Cancelled' }),
      ]);
      const s = store.summary();
      expect(s.activeCount).toBe(2);
      expect(s.pendingCount).toBe(1);
      expect(s.expiredCount).toBe(1);
      expect(s.cancelledCount).toBe(1);
    });

    it('calculates totalGwp as sum of all LOB premiums', () => {
      store.policies.set([
        makePolicy({ lineOfBusiness: 'Property', premiumAmount: 100_000 }),
        makePolicy({ id: 'p2', lineOfBusiness: 'Casualty', premiumAmount: 200_000 }),
        makePolicy({ id: 'p3', lineOfBusiness: 'A&H',      premiumAmount: 50_000  }),
        makePolicy({ id: 'p4', lineOfBusiness: 'Marine',   premiumAmount: 75_000  }),
      ]);
      expect(store.summary().totalGwp).toBe(425_000);
    });

    it('counts expiringWithin30Days correctly', () => {
      store.policies.set([
        makePolicy({ id: 'p1', expiryDate: daysFromToday(10) }),   // within 30
        makePolicy({ id: 'p2', expiryDate: daysFromToday(25) }),   // within 30
        makePolicy({ id: 'p3', expiryDate: daysFromToday(45) }),   // outside
        makePolicy({ id: 'p4', expiryDate: daysFromToday(-5) }),   // already expired
      ]);
      expect(store.summary().expiringWithin30Days).toBe(2);
    });

    it('returns zero counts when policies list is empty', () => {
      store.policies.set([]);
      const s = store.summary();
      expect(s.activeCount).toBe(0);
      expect(s.totalGwp).toBe(0);
      expect(s.expiringWithin30Days).toBe(0);
    });
  });

  // ── selection ────────────────────────────────────────────────────────────────

  describe('selection', () => {
    it('toggleSelection adds an id when not selected', () => {
      store.toggleSelection('p1');
      expect(store.selectedPolicyIds()).toContain('p1');
    });

    it('toggleSelection removes an id when already selected', () => {
      store.toggleSelection('p1');
      store.toggleSelection('p1');
      expect(store.selectedPolicyIds()).not.toContain('p1');
    });

    it('selectAll sets all provided ids', () => {
      store.selectAll(['p1', 'p2', 'p3']);
      expect(store.selectedPolicyIds()).toEqual(['p1', 'p2', 'p3']);
    });

    it('clearSelection empties the selection', () => {
      store.selectAll(['p1', 'p2']);
      store.clearSelection();
      expect(store.selectedPolicyIds().length).toBe(0);
    });

    it('selectedCount reflects current selection length', () => {
      store.selectAll(['p1', 'p2', 'p3']);
      expect(store.selectedCount()).toBe(3);
    });

    it('hasSelection is true when selection is non-empty', () => {
      store.toggleSelection('p1');
      expect(store.hasSelection()).toBeTrue();
    });

    it('hasSelection is false when selection is empty', () => {
      expect(store.hasSelection()).toBeFalse();
    });
  });

  // ── flagSelectedPolicies ─────────────────────────────────────────────────────

  describe('flagSelectedPolicies', () => {
    it('sets flaggedForReview=true on selected policies (optimistic)', () => {
      store.policies.set([
        makePolicy({ id: 'p1', flaggedForReview: false }),
        makePolicy({ id: 'p2', flaggedForReview: false }),
      ]);
      store.selectAll(['p1']);
      store.flagSelectedPolicies();
      expect(store.policies().find(p => p.id === 'p1')?.flaggedForReview).toBeTrue();
      expect(store.policies().find(p => p.id === 'p2')?.flaggedForReview).toBeFalse();
    });

    it('clears selection after flagging', () => {
      store.policies.set([makePolicy({ id: 'p1' })]);
      store.selectAll(['p1']);
      store.flagSelectedPolicies();
      expect(store.selectedPolicyIds().length).toBe(0);
    });

    it('calls flagPolicy on the API service for each selected id', () => {
      store.policies.set([makePolicy({ id: 'p1' }), makePolicy({ id: 'p2' })]);
      store.selectAll(['p1', 'p2']);
      store.flagSelectedPolicies();
      expect(mockApiService.flagPolicy).toHaveBeenCalledWith('p1');
      expect(mockApiService.flagPolicy).toHaveBeenCalledWith('p2');
    });
  });

  // ── renewPolicy ──────────────────────────────────────────────────────────────

  describe('renewPolicy', () => {
    it('sets status to Active on the target policy (optimistic)', () => {
      store.policies.set([
        makePolicy({ id: 'p1', status: 'Expired' }),
        makePolicy({ id: 'p2', status: 'Cancelled' }),
      ]);
      store.renewPolicy('p1');
      expect(store.policies().find(p => p.id === 'p1')?.status).toBe('Active');
      expect(store.policies().find(p => p.id === 'p2')?.status).toBe('Cancelled');
    });

    it('calls renewPolicy on the API service with the correct id', () => {
      store.policies.set([makePolicy({ id: 'p1' })]);
      store.renewPolicy('p1');
      expect(mockApiService.renewPolicy).toHaveBeenCalledWith('p1');
    });
  });

  // ── updateFilters ────────────────────────────────────────────────────────────

  describe('updateFilters', () => {
    it('merges partial filter without wiping existing fields', () => {
      store.updateFilters({ status: 'Active' });
      store.updateFilters({ region: 'Japan' });
      const f = store.filters();
      expect(f.status).toBe('Active');
      expect(f.region).toBe('Japan');
    });
  });
});
