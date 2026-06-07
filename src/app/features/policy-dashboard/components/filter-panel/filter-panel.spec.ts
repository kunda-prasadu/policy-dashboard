import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { FilterPanel } from './filter-panel';

describe('FilterPanel', () => {
  let component: FilterPanel;
  let fixture: ComponentFixture<FilterPanel>;

  const sheetRefSpy = { dismiss: jasmine.createSpy('dismiss') };

  async function createComponent(data: Record<string, unknown> = {}): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [FilterPanel],
      providers: [
        provideZonelessChangeDetection(),
        provideAnimationsAsync(),
        { provide: MatBottomSheetRef, useValue: sheetRefSpy },
        { provide: MAT_BOTTOM_SHEET_DATA, useValue: data },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(FilterPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    sheetRefSpy.dismiss.calls.reset();
    TestBed.resetTestingModule();
    await createComponent();
  });

  // ── Creation ────────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── Form initialisation ─────────────────────────────────────────────────────

  describe('form initialisation', () => {
    it('defaults all controls to empty / zero when no data provided', () => {
      expect(component.form.value.status).toBe('');
      expect(component.form.value.region).toBe('');
      expect(component.form.value.lineOfBusiness).toBe('');
      expect(component.form.value.minPremium).toBe(0);
      expect(component.form.value.startDate).toBeNull();
      expect(component.form.value.endDate).toBeNull();
    });

    it('seeds form controls from injected MAT_BOTTOM_SHEET_DATA', async () => {
      TestBed.resetTestingModule();
      await createComponent({ status: 'Active', region: 'Singapore', lineOfBusiness: 'Marine', minPremium: 50_000 });
      expect(component.form.value.status).toBe('Active');
      expect(component.form.value.region).toBe('Singapore');
      expect(component.form.value.lineOfBusiness).toBe('Marine');
      expect(component.form.value.minPremium).toBe(50_000);
    });
  });

  // ── premiumLabel ────────────────────────────────────────────────────────────

  describe('premiumLabel', () => {
    it('returns raw $ amount below 1,000', () => {
      component.form.get('minPremium')!.setValue(500);
      expect(component.premiumLabel).toBe('$500');
    });

    it('formats thousands as $XK', () => {
      component.form.get('minPremium')!.setValue(250_000);
      expect(component.premiumLabel).toBe('$250K');
    });

    it('returns $1M+ at exactly 1,000,000', () => {
      component.form.get('minPremium')!.setValue(1_000_000);
      expect(component.premiumLabel).toBe('$1M+');
    });

    it('returns $1M+ above 1,000,000', () => {
      component.form.get('minPremium')!.setValue(2_500_000);
      expect(component.premiumLabel).toBe('$1M+');
    });
  });

  // ── apply() ─────────────────────────────────────────────────────────────────

  describe('apply()', () => {
    it('dismisses the sheet with the current form value', () => {
      component.form.patchValue({ status: 'Pending', region: 'Japan', lineOfBusiness: 'Marine' });
      component.apply();
      expect(sheetRefSpy.dismiss).toHaveBeenCalledOnceWith(
        jasmine.objectContaining({ status: 'Pending', region: 'Japan', lineOfBusiness: 'Marine' })
      );
    });

    it('includes minPremium in the dismissed value', () => {
      component.form.patchValue({ minPremium: 100_000 });
      component.apply();
      expect(sheetRefSpy.dismiss).toHaveBeenCalledOnceWith(
        jasmine.objectContaining({ minPremium: 100_000 })
      );
    });
  });

  // ── reset() ─────────────────────────────────────────────────────────────────

  describe('reset()', () => {
    it('dismisses the sheet with the string "reset"', () => {
      component.reset();
      expect(sheetRefSpy.dismiss).toHaveBeenCalledOnceWith('reset');
    });
  });

  // ── close() ─────────────────────────────────────────────────────────────────

  describe('close()', () => {
    it('dismisses the sheet with no argument', () => {
      component.close();
      expect(sheetRefSpy.dismiss).toHaveBeenCalledOnceWith();
    });
  });
});
