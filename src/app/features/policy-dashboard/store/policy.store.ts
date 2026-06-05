import { inject, Injectable, signal,computed } from '@angular/core';
import { Policy } from '../models/policy.model';
import { PolicyApiService } from '../services/policy-api.service';

export class PolicyStore {
    private readonly policyApiService = inject(PolicyApiService);

    readonly  policies = signal<Policy[]>([]);

    readonly loading = signal(false);

    readonly error = signal<string | null>(null);

    readonly totalPolicies = computed(() => this.policies.length);

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
}