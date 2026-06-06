import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
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
  private readonly snackBar = inject(MatSnackBar);

  flagForReview(): void {
    const count = this.store.selectedCount();
    this.store.flagSelectedPolicies();
    const label = count === 1 ? '1 policy' : `${count} policies`;
    this.snackBar.open(`${label} flagged for review`, 'Dismiss', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: 'snack-flag-success',
    });
  }
}
