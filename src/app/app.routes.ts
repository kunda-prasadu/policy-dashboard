import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/policy-dashboard/pages/policy-dashboard/policy-dashboard').then(m => m.PolicyDashboard)
    }
];
