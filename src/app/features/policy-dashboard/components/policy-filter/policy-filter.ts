import { Component, inject, OnDestroy, computed } from '@angular/core';
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
import { PolicyStatus, Region, LineOfBussiness } from '../../models/policy.model';
import { FilterPanel } from '../filter-panel/filter-panel';

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
  readonly store               = inject(PolicyStore);
  private readonly destroy$    = new Subject<void>();

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

  constructor() {
    // ── 1. Seed form from URL on first load ──────────────────────────────────
    const p = this.route.snapshot.queryParams;
    if (p['search'] || p['status'] || p['region'] || p['lob'] || p['from'] || p['to']) {
      this.filterForm.patchValue({
        searchTerm:     p['search'] ?? '',
        status:         p['status'] ?? '',
        region:         p['region'] ?? '',
        lineOfBusiness: p['lob']    ?? '',
        startDate:      p['from'] ? new Date(p['from']) : null,
        endDate:        p['to']   ? new Date(p['to'])   : null,
      }, { emitEvent: true });
    }

    const changes$ = this.filterForm.valueChanges.pipe(takeUntil(this.destroy$));

    // ── 2. Immediate store update ─────────────────────────────────────────────
    changes$.subscribe(f => {
      this.store.updateFilters({
        searchTerm:     f.searchTerm      ?? '',
        status:         (f.status         ?? '') as PolicyStatus | '',
        region:         (f.region         ?? '') as Region | '',
        lineOfBusiness: (f.lineOfBusiness  ?? '') as LineOfBussiness | '',
        startDate:      f.startDate  ?? undefined,
        endDate:        f.endDate    ?? undefined,
        minPremium:     f.minPremium ?? 0,
      });
    });

    // ── 3. Debounced URL write ────────────────────────────────────────────────
    changes$.pipe(debounceTime(400)).subscribe(f => {
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
      if (!result) return; // dismissed without action (X or backdrop)

      if (result === 'reset') {
        this.filterForm.reset({
          searchTerm: this.filterForm.value.searchTerm ?? '', // preserve search
          status: '', region: '', lineOfBusiness: '',
          startDate: null, endDate: null, minPremium: 0,
        });
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
    });
  }

  private toDateParam(d: Date): string {
    return d.toISOString().split('T')[0];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

