import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal, computed } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatDialog } from '@angular/material/dialog';
import { SummaryPannl } from './summary-pannl';
import { PolicyStore } from '../../store/policy.store';
function makeSummary(overrides = {}) {
  return {
    activeCount: 10,
    pendingCount: 5,
    expiredCount: 3,
    cancelledCount: 2,
    propertyPremium: 100_000,
    casualtyPremium: 200_000,
    ahPremium: 50_000,
    marinePremium: 75_000,
    get totalGwp() { return 425_000; },
    expiringWithin30Days: 2,
    ...overrides,
  };
}

describe('SummaryPannl', () => {
  let component: SummaryPannl;
  let fixture: ComponentFixture<SummaryPannl>;

  const summarySignal = signal(makeSummary());

  const storeSpy = {
    summary: computed(() => summarySignal()),
    filteredPolicies: signal([]),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryPannl],
      providers: [
        provideZonelessChangeDetection(),
        provideAnimationsAsync(),
        { provide: PolicyStore, useValue: storeSpy },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(SummaryPannl);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── expiringPct ──────────────────────────────────────────────────────────────

  describe('expiringPct', () => {
    it('returns percentage of active policies expiring within 30 days', () => {
      summarySignal.set(makeSummary({ activeCount: 20, expiringWithin30Days: 4 }));
      expect(component.expiringPct()).toBe(20);
    });

    it('returns 0 when activeCount is 0 (no divide-by-zero)', () => {
      summarySignal.set(makeSummary({ activeCount: 0, expiringWithin30Days: 0 }));
      expect(component.expiringPct()).toBe(0);
    });

    it('caps at 100 even if expiringWithin30Days exceeds activeCount', () => {
      summarySignal.set(makeSummary({ activeCount: 5, expiringWithin30Days: 10 }));
      expect(component.expiringPct()).toBe(100);
    });
  });

  // ── arcOffset ────────────────────────────────────────────────────────────────

  describe('arcOffset', () => {
    const circumference = 2 * Math.PI * 18;

    it('returns full circumference (0% fill) when pct is 0', () => {
      expect(component.arcOffset(0)).toBeCloseTo(circumference, 2);
    });

    it('returns 0 (full fill) when pct is 100', () => {
      expect(component.arcOffset(100)).toBeCloseTo(0, 2);
    });

    it('returns half circumference when pct is 50', () => {
      expect(component.arcOffset(50)).toBeCloseTo(circumference / 2, 2);
    });
  });

  // ── barPct ───────────────────────────────────────────────────────────────────

  describe('barPct', () => {
    it('returns correct percentage string', () => {
      expect(component.barPct(100_000, 400_000)).toBe('25%');
    });

    it('enforces minimum 2% so bar is always visible', () => {
      expect(component.barPct(100, 1_000_000)).toBe('2%');
    });

    it('returns 0% when total is 0', () => {
      expect(component.barPct(0, 0)).toBe('0%');
    });
  });

  // ── formatPremium ────────────────────────────────────────────────────────────

  describe('formatPremium', () => {
    it('formats millions', () => {
      expect(component.formatPremium(2_500_000)).toBe('$2.5M');
    });

    it('formats thousands', () => {
      expect(component.formatPremium(300_000)).toBe('$300K');
    });
  });

  // ── openDrilldown ────────────────────────────────────────────────────────────

  describe('openDrilldown', () => {
    it('opens dialog with status mode and correct status', () => {
      // Access the component's own MatDialog instance (module-scoped, not root-scoped)
      const openSpy = spyOn(component['dialog'], 'open');
      component.openDrilldown('status', 'Active');
      expect(openSpy).toHaveBeenCalledWith(
        jasmine.anything(),
        jasmine.objectContaining({ data: { mode: 'status', status: 'Active' } })
      );
    });

    it('opens dialog with expiring mode', () => {
      const openSpy = spyOn(component['dialog'], 'open');
      component.openDrilldown('expiring');
      expect(openSpy).toHaveBeenCalledWith(
        jasmine.anything(),
        jasmine.objectContaining({ data: { mode: 'expiring', status: undefined } })
      );
    });
  });
});
