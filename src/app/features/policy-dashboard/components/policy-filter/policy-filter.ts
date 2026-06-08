import { Component, inject, OnDestroy, computed, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { PolicyStore } from '../../store/policy.store';
import { PolicyStatus, Region, LineOfBusiness } from '../../models/policy.model';
import { FilterPanel } from '../filter-panel/filter-panel';
import { StorageService } from '../../../../core/services/storage.service';

@Component({
  selector: 'app-policy-filter',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule,
    MatBadgeModule, MatBottomSheetModule,
  ],
  templateUrl: './policy-filter.html',
  styleUrls: ['./policy-filter.scss'],
})
export class PolicyFilter implements OnDestroy {
  private readonly fb          = inject(FormBuilder);
  private readonly router      = inject(Router);
  private readonly route       = inject(ActivatedRoute);
  private readonly bottomSheet = inject(MatBottomSheet);
  private readonly storage     = inject(StorageService);
  readonly store               = inject(PolicyStore);
  private readonly destroy$    = new Subject<void>();

  private static readonly STORAGE_KEY = 'policy-filters';

  /** Tracks whether the advanced-filters bottom sheet is currently open (for aria-expanded). */
  readonly isFilterSheetOpen = signal(false);

  readonly filterForm = this.fb.group({
    searchTerm:     [''],
    status:         [''],
    region:         [''],
    lineOfBusiness: [''],
    startDate:      [null as Date | null],
    endDate:        [null as Date | null],
    minPremium:     [0],
  });

  /** Count of active advanced filters (excluding search) */
  readonly activeFilterCount = computed(() => {
    const f = this.store.filters();
    let count = 0;
    if (f.status)         count++;
    if (f.region)         count++;
    if (f.lineOfBusiness) count++;
    if (f.startDate)      count++;
    if (f.endDate)        count++;
    if (f.minPremium && f.minPremium > 0) count++;
    return count;
  });

  /**
   * Chips shown below the search bar — one per active advanced filter.
   * Each chip carries a human-readable label and the form key needed to remove it.
   */
  readonly activeFilterChips = computed(() => {
    const f = this.store.filters();
    const chips: Array<{ key: string; label: string }> = [];
    if (f.status)         chips.push({ key: 'status',         label: `Status: ${f.status}` });
    if (f.region)         chips.push({ key: 'region',         label: `Region: ${f.region}` });
    if (f.lineOfBusiness) chips.push({ key: 'lineOfBusiness', label: `LoB: ${f.lineOfBusiness}` });
    if (f.startDate)      chips.push({ key: 'startDate',      label: `From: ${this.formatDate(f.startDate)}` });
    if (f.endDate)        chips.push({ key: 'endDate',        label: `To: ${this.formatDate(f.endDate)}` });
    if (f.minPremium && f.minPremium > 0)
      chips.push({ key: 'minPremium', label: `Min: $${Math.round(f.minPremium / 1_000)}K` });
    return chips;
  });

