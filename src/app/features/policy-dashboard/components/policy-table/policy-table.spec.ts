import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { PolicyTable } from './policy-table';
import { PolicyStore } from '../../store/policy.store';
import { Policy } from '../../models/policy.model';

function makePolicy(overrides: Partial<Policy> = {}): Policy {
  return {
    id: 'p1', policyNumber: 'POL-001', policyHolderName: 'Acme Corp',
    lineOfBusiness: 'Property', status: 'Active', premiumAmount: 50_000,
    currency: 'USD', region: 'Singapore',
    effectiveDate: new Date('2025-01-01'), expiryDate: new Date('2027-01-01'),
    underwriter: 'John Smith', flaggedForReview: false,
    ...overrides,
  };
}

describe('PolicyTable', () => {
  let component: PolicyTable;
  let fixture: ComponentFixture<PolicyTable>;
  let store: PolicyStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolicyTable],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAnimationsAsync(),
      ],
    }).compileComponents();

    store   = TestBed.inject(PolicyStore);
    fixture = TestBed.createComponent(PolicyTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── formatPremium ────────────────────────────────────────────────────────────

  describe('formatPremium', () => {
    it('formats values >= 1_000_000 as $xM', () => {
      expect(component.formatPremium(1_500_000, 'USD')).toBe('$1.5M');
      expect(component.formatPremium(2_000_000, 'USD')).toBe('$2.0M');
    });

    it('formats values >= 1_000 as $xK', () => {
      expect(component.formatPremium(250_000, 'USD')).toBe('$250K');
      expect(component.formatPremium(1_000, 'USD')).toBe('$1K');
    });

    it('formats values < 1_000 as plain $x', () => {
      expect(component.formatPremium(999, 'USD')).toBe('$999');
      expect(component.formatPremium(0, 'USD')).toBe('$0');
    });
  });

  // ── toggleSelectAll ──────────────────────────────────────────────────────────

  describe('toggleSelectAll', () => {
    beforeEach(() => {
      store.policies.set([
        makePolicy({ id: 'p1', policyNumber: 'POL-001' }),
        makePolicy({ id: 'p2', policyNumber: 'POL-002' }),
        makePolicy({ id: 'p3', policyNumber: 'POL-003' }),
      ]);
      component.dataSource.data = store.filteredPolicies();
      fixture.detectChanges();
    });

    it('calls store.selectAll with page ids when not all are selected', () => {
      store.clearSelection();
      const selectAllSpy = spyOn(store, 'selectAll');
      component.toggleSelectAll();
      expect(selectAllSpy).toHaveBeenCalledWith(['p1', 'p2', 'p3']);
    });

    it('calls store.clearSelection when all page ids are already selected', () => {
      store.selectAll(['p1', 'p2', 'p3']);
      const clearSpy = spyOn(store, 'clearSelection');
      component.toggleSelectAll();
      expect(clearSpy).toHaveBeenCalled();
    });
  });
});
