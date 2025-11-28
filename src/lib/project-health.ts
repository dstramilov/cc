// Utility function to calculate project health based on budget and hours usage
export type ProjectHealth = 'healthy' | 'warning' | 'critical';

export interface ProjectHealthInfo {
    status: ProjectHealth;
    color: string;
    bgColor: string;
    textColor: string;
    label: string;
}

export function calculateProjectHealth(
    budgetUsedPercent: number,
    hoursUsedPercent: number
): ProjectHealthInfo {
    // Critical: Over 90% budget or hours used
    if (budgetUsedPercent > 90 || hoursUsedPercent > 90) {
        return {
            status: 'critical',
            color: '#ef4444', // red-500
            bgColor: '#fee2e2', // red-100
            textColor: '#991b1b', // red-800
            label: 'Critical'
        };
    }

    // Warning: Over 75% budget or hours used
    if (budgetUsedPercent > 75 || hoursUsedPercent > 75) {
        return {
            status: 'warning',
            color: '#f59e0b', // amber-500
            bgColor: '#fef3c7', // amber-100
            textColor: '#92400e', // amber-800
            label: 'At Risk'
        };
    }

    // Healthy: Under 75%
    return {
        status: 'healthy',
        color: '#10b981', // green-500
        bgColor: '#d1fae5', // green-100
        textColor: '#065f46', // green-800
        label: 'Healthy'
    };
}

export function getOverallHealth(
    totalBudget: number,
    dollarSpent: number,
    totalHoursBudget: number,
    totalHoursUsed: number
): ProjectHealthInfo {
    const budgetPercent = totalBudget > 0 ? (dollarSpent / totalBudget) * 100 : 0;
    const hoursPercent = totalHoursBudget > 0 ? (totalHoursUsed / totalHoursBudget) * 100 : 0;

    return calculateProjectHealth(budgetPercent, hoursPercent);
}
