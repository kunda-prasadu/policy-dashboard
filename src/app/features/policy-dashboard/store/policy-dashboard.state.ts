import { PolicyFilter } from "../models/policy-filter.model";

export const DEFAULT_FILTERS: PolicyFilter = {
    searchTerm: '',
    status:'',
    lineOfBusiness: '',
    region: '',
    startDate: undefined,
    endDate: undefined
}