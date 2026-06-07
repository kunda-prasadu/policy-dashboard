export type PolicyStatus = 'Active' | 'Expired' | 'Pending' | 'Cancelled';

export type LineOfBusiness = 'Property' | 'Casualty' | 'A&H' | 'Marine';

export type Currency = 'USD' | 'SGD' | 'HKD' | 'AUD' | 'JPY' | 'THB';

export type Region = 'Singapore' | 'Hong Kong' | 'Australia' | 'Japan' | 'Thailand' | 'Malaysia' | 'Indonesia' | 'Philippines';

export interface Policy {
  id: string;
  policyNumber: string;
  policyHolderName: string;
  lineOfBusiness: LineOfBusiness;
  status: PolicyStatus;
  premiumAmount: number;
  currency: Currency;
  region: Region;
  effectiveDate: Date;
  expiryDate: Date;
  underwriter: string;
  flaggedForReview: boolean;
}