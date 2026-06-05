export interface PolicySummary {
    activeCount: number;
    expiredCount: number;
    pendingCount: number;
    cancelledCount: number;
    totalPropertyPremium: number;
    totalCasualtyPremium: number;
    totalAHPremium: number;
    totalMarinePremium: number;
    expiringNext30DaysCount: number;
}