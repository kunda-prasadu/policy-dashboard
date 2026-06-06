import { Component,inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { PolicyStore } from '../../store/policy.store';

@Component({
  selector: 'app-bulk-action-bar',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './bulk-action-bar.html',
  styleUrl: './bulk-action-bar.scss',
})
export class BulkActionBar {
  readonly store = inject(PolicyStore);

  flagForreview(): void {
    this.store.flagSelectedPolicies();
  }
}
