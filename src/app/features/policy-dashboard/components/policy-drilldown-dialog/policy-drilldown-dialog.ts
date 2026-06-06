import { Component, inject, computed, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PolicyStore } from '../../store/policy.store';
import { PolicyStatus } from '../../models/policy.model';

export type DrilldownMode = 'status' | 'expiring';

export interface DrilldownDialogData {
  mode: DrilldownMode;
  status?: PolicyStatus;
}

@Component({
  selector: 'app-policy-drilldown-dialog',
  standalone: true,
  imports: [NgClass, MatDialogModule, MatButtonModule, MatIconModule, MatTableModule, MatTooltipModule, MatProgressSpinnerModule],
  templateUrl: './policy-drilldown-dialog.html',
  styleUrls: ['./policy-drilldown-dialog.scss'],
})
export class PolicyDrilldownDialog {
  private readonly dialogRef = inject(MatDialogRef<PolicyDrilldownDialog>);
  readonly data: DrilldownDialogData = inject(MAT_DIALOG_DATA);
  private readonly store = inject(PolicyStore);

  readonly displayedColumns = computed(() =>
    this.data.mode === 'expiring'
      ? ['daysLeft', 'policyNumber', 'policyHolderName', 'region', 'lineOfBusiness', 'premium', 'expiryDate', 'flagged', 'renew']
      : ['policyNumber', 'policyHolderName', 'region', 'lineOfBusiness', 'premium', 'expiryDate', 'flagged']
  );

  readonly renewingIds = signal<Set<string>>(new Set());

  private readonly today = new Date();
  private readonly next30 = new Date(new Date().setDate(new Date().getDate() + 30));

  readonly policies = computed(() => {
    const all = this.store.filteredPolicies();
    if (this.data.mode === 'expiring') {
      return all
        .filter(p => {
          const d = new Date(p.expiryDate);
          return d >= this.today && d <= this.next30;
        })
        .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
    }
    return all.filter(p => p.status === this.data.status);
  });

  readonly statusMeta: Record<PolicyStatus, { icon: string; color: string }> = {
    Active:    { icon: 'task_alt',      color: '#15803d' },
    Pending:   { icon: 'schedule',      color: '#a16207' },
    Expired:   { icon: 'warning_amber', color: '#b91c1c' },
    Cancelled: { icon: 'cancel',        color: '#475569' },
  };

  get meta(): { icon: string; color: string } {
    if (this.data.mode === 'expiring') return { icon: 'notifications_active', color: '#d97706' };
    return this.statusMeta[this.data.status!];
  }

  get dialogTitle(): string {
    return this.data.mode === 'expiring' ? 'Expiring in 30 Days' : `${this.data.status} Policies`;
  }

  get footerLabel(): string {
    const n = this.policies().length;
    return this.data.mode === 'expiring'
      ? `${n} ${n === 1 ? 'policy' : 'policies'} expiring within 30 days`
      : `Showing ${n} ${this.data.status} ${n === 1 ? 'policy' : 'policies'}`;
  }

  daysLeft(expiryDate: Date | string): number {
    const ms = new Date(expiryDate).getTime() - this.today.getTime();
    return Math.ceil(ms / (1000 * 60 * 60 * 24));
  }

  urgencyClass(expiryDate: Date | string): string {
    const d = this.daysLeft(expiryDate);
    if (d <= 7)  return 'urgency--critical';
    if (d <= 14) return 'urgency--high';
    return 'urgency--low';
  }

  rowUrgencyClass(p: { expiryDate: Date | string }): string {
    if (this.data.mode !== 'expiring') return '';
    const d = this.daysLeft(p.expiryDate);
    if (d <= 7) return 'row--critical';
    return '';
  }

  formatPremium(value: number): string {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000)     return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value}`;
  }

  formatDate(d: Date | string): string {
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  trackById(_index: number, policy: { id: string }): string {
    return policy.id;
  }

  renew(id: string): void {
    if (this.renewingIds().has(id)) return;
    this.renewingIds.update(s => new Set([...s, id]));
    // Optimistic update via store — the policy disappears from the expiring list reactively
    this.store.renewPolicy(id);
    // Remove from renewing set after brief delay (store already updated synchronously)
    setTimeout(() => this.renewingIds.update(s => { s.delete(id); return new Set(s); }), 600);
  }

  close() { this.dialogRef.close(); }
}
