import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { PolicyStore } from '../../store/policy.store';
import { PolicyStatus, Region, LineOfBussiness } from '../../models/policy.model';
import { POLICY_STATUSES, REGIONS, LINE_OF_BUSINESS } from '../../constants/policy.constants';

@Component({
  selector: 'app-policy-filter',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatOptionModule,
    MatDatepickerModule, MatIconModule,
  ],
  templateUrl: './policy-filter.html',
  styleUrls: ['./policy-filter.scss'],
})
export class PolicyFilter implements OnDestroy {
  private readonly fb       = inject(FormBuilder);
  private readonly router   = inject(Router);
  private readonly route    = inject(ActivatedRoute);
  readonly store            = inject(PolicyStore);
  private readonly destroy$ = new Subject<void>();

  readonly statuses       = POLICY_STATUSES;
  readonly regions        = REGIONS;
  readonly lineOfBusiness = LINE_OF_BUSINESS;

  readonly filterForm = this.fb.group({
    searchTerm:     [''],
    status:         [''],
    region:         [''],
    lineOfBusiness: [''],
    startDate:      [null as Date | null],
    endDate:        [null as Date | null],
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
        searchTerm:     f.searchTerm     ?? '',
        status:         (f.status        ?? '') as PolicyStatus | '',
        region:         (f.region        ?? '') as Region | '',
        lineOfBusiness: (f.lineOfBusiness ?? '') as LineOfBussiness | '',
        startDate:      f.startDate ?? undefined,
        endDate:        f.endDate   ?? undefined,
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

  clearFilters(): void {
    this.filterForm.reset({
      searchTerm: '', status: '', region: '', lineOfBusiness: '',
      startDate: null, endDate: null,
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
