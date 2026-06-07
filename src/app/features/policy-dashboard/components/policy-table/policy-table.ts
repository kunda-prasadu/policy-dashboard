import { Component, effect, inject, LOCALE_ID, viewChild } from '@angular/core';
import { PolicyStore } from '../../store/policy.store';
import { CommonModule, getCurrencySymbol } from '@angular/common';
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

  private static readonly PAGE_SIZE_KEY = 'policy-page-size';
  private static readonly DEFAULT_PAGE_SIZE = 10;

  displayedColumns = ['select', 'policyNumber', 'policyHolderName', 'lineOfBusiness', 'status', 'region', 'premium', 'flagged'];
  dataSource = new MatTableDataSource<any>();
  readonly initialPageSize = this.storage.get<number>(PolicyTable.PAGE_SIZE_KEY) ?? PolicyTable.DEFAULT_PAGE_SIZE;

  sort = viewChild(MatSort);
  paginator = viewChild(MatPaginator);

  constructor() {
    this.dataSource.data = this.store.filteredPolicies();

    effect(() => {
      this.dataSource.data = this.store.filteredPolicies();
    });
  }

  ngAfterViewInit() {
    const sort = this.sort();
    const paginator = this.paginator();
    if (sort) this.dataSource.sort = sort;
    if (paginator) {
      this.dataSource.paginator = paginator;
      paginator.page.subscribe(e => {
        this.storage.set(PolicyTable.PAGE_SIZE_KEY, e.pageSize);
      });
    }
  }

  toggleSelection(policyId: string): void  {
    this.store.toggleSelection(policyId);
  }

  toggleSelectAll(): void {
    const paginator = this.paginator();
    const pageStart = paginator ? paginator.pageIndex * paginator.pageSize : 0;
    const pageEnd = paginator ? pageStart + paginator.pageSize : this.dataSource.filteredData.length;
    const pageIds = this.dataSource.filteredData.slice(pageStart, pageEnd).map((p: any) => p.id);
    const allSelected = pageIds.every((id: string) => this.store.selectedPolicyIds().includes(id));
    if (allSelected) {
      this.store.clearSelection();
    } else {
      this.store.selectAll(pageIds);
    }
  }

  formatPremium(value: number, currencyCode: string): string {
    const sym = getCurrencySymbol(currencyCode, 'narrow', this.locale as string);
    if (value >= 1_000_000) return `${sym}${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000)     return `${sym}${(value / 1_000).toFixed(0)}K`;
    return `${sym}${value}`;
  }
}
