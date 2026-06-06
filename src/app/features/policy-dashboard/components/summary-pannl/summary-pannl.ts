import { Component,inject,computed } from '@angular/core';
import { PolicyStore } from '../../store/policy.store';
import { Policy } from '../../models/policy.model';

@Component({
  selector: 'app-summary-pannl',
  standalone: true,
  imports: [],
  templateUrl: './summary-pannl.html',
  styleUrls: ['./summary-pannl.scss'],
})
export class SummaryPannl {
    readonly store = inject(PolicyStore);

    readonly activeCount = computed(() => this.store.policies().filter((p: Policy) => p.status === 'Active').length);

    readonly expiredCount = computed(() => this.store.policies().filter((p: Policy) => p.status === 'Expired').length);

    readonly pendingCount = computed(() => this.store.policies().filter((p: Policy) => p. status === 'Pending').length);

    readonly cancelledCount = computed(() => this.store.policies().filter((p: Policy) => p.status === 'Cancelled').length);

    readonly summary = this.store.summary;

}
