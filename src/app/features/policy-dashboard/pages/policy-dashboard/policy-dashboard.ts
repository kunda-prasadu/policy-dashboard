import { Component, inject, OnInit } from '@angular/core';
import { PolicyStore } from '../../store/policy.store';
import { PolicyFilter } from '../../components/policy-filter/policy-filter';
import { SummaryPanel } from '../../components/summary-panel/summary-panel';
import { PolicyTable } from '../../components/policy-table/policy-table';
import { BulkActionBar } from '../../components/bulk-action-bar/bulk-action-bar';
import { LoadingSkeleton } from '../../../../shared/loading-skeleton/loading-skeleton';
import { ErrorState } from '../../../../shared/error-state/error-state';
import { MatDialog } from '@angular/material/dialog';
import { PolicyDrilldownDialog } from '../../components/policy-drilldown-dialog/policy-drilldown-dialog';
import { Policy } from '../../models/policy.model';

@Component({
  selector: 'app-policy-dashboard',
  standalone: true,
  imports: [SummaryPanel, PolicyTable, BulkActionBar, PolicyFilter, LoadingSkeleton, ErrorState],
  templateUrl: './policy-dashboard.html',
  styleUrls: ['./policy-dashboard.scss'],
})
export class PolicyDashboard implements OnInit {
  readonly store = inject(PolicyStore);
  private readonly dialog = inject(MatDialog);

  ngOnInit(): void {
    this.store.loadingPolicies();
  }

  retry(): void {
    this.store.error.set(null);
    this.store.loadingPolicies();
  }

  /**
   * Opens the drilldown dialog for the clicked policy row.
   * Shows the full list of policies sharing the same status so the user
   * can see the policy in context and take actions (renew, flag).
   */
  openPolicyDetail(policy: Policy): void {
    this.dialog.open(PolicyDrilldownDialog, {
      data: { mode: 'detail', policy },
      width: '600px',
      maxWidth: '96vw',
      panelClass: 'drilldown-dialog-panel',
    });
  }
}
