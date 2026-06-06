import { Component, inject } from '@angular/core';
import { PolicyStore } from '../../store/policy.store';

@Component({
  selector: 'app-policy-table',
  standalone: true,
  imports: [],
  templateUrl: './policy-table.html',
  styleUrl: './policy-table.scss',
})
export class PolicyTable {
  readonly store = inject(PolicyStore);
}
