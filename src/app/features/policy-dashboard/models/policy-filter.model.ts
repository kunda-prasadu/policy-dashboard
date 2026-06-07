import { LineOfBusiness, PolicyStatus, Region } from './policy.model';

export interface PolicyFilter {
  searchTerm: string;
  lineOfBusiness?: LineOfBusiness | '';
  status?: PolicyStatus | '';
  region?: Region | '';
  startDate?: Date;
  endDate?: Date;
  minPremium?: number;
}