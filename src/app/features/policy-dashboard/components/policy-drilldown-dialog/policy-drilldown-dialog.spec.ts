import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PolicyDrilldownDialog } from './policy-drilldown-dialog';
import { PolicyStore } from '../../store/policy.store';
import { Policy } from '../../models/policy.model';

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

function createComponent(data: { mode: 'status' | 'expiring'; status?: any }, policies: Policy[]) {
  const filteredSignal = signal(policies);
  const storeSpy = jasmine.createSpyObj('PolicyStore', ['renewPolicy'], {
    filteredPolicies: filteredSignal,
  });

  TestBed.configureTestingModule({
    imports: [PolicyDrilldownDialog],
    providers: [
      provideZonelessChangeDetection(),
      provideAnimationsAsync(),
      { provide: MAT_DIALOG_DATA,  useValue: data },
      { provide: MatDialogRef,     useValue: { close: jasmine.createSpy('close') } },
      { provide: PolicyStore,      useValue: storeSpy },
    ],
  });

  const fixture = TestBed.createComponent(PolicyDrilldownDialog);
  fixture.detectChanges();
  return { component: fixture.componentInstance, storeSpy };
}

describe('PolicyDrilldownDialog', () => {

  // ── status mode ──────────────────────────────────────────────────────────────

  describe('status mode', () => {
    it('policies() returns only policies matching the given status', () => {
      const { component } = createComponent({ mode: 'status', status: 'Expired' }, [
        makePolicy({ id: 'p1', status: 'Active' }),
        makePolicy({ id: 'p2', status: 'Expired' }),
        makePolicy({ id: 'p3', status: 'Expired' }),
      ]);
      expect(component.policies().length).toBe(2);
      expect(component.policies().every(p => p.status === 'Expired')).toBeTrue();
    });

    it('dialogTitle returns "<Status> Policies"', () => {
      const { component } = createComponent({ mode: 'status', status: 'Pending' }, []);
      expect(component.dialogTitle).toBe('Pending Policies');
    });

    it('footerLabel uses plural "policies" for count > 1', () => {
      const { component } = createComponent({ mode: 'status', status: 'Active' }, [
        makePolicy({ id: 'p1', status: 'Active' }),
        makePolicy({ id: 'p2', status: 'Active' }),
      ]);
      expect(component.footerLabel).toContain('2 Active policies');
    });

    it('footerLabel uses singular "policy" for count == 1', () => {
      const { component } = createComponent({ mode: 'status', status: 'Cancelled' }, [
        makePolicy({ id: 'p1', status: 'Cancelled' }),
      ]);
      expect(component.footerLabel).toContain('1 Cancelled policy');
    });

    it('displayedColumns does not include daysLeft or renew', () => {
      const { component } = createComponent({ mode: 'status', status: 'Active' }, []);
      expect(component.displayedColumns()).not.toContain('daysLeft');
      expect(component.displayedColumns()).not.toContain('renew');
    });
  });

  // ── expiring mode ─────────────────────────────────────────────────────────────

  describe('expiring mode', () => {
    it('policies() returns only policies expiring within 30 days', () => {
      const { component } = createComponent({ mode: 'expiring' }, [
        makePolicy({ id: 'p1', expiryDate: daysFromToday(10)  }),
        makePolicy({ id: 'p2', expiryDate: daysFromToday(45)  }),
        makePolicy({ id: 'p3', expiryDate: daysFromToday(-1)  }),
        makePolicy({ id: 'p4', expiryDate: daysFromToday(29)  }),
      ]);
      expect(component.policies().length).toBe(2);
      expect(component.policies().map(p => p.id)).toEqual(jasmine.arrayContaining(['p1', 'p4']));
    });

    it('policies() are sorted ascending by expiryDate (soonest first)', () => {
      const { component } = createComponent({ mode: 'expiring' }, [
        makePolicy({ id: 'p1', expiryDate: daysFromToday(20) }),
        makePolicy({ id: 'p2', expiryDate: daysFromToday(5)  }),
        makePolicy({ id: 'p3', expiryDate: daysFromToday(15) }),
      ]);
      const ids = component.policies().map(p => p.id);
      expect(ids).toEqual(['p2', 'p3', 'p1']);
    });

    it('dialogTitle returns "Expiring in 30 Days"', () => {
      const { component } = createComponent({ mode: 'expiring' }, []);
      expect(component.dialogTitle).toBe('Expiring in 30 Days');
    });

    it('displayedColumns includes daysLeft and renew', () => {
      const { component } = createComponent({ mode: 'expiring' }, []);
      expect(component.displayedColumns()).toContain('daysLeft');
      expect(component.displayedColumns()).toContain('renew');
    });
  });

  // ── daysLeft ─────────────────────────────────────────────────────────────────

  describe('daysLeft', () => {
    it('returns a positive number for a future date', () => {
      const { component } = createComponent({ mode: 'expiring' }, []);
      const future = daysFromToday(10);
      expect(component.daysLeft(future)).toBeGreaterThan(0);
    });

    it('returns a number in the expected range for a near-future date', () => {
      const { component } = createComponent({ mode: 'expiring' }, []);
      const future = daysFromToday(10);
      const result = component.daysLeft(future);
      // Math.ceil of (10 days + tiny ms delta) → 10 or 11
      expect(result).toBeGreaterThanOrEqual(10);
      expect(result).toBeLessThanOrEqual(11);
    });
  });

  // ── urgencyClass ─────────────────────────────────────────────────────────────

  describe('urgencyClass', () => {
    it('returns urgency--critical for dates within ~3 days (well inside 7-day window)', () => {
      const { component } = createComponent({ mode: 'expiring' }, []);
      // daysFromToday(3) → daysLeft ≈ 4 → 4 ≤ 7 → critical
      expect(component.urgencyClass(daysFromToday(3))).toBe('urgency--critical');
    });

    it('returns urgency--high for dates around 9 days (well inside 8–14 window)', () => {
      const { component } = createComponent({ mode: 'expiring' }, []);
      // daysFromToday(9) → daysLeft ≈ 10 → 10 ≤ 14, 10 > 7 → high
      expect(component.urgencyClass(daysFromToday(9))).toBe('urgency--high');
    });

    it('returns urgency--low for dates around 20 days (outside 14-day window)', () => {
      const { component } = createComponent({ mode: 'expiring' }, []);
      // daysFromToday(20) → daysLeft ≈ 21 → 21 > 14 → low
      expect(component.urgencyClass(daysFromToday(20))).toBe('urgency--low');
    });
  });

  // ── renew ────────────────────────────────────────────────────────────────────

  describe('renew', () => {
    it('adds id to renewingIds immediately', () => {
      const { component } = createComponent({ mode: 'expiring' }, []);
      component.renew('p1');
      expect(component.renewingIds().has('p1')).toBeTrue();
    });

    it('calls store.renewPolicy with the correct id', () => {
      const { component, storeSpy } = createComponent({ mode: 'expiring' }, []);
      component.renew('p1');
      expect(storeSpy.renewPolicy).toHaveBeenCalledWith('p1');
    });

    it('does not call store.renewPolicy if id is already renewing', () => {
      const { component, storeSpy } = createComponent({ mode: 'expiring' }, []);
      component.renew('p1');
      component.renew('p1');
      expect(storeSpy.renewPolicy).toHaveBeenCalledTimes(1);
    });
  });

  // ── meta ─────────────────────────────────────────────────────────────────────

  describe('meta', () => {
    it('returns amber color for expiring mode', () => {
      const { component } = createComponent({ mode: 'expiring' }, []);
      expect(component.meta.color).toBe('#d97706');
    });

    it('returns correct color for Active status', () => {
      const { component } = createComponent({ mode: 'status', status: 'Active' }, []);
      expect(component.meta.color).toBe('#15803d');
    });

    it('returns correct color for Expired status', () => {
      const { component } = createComponent({ mode: 'status', status: 'Expired' }, []);
      expect(component.meta.color).toBe('#b91c1c');
    });
  });
});
