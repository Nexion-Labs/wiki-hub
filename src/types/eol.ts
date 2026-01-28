// EOL Lifecycle Stages
export enum LifecycleStage {
    ACTIVE = 'active',
    MAINTENANCE = 'maintenance',
    DEPRECATED = 'deprecated',
    EOL = 'eol',
}

export const LIFECYCLE_STAGE_OPTIONS = [
    { value: LifecycleStage.ACTIVE, label: 'Active', color: 'green', icon: '✅' },
    { value: LifecycleStage.MAINTENANCE, label: 'Maintenance', color: 'blue', icon: '🔧' },
    { value: LifecycleStage.DEPRECATED, label: 'Deprecated', color: 'orange', icon: '⚠️' },
    { value: LifecycleStage.EOL, label: 'End of Life', color: 'gray', icon: '🚫' },
];

// Urgency levels for expiring versions
export enum UrgencyLevel {
    CRITICAL = 'critical', // < 30 days
    WARNING = 'warning',   // 30-60 days
    ATTENTION = 'attention', // 60-90 days
    SAFE = 'safe',         // > 90 days
}

// Filter options for getExpiringVersions
export interface ExpiringVersionsFilter {
    daysAhead?: number;
    urgencyLevels?: UrgencyLevel[];
    productIds?: string[];
    categoryIds?: string[];
    ltsOnly?: boolean;
    lifecycleStages?: LifecycleStage[];
    includeExpired?: boolean;
    limit?: number;
    offset?: number;
}

// Dashboard summary statistics
export interface EOLDashboardSummary {
    // Overview stats
    totalProducts: number;
    totalVersions: number;
    activeProducts: number;

    // Expiring versions by urgency
    expiringVersions: {
        total: number;
        critical: number;      // < 30 days
        warning: number;       // 30-60 days
        attention: number;     // 60-90 days
        expired: number;       // Already expired
    };

    // LTS stats
    ltsVersions: {
        total: number;
        expiring: number;      // LTS versions expiring within 90 days
        active: number;        // LTS versions still active
    };

    // By lifecycle stage
    versionsByLifecycle: {
        active: number;
        maintenance: number;
        deprecated: number;
        eol: number;
    };

    // By category (top 5)
    topCategories: Array<{
        categoryId: string;
        categoryName: string;
        categoryIcon: string;
        productCount: number;
        expiringCount: number;
    }>;

    // Top products with expiring versions
    topExpiringProducts: Array<{
        productId: string;
        productName: string;
        slug: string;
        categoryId: string;
        expiringCount: number;
        criticalCount: number;
        oldestExpiringVersion: {
            versionNumber: string;
            eolDate: string;
            daysUntilEol: number;
        };
    }>;

    // Recent activity
    recentlyExpired: Array<{
        versionId: string;
        productName: string;
        versionNumber: string;
        eolDate: string;
    }>;

    // Upcoming milestones
    upcomingEOL: Array<{
        versionId: string;
        productName: string;
        versionNumber: string;
        eolDate: string;
        daysUntilEol: number;
        isLts: boolean;
    }>;
}
