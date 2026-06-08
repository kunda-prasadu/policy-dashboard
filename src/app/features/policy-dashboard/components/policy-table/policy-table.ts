import { Component, DestroyRef, effect, inject, LOCALE_ID, viewChild, output, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PolicyStore } from '../../store/policy.store';
import { CommonModule, getCurrencySymbol } from '@angular/common';
import { Policy } from '../../models/policy.model';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { StorageService } from '../../../../core/services/storage.service';

@Component({
  selector: 'app-policy-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatCheckboxModule, MatSortModule, MatPaginatorModule, MatIconModule, MatTooltipModule],
  templateUrl: './policy-table.html',
  styleUrls: ['./policy-table.scss'],
})
export class PolicyTable {
  readonly store = inject(PolicyStore);
  private readonly storage = inject(StorageService);
  private readonly locale  = inject(LOCALE_ID);
  private readonly destroyRef = inject(DestroyRef);

  /** Emits the Policy the user clicked to view its details. */
  readonly rowClick = output<Policy>();

  private static readonly PAGE_SIZE_KEY = 'policy-page-size';
  private static readonly DEFAULT_PAGE_SIZE = 10;

  displayedColumns = ['select', 'policyNumber', 'policyHolderName', 'lineOfBusiness', 'status', 'region', 'premium', 'flagged', 'actions'];
  dataSource = new MatTableDataSource<Policy>();
  readonly initialPageSize = this.storage.get<number>(PolicyTable.PAGE_SIZE_KEY) ?? PolicyTable.DEFAULT_PAGE_SIZE;

  sort = viewChild(MatSort);
  paginator = viewChild(MatPaginator);

  /** Tracks the current paginator page index — updated by the page subscription. */
  private readonly _pageIndex = signal(0);
  /** Tracks the current page size — updated by the page subscription. */
  private readonly _pageSize  = signal(this.initialPageSize);

  /**
   * IDs of policies visible on the current page.
   * WHY THIS APPROACH: computed() reacts synchronously to store.filteredPolicies(),
   * _pageIndex, and _pageSize. Using dataSource.filteredData was unreliable because
   * MatTableDataSource updates filteredData asynchronously via an observable pipeline,
   * causing pageIds to be stale/empty at the moment the effect fired.
   */
  readonly pageIds = computed(() => {
    const data  = this.store.filteredPolicies();
    const start = this._pageIndex() * this._pageSize();
    return data.slice(start, start + this._pageSize()).map(p => p.id);
  });

  /** True when every policy on the current page is selected. Drives the header checkbox [checked]. */
  readonly isAllOnPageSelected = computed(() => {
    const ids = this.pageIds();
    if (!ids.length) return false;
    return ids.every(id => this.store.selectedPolicyIds().includes(id));
  });

  /** True when some (but not all) policies on the current page are selected. Drives [indeterminate]. */
  readonly isSomeOnPageSelected = computed(() => {
    const ids = this.pageIds();
    return ids.some(id => this.store.selectedPolicyIds().includes(id)) && !this.isAllOnPageSelected();
  });

  constructor() {
    this.dataSource.data = this.store.filteredPolicies();

    effect(() => {
      this.dataSource.data = this.store.filteredPolicies();
      // Reset to page 1 whenever the filtered dataset changes so users never
      // land on a non-existent page after applying or clearing a filter.
      this.paginator()?.firstPage();
      // Reset _pageIndex so pageIds computed re-derives from page 0 immediately.
      this._pageIndex.set(0);
    });
  }

  ngAfterViewInit() {
    const sort = this.sort();
    const paginator = this.paginator();
    // Wire server-side sort: each sort change triggers a fresh API fetch.
    // Do NOT assign sort to dataSource (that would cause client-side sorting instead).
    if (sort) {
      sort.sortChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(s => {
        this.store.updateSort(s.active, s.direction as 'asc' | 'desc' | '');
        this.store.loadingPolicies();
      });
    }
    if (paginator) {
      this.dataSource.paginator = paginator;
      paginator.page.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(e => {
        this.storage.set(PolicyTable.PAGE_SIZE_KEY, e.pageSize);
        // Update the tracking signals so pageIds computed re-derives for the new page.
        this._pageIndex.set(e.pageIndex);
        this._pageSize.set(e.pageSize);
      });
    }
  }

  toggleSelection(policyId: string): void  {
    this.store.toggleSelection(policyId);
  }

  toggleSelectAll(): void {
    // Use the pre-computed pageIds signal rather than re-slicing the data source.
    if (this.isAllOnPageSelected()) {
      this.store.clearSelection();
    } else {
      this.store.selectAll(this.pageIds());
    }
  }

  formatPremium(value: number, currencyCode: string): string {
    const sym = getCurrencySymbol(currencyCode, 'narrow', this.locale as string);
    if (value >= 1_000_000) return `${sym}${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000)     return `${sym}${(value / 1_000).toFixed(0)}K`;
    return `${sym}${value}`;
  }
}
