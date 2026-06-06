import { Component,inject,OnInit } from '@angular/core';
import { PolicyStore } from '../../store/policy.store';
import { PolicyFilter } from '../../components/policy-filter/policy-filter';
import { SummaryPannl } from '../../components/summary-pannl/summary-pannl';
import { PolicyTable } from '../../components/policy-table/policy-table';
import { BulkActionBar } from '../../components/bulk-action-bar/bulk-action-bar';
import { ActivatedRoute,Router } from '@angular/router';
@Component({
  selector: 'app-policy-dashboard',
  standalone: true,
  imports: [SummaryPannl, PolicyTable, BulkActionBar, PolicyFilter],
  templateUrl: './policy-dashboard.html',
  styleUrls: ['./policy-dashboard.scss'],
})
export class PolicyDashboard implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    readonly store = inject(PolicyStore);

    ngOnInit(): void {
        this.store.loadingPolicies();
    }

}
