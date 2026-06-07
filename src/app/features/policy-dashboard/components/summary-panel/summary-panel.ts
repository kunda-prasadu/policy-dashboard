import { getCurrencySymbol } from '@angular/common';
import { Component, inject, computed, LOCALE_ID } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PolicyStore } from '../../store/policy.store';
import { PolicyStatus } from '../../models/policy.model';
import { PolicyDrilldownDialog, DrilldownMode } from '../policy-drilldown-dialog/policy-drilldown-dialog';

@Component({
  selector: 'app-summary-panel',
  standalone: true,
  imports: [MatIconModule, MatDialogModule],
  templateUrl: './summary-panel.html',
  styleUrls: ['./summary-panel.scss'],
})
export class SummaryPanel {
  readonly store  = inject(PolicyStore);
  private readonly dialog  = inject(MatDialog);
  private readonly locale  = inject(LOCALE_ID);
  readonly summary = this.store.summary;

  openDrilldown(mode: DrilldownMode, status?: PolicyStatus): void {
    this.dialog.open(PolicyDrilldownDialog, {
      data: { mode, status },
      width: '85vw',
      maxWidth: '1100px',
      maxHeight: '80vh',
      panelClass: 'drilldown-dialog-panel',
    });
  }

  /** 0–100 percentage of active policies that are expiring within 30 days */
  readonly expiringPct = computed(() => {
    const s = this.store.summary();
    if (!s.activeCount) return 0;
    return Math.min(100, Math.round((s.expiringWithin30Days / s.activeCount) * 100));
  });

  /**
   * Returns the SVG stroke-dashoffset for a circle with r=18 (circumference ≈ 113).
   * offset = circumference * (1 - pct/100)
   */
  arcOffset(pct: number): number {
    const circumference = 2 * Math.PI * 18; // ~113.1
    return circumference * (1 - pct / 100);
  }

  readonly arcCircumference = 2 * Math.PI * 18;
  // GWP totals aggregate premiums across multiple currencies — displayed using
  // USD as the base reporting currency. In production, apply live FX rates to
  // convert each policy's premium before summing.
  formatPremium(value: number): string {
    const sym = getCurrencySymbol('USD', 'narrow', this.locale as string);
    if (value >= 1_000_000) return `${sym}${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000)     return `${sym}${(value / 1_000).toFixed(0)}K`;
    return `${sym}${value}`;
  }

  /** Returns width % of a LOB value vs total GWP (min 2% so bar is always visible) */
  barPct(value: number, total: number): string {
    if (!total) return '0%';
    return `${Math.max(2, Math.round((value / total) * 100))}%`;
  }
}
