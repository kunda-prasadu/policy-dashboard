import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PolicyStore } from '../../store/policy.store';
import { PolicyStatus } from '../../models/policy.model';
import { PolicyDrilldownDialog } from '../policy-drilldown-dialog/policy-drilldown-dialog';

@Component({
  selector: 'app-summary-pannl',
  standalone: true,
  imports: [MatIconModule, MatDialogModule],
  templateUrl: './summary-pannl.html',
  styleUrls: ['./summary-pannl.scss'],
})
export class SummaryPannl {
  readonly store  = inject(PolicyStore);
  private readonly dialog = inject(MatDialog);
  readonly summary = this.store.summary;

  openDrilldown(status: PolicyStatus): void {
    this.dialog.open(PolicyDrilldownDialog, {
      data: { status },
      width: '85vw',
      maxWidth: '1100px',
      maxHeight: '80vh',
      panelClass: 'drilldown-dialog-panel',
    });
  }

  /** Compact currency: 1_500_000 → $1.5M, 250_000 → $250K */
  formatPremium(value: number): string {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000)     return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value}`;
  }

  /** Returns width % of a LOB value vs total GWP (min 2% so bar is always visible) */
  barPct(value: number, total: number): string {
    if (!total) return '0%';
    return `${Math.max(2, Math.round((value / total) * 100))}%`;
  }
}
