import { Component, effect, inject, viewChild } from '@angular/core';
import { PolicyStore } from '../../store/policy.store';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-policy-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatCheckboxModule, MatSortModule, MatPaginatorModule],
  templateUrl: './policy-table.html',
  styleUrls: ['./policy-table.scss'],
})
export class PolicyTable {
  readonly store = inject(PolicyStore);

  displayedColumns = ['select', 'policyNumber', 'policyHolderName', 'status', 'region', 'premium'];
  dataSource = new MatTableDataSource<any>();

  sort !: MatSort;
  paginator !: MatPaginator;

  constructor() {
    this.dataSource.data = this.store.filteredPolicies();

    effect(() => {
      this.dataSource.data = this.store.filteredPolicies();
    });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  toggleSelection(policyId: string): void  {
    this.store.toggleSelection(policyId);
  }

  toggleSelectAll(): void {
    const allIds = this.store.filteredPolicies().map(p => p.id);
    const allSelected = allIds.every(id => this.store.selectedPolicyIds().includes(id));
    if (allSelected) {
      this.store.clearSelection();
    } else {
      this.store.selectAll(allIds);
    }
  }
}
