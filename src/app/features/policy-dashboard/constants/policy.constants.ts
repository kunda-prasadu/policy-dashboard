import { LineOfBusiness, PolicyStatus, Region } from '../models/policy.model';

export const POLICY_STATUSES: PolicyStatus[] = ['Active', 'Expired', 'Pending', 'Cancelled'];
export const REGIONS: Region[] = ['Singapore', 'Hong Kong', 'Australia', 'Japan', 'Thailand', 'Malaysia', 'Indonesia', 'Philippines'];
export const LINE_OF_BUSINESS: LineOfBusiness[] = ['Property', 'Casualty', 'A&H', 'Marine'];