import { PolicyFilter } from './policy-filter.model';

export interface PolicyQueryParams {
    pageIndex: number;
    pageSize: number;
    sortField?: string;
    sortDirection?: 'asc' | 'desc';
    filters: PolicyFilter;
}