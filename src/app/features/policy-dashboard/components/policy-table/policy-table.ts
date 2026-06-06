import { Component, effect, inject, viewChild } from '@angular/core';
import { PolicyStore } from '../../store/policy.store';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-policy-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatCheckboxModule, MatSortModule, MatPaginatorModule, MatIconModule, MatTooltipModule],
  templateUrl: './policy-table.html',
  styleUrls: ['./policy-table.scss'],
})
export class PolicyTable {
  readonly store = inject(PolicyStore);

  displayedColumns = ['select', 'policyNumber', 'policyHolderName', 'status', 'region', 'premium', 'flagged'];
  dataSource = new MatTableDataSource<any>();

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
    if (paginator) this.dataSource.paginator = paginator;
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

  formatPremium(value: number): string {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000)     return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value}`;
  }
}
