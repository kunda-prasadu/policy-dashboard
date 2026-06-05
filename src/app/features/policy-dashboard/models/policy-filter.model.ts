import { LineOfBussiness,PolicyStatus, Region } from './policy.model';

export interface PolicyFilter {
  searchTerm: string;
  lineOfBusiness?: LineOfBussiness | '';
  status?: PolicyStatus | '';
  region?: Region | '';
  startDate?: Date;
  endDate?: Date;
}