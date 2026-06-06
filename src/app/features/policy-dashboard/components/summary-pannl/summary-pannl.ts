import { Component, inject } from '@angular/core';
import { PolicyStore } from '../../store/policy.store';

@Component({
  selector: 'app-summary-pannl',
  standalone: true,
  imports: [],
  templateUrl: './summary-pannl.html',
  styleUrls: ['./summary-pannl.scss'],
})
export class SummaryPannl {
  readonly store = inject(PolicyStore);
  readonly summary = this.store.summary;

  /** Compact currency: 1_500_000 → $1.5M, 250_000 → $250K */
  formatPremium(value: number): string {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000)     return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value}`;
  }
}
