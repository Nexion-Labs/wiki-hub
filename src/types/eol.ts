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
