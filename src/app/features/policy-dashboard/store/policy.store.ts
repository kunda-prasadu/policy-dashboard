import { inject, Injectable, signal,computed } from '@angular/core';
import { Policy } from '../models/policy.model';
import { PolicyApiService } from '../services/policy-api.service';
import { PolicyFilter } from '../models/policy-filter.model';
import { Pagination } from '../models/pagination.model';
import { SortState } from '../models/sort.model';
import { DEFAULT_FILTERS } from './policy-dashboard.state';

@Injectable({ providedIn: 'root' })
export class PolicyStore {
    private readonly policyApiService = inject(PolicyApiService);

    readonly  policies = signal<Policy[]>([]);

    readonly loading = signal(false);

    readonly error = signal<string | null>(null);

    readonly filters = signal<PolicyFilter>(DEFAULT_FILTERS);

    readonly pagination = signal<Pagination>({ pageIndex: 0, pageSize: 10, totalRecords: 0 });

    readonly sort = signal<SortState>({ active: '', direction: '' });

    readonly selectedPolicyIds = signal<String[]>([]);

    readonly selectedCount =  computed(() => this.selectedPolicyIds().length);

    readonly hasSelection = computed(() => this.selectedCount() > 0);

    readonly totalPolicies = computed(() => this.policies().length);

    readonly filteredPolicies = computed(() => {
        const policies = this.policies();
        const filters = this.filters();

        return policies.filter(policy =>{
            const matchesSearch = !filters.searchTerm || policy.policyNumber.toLocaleLowerCase().includes(filters.searchTerm.toLocaleLowerCase());
            const matchesStatus = !filters.status || policy.status === filters.status;
            const matchesRegion = !filters.region || policy.region === filters.region;
            const matchesLOB = !filters.lineOfBusiness || policy.lineOfBusiness === filters.lineOfBusiness;

            return matchesSearch && matchesStatus && matchesRegion && matchesLOB;
        })
    })

    loadingPolicies():void {
        this.loading.set(true);

        this.policyApiService.getPolicies().subscribe({
            next: (policies) => {
                this.policies.set(policies);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set(err.message);
                this.loading.set(false);
            }
        })
    }

    updateFilters( filters: Partial<PolicyFilter>): void {
        this.filters.update(current => ({ ...current, ...filters }));
    }

    updatePagination(pageIndex:number, pageSize?: number): void {
        this.pagination.update(current => ({ ...current, pageIndex, ...(pageSize !== undefined && { pageSize }) }));
    }

    updateSort(active: string, direction: 'asc' | 'desc' | ''): void {
        this.sort.set({ active, direction });
    }

    toggleSelection(policyId: string): void {
        const selected = this.selectedPolicyIds();
        if (selected.includes(policyId)) {
            this.selectedPolicyIds.set(selected.filter(id => id !== policyId));
            return;
        }
    this.selectedPolicyIds.set([...selected, policyId]);
    }

    clearSelection(): void {
        this.selectedPolicyIds.set([]);
    }

    selectAll(policyIds: string[]): void {
        this.selectedPolicyIds.set(policyIds);
    }
  
    flagSelectedPolicies(): void {
        const selectedIds = this.selectedPolicyIds();
        const updatedPolicies = this.policies().map(policy => {
            if(selectedIds.includes(policy.id)) {
                return { ...policy, flaggedForReview: true };
            }
            return policy;  
        })
        this.policies.set(updatedPolicies);
        this.clearSelection();
    }
}