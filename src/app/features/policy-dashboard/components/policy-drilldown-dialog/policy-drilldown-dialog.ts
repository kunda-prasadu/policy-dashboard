import { Component, inject, computed } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PolicyStore } from '../../store/policy.store';
import { PolicyStatus } from '../../models/policy.model';

export interface DrilldownDialogData {
  status: PolicyStatus;
}

@Component({
  selector: 'app-policy-drilldown-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatTableModule, MatTooltipModule],
  templateUrl: './policy-drilldown-dialog.html',
  styleUrls: ['./policy-drilldown-dialog.scss'],
})
export class PolicyDrilldownDialog {
  private readonly dialogRef = inject(MatDialogRef<PolicyDrilldownDialog>);
  readonly data: DrilldownDialogData = inject(MAT_DIALOG_DATA);
  private readonly store = inject(PolicyStore);

  readonly displayedColumns = ['policyNumber', 'policyHolderName', 'region', 'lineOfBusiness', 'premium', 'expiryDate', 'flagged'];

  readonly policies = computed(() =>
    this.store.filteredPolicies().filter(p => p.status === this.data.status)
  );

  readonly statusMeta: Record<PolicyStatus, { icon: string; color: string }> = {
    Active:    { icon: 'task_alt',      color: '#15803d' },
    Pending:   { icon: 'schedule',      color: '#a16207' },
    Expired:   { icon: 'warning_amber', color: '#b91c1c' },
    Cancelled: { icon: 'cancel',        color: '#475569' },
  };

  get meta() { return this.statusMeta[this.data.status]; }

  formatPremium(value: number): string {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000)     return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value}`;
  }

  formatDate(d: Date | string): string {
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  close() { this.dialogRef.close(); }
}