  constructor() {
    // ── 1. Seed form: URL params take priority, then localStorage, then defaults
    const p = this.route.snapshot.queryParams;
    const hasUrlParams = p['search'] || p['status'] || p['region'] || p['lob'] || p['from'] || p['to'];
    if (hasUrlParams) {
      this.filterForm.patchValue({
        searchTerm:     p['search'] ?? '',
        status:         p['status'] ?? '',
        region:         p['region'] ?? '',
        lineOfBusiness: p['lob']    ?? '',
        startDate:      p['from'] ? new Date(p['from']) : null,
        endDate:        p['to']   ? new Date(p['to'])   : null,
      }, { emitEvent: true });
    } else {
      const saved = this.storage.get<Record<string, unknown>>(PolicyFilter.STORAGE_KEY);
      if (saved) {
        this.filterForm.patchValue({
          searchTerm:     (saved['searchTerm']     ?? '') as string,
          status:         (saved['status']         ?? '') as string,
          region:         (saved['region']         ?? '') as string,
          lineOfBusiness: (saved['lineOfBusiness'] ?? '') as string,
          startDate:      saved['startDate'] ? new Date(saved['startDate'] as string) : null,
          endDate:        saved['endDate']   ? new Date(saved['endDate']   as string) : null,
          minPremium:     (saved['minPremium'] ?? 0) as number,
        }, { emitEvent: true });
      }
    }

    const changes$ = this.filterForm.valueChanges.pipe(takeUntil(this.destroy$));

    // ── 2. Immediate store update ─────────────────────────────────────────────
    changes$.subscribe(f => {
      this.store.updateFilters({
        searchTerm:     f.searchTerm      ?? '',
        status:         (f.status         ?? '') as PolicyStatus | '',
        region:         (f.region         ?? '') as Region | '',
        lineOfBusiness: (f.lineOfBusiness  ?? '') as LineOfBusiness | '',
        startDate:      f.startDate  ?? undefined,
        endDate:        f.endDate    ?? undefined,
        minPremium:     f.minPremium ?? 0,
      });
    });

    // ── 3. Debounced URL write + localStorage persist ─────────────────────────
    changes$.pipe(debounceTime(400)).subscribe(f => {
      this.storage.set(PolicyFilter.STORAGE_KEY, {
        searchTerm:     f.searchTerm      ?? '',
        status:         f.status          ?? '',
        region:         f.region          ?? '',
        lineOfBusiness: f.lineOfBusiness  ?? '',
        startDate:      f.startDate ? this.toDateParam(f.startDate) : null,
        endDate:        f.endDate   ? this.toDateParam(f.endDate)   : null,
        minPremium:     f.minPremium ?? 0,
      });

      this.router.navigate([], {
        relativeTo:          this.route,
        queryParams: {
          search: f.searchTerm      || null,
          status: f.status          || null,
          region: f.region          || null,
          lob:    f.lineOfBusiness  || null,
          from:   f.startDate ? this.toDateParam(f.startDate) : null,
          to:     f.endDate   ? this.toDateParam(f.endDate)   : null,
        },
        queryParamsHandling: 'replace',
        replaceUrl:          true,
      });
    });
  }

  openFilters(): void {
    const current = this.filterForm.value;
    this.isFilterSheetOpen.set(true);
    const ref = this.bottomSheet.open(FilterPanel, {
      data: {
        startDate:      current.startDate,
        endDate:        current.endDate,
        status:         current.status,
        region:         current.region,
        lineOfBusiness: current.lineOfBusiness,
        minPremium:     current.minPremium,
      },
      panelClass: 'filter-bottom-sheet',
    });

    ref.afterDismissed().subscribe(result => {
      this.isFilterSheetOpen.set(false);
      if (!result) return; // dismissed without action (X or backdrop)

      if (result === 'reset') {
        this.filterForm.reset({
          searchTerm: this.filterForm.value.searchTerm ?? '', // preserve search
          status: '', region: '', lineOfBusiness: '',
          startDate: null, endDate: null, minPremium: 0,
        });
        // Re-fetch from server with cleared server-side filters
        this.store.loadingPolicies();
        return;
      }

      this.filterForm.patchValue({
        status:         result.status         ?? '',
        region:         result.region         ?? '',
        lineOfBusiness: result.lineOfBusiness ?? '',
        startDate:      result.startDate      ?? null,
        endDate:        result.endDate        ?? null,
        minPremium:     result.minPremium      ?? 0,
      });
      // Re-fetch from server with updated server-side filters
      this.store.loadingPolicies();
    });
  }

  private toDateParam(d: Date): string {
    return d.toISOString().split('T')[0];
  }

  private formatDate(d: Date): string {
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  /**
   * Removes a single active filter by key.
   * Patches only the relevant form control and lets the existing
   * valueChanges subscription propagate the update to the store and URL.
   */
  removeFilter(key: string): void {
    switch (key) {
      case 'status':         this.filterForm.patchValue({ status: '' });          break;
      case 'region':         this.filterForm.patchValue({ region: '' });          break;
      case 'lineOfBusiness': this.filterForm.patchValue({ lineOfBusiness: '' }); break;
      case 'startDate':      this.filterForm.patchValue({ startDate: null });     break;
      case 'endDate':        this.filterForm.patchValue({ endDate: null });       break;
      case 'minPremium':     this.filterForm.patchValue({ minPremium: 0 });       break;
    }
    // Re-fetch when a server-side filter chip is removed.
    if (['status', 'region', 'lineOfBusiness', 'minPremium'].includes(key)) {
      this.store.loadingPolicies();
    }
  }

  /** Clears all advanced filters in one action (preserves search term). */
  clearAllFilters(): void {
    this.filterForm.patchValue({
      status: '', region: '', lineOfBusiness: '',
      startDate: null, endDate: null, minPremium: 0,
    });
    this.store.loadingPolicies();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

