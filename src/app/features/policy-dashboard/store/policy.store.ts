import { inject, Injectable, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { Policy } from '../models/policy.model';
import { PolicyApiService } from '../services/policy-api.service';
import { PolicyFilter } from '../models/policy-filter.model';
import { Pagination } from '../models/pagination.model';
import { SortState } from '../models/sort.model';
import { DEFAULT_FILTERS } from './policy-dashboard.state';
import { LoggerService } from '../../../core/services/logger.service';

@Injectable({ providedIn: 'root' })
export class PolicyStore {
    private readonly policyApiService = inject(PolicyApiService);
    private readonly logger = inject(LoggerService);
    private readonly destroyRef = inject(DestroyRef);

    readonly  policies = signal<Policy[]>([]);

    readonly loading = signal(false);

    readonly error = signal<string | null>(null);

    readonly filters = signal<PolicyFilter>(DEFAULT_FILTERS);

    readonly pagination = signal<Pagination>({ pageIndex: 0, pageSize: 10, totalRecords: 0 });

    readonly sort = signal<SortState>({ active: '', direction: '' });

    readonly selectedPolicyIds = signal<string[]>([]);

    readonly selectedCount =  computed(() => this.selectedPolicyIds().length);

    readonly hasSelection = computed(() => this.selectedCount() > 0);

    readonly totalPolicies = computed(() => this.policies().length);

    readonly filteredPolicies = computed(() => {
        const policies = this.policies() ?? [];
        const filters = this.filters();

        return policies.filter(policy => {
            const searchText = filters.searchTerm?.toLocaleLowerCase() ?? '';
            const matchesSearch = !searchText || policy.policyNumber.toLocaleLowerCase().includes(searchText) || policy.policyHolderName.toLocaleLowerCase().includes(searchText) || policy.underwriter.toLocaleLowerCase().includes(searchText);
            const matchesStatus = !filters.status || policy.status === filters.status;
            const matchesRegion = !filters.region || policy.region === filters.region;
            const matchesLOB = !filters.lineOfBusiness || policy.lineOfBusiness === filters.lineOfBusiness;

            const expiryDate = new Date(policy.expiryDate);
            const matchesDateFrom = !filters.startDate || expiryDate >= filters.startDate;
            const endOfDay = filters.endDate
                ? new Date(new Date(filters.endDate).setHours(23, 59, 59, 999))
                : null;
            const matchesDateTo = !endOfDay || expiryDate <= endOfDay;
            const matchesPremium = !filters.minPremium || policy.premiumAmount >= filters.minPremium;

            return matchesSearch && matchesStatus && matchesRegion && matchesLOB && matchesDateFrom && matchesDateTo && matchesPremium;
        })
    })

    readonly summary = computed(() => {
        const policies = this.filteredPolicies();
        const today = new Date();
        const next30Days = new Date();
        next30Days.setDate(today.getDate() + 30);

        return {
            activeCount: policies.filter(p => p.status === 'Active').length,
            expiredCount: policies.filter(p => p.status === 'Expired').length,
            pendingCount: policies.filter(p => p.status === 'Pending').length,
            cancelledCount: policies.filter(p => p.status === 'Cancelled').length,
            propertyPremium: policies.filter(p => p.lineOfBusiness === 'Property').reduce((sum, p) => sum + p.premiumAmount, 0),
            casualtyPremium: policies.filter(p => p.lineOfBusiness === 'Casualty').reduce((sum, p) => sum + p.premiumAmount, 0),
            ahPremium: policies.filter(p => p.lineOfBusiness === 'A&H').reduce((sum, p) => sum + p.premiumAmount, 0),
            marinePremium: policies.filter(p => p.lineOfBusiness === 'Marine').reduce((sum, p) => sum + p.premiumAmount, 0),
            get totalGwp() { return this.propertyPremium + this.casualtyPremium + this.ahPremium + this.marinePremium; },
            expiringWithin30Days: policies.filter(p => {
            const d = new Date(p.expiryDate);
            return d >= today && d <= next30Days;
        }).length
        }
    })

    loadingPolicies():void {
        this.loading.set(true);
        this.logger.info('Loading policies from API');

        this.policyApiService.getPolicies(this.filters(), this.sort()).subscribe({
            next: (policies) => {
                this.policies.set(policies);
                this.loading.set(false);
                this.logger.info(`Loaded ${policies.length} policies`);
            },
            error: (err: HttpErrorResponse | Error) => {
                const message = err instanceof HttpErrorResponse
                    ? err.error?.message || err.statusText
                    : err.message;
                this.error.set(message);
                this.loading.set(false);
                this.logger.error('Failed to load policies', err);
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
        this.logger.info(`Flagging ${selectedIds.length} policies for review`);

        // Snapshot for rollback if any API call fails
        const snapshot = this.policies();

        // Optimistic update — reflect in UI immediately
        const updatedPolicies = this.policies().map(policy =>
            selectedIds.includes(policy.id)
                ? { ...policy, flaggedForReview: true }
                : policy
        );
        this.policies.set(updatedPolicies);
        this.clearSelection();

        // Persist all flagged policies in parallel; rollback on any failure
        this.policyApiService.flagPolicies(selectedIds)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => { /* optimistic update already applied */ },
                error: (err) => {
                    this.logger.error('Failed to flag policies — rolling back', err);
                    this.policies.set(snapshot);
                    this.error.set('Failed to flag policies. Changes have been reverted.');
                },
            });
    }

    renewPolicy(id: string): void {
        this.logger.info(`Renewing policy ${id}`);
        // Snapshot for rollback
        const snapshot = this.policies();
        // Optimistic update — change status to Active immediately
        this.policies.update(all =>
            all.map(p => p.id === id ? { ...p, status: 'Active' as const } : p)
        );
        // Persist to backend; rollback on failure
        this.policyApiService.renewPolicy(id).subscribe({
            error: (err) => {
                this.logger.error(`Failed to renew policy ${id} — rolling back`, err);
                this.policies.set(snapshot);
                this.error.set(`Failed to renew policy. Changes have been reverted.`);
            },
        });
    }
}