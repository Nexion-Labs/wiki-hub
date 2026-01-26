/**
 * Centralized theme configuration and color utilities
 * Following Vercel React Best Practices:
 * - rerender-memo: Memoized color mapping functions
 * - js-index-maps: Use Map for O(1) lookups
 */

// Theme color definitions
export const colors = {
  primary: {
    50: 'bg-blue-50',
    100: 'bg-blue-100',
    600: 'bg-blue-600',
    700: 'bg-blue-700',
    text: {
      600: 'text-blue-600',
      800: 'text-blue-800',
    },
  },
  success: {
    100: 'bg-green-100',
    600: 'bg-green-600',
    text: {
      800: 'text-green-800',
    },
  },
  warning: {
    600: 'text-yellow-600',
    900: 'text-yellow-900',
  },
  danger: {
    100: 'bg-red-100',
    600: 'bg-red-600',
    text: {
      600: 'text-red-600',
      800: 'text-red-800',
      900: 'text-red-900',
    },
  },
  purple: {
    100: 'bg-purple-100',
    text: {
      600: 'text-purple-600',
    },
  },
  gray: {
    50: 'bg-gray-50',
    100: 'bg-gray-100',
    200: 'bg-gray-200',
    300: 'bg-gray-300',
    text: {
      500: 'text-gray-500',
      600: 'text-gray-600',
      700: 'text-gray-700',
      900: 'text-gray-900',
    },
  },
} as const;

// Badge variant type
export type BadgeVariant = 'success' | 'danger' | 'info' | 'warning';

// Use Map for O(1) lookups (js-index-maps)
const badgeVariantMap = new Map<BadgeVariant, string>([
  ['success', 'bg-green-100 text-green-800'],
  ['danger', 'bg-red-100 text-red-800'],
  ['info', 'bg-blue-100 text-blue-800'],
  ['warning', 'bg-yellow-100 text-yellow-800'],
]);

/**
 * Get badge classes based on variant
 * Memoized via Map lookup for performance
 */
export const getBadgeClasses = (variant: BadgeVariant): string => {
  return badgeVariantMap.get(variant) || badgeVariantMap.get('info')!;
};

// Status badge mapping
const statusBadgeMap = new Map<boolean, BadgeVariant>([
  [true, 'success'],
  [false, 'danger'],
]);

/**
 * Get badge variant based on active status
 */
export const getStatusBadgeVariant = (isActive: boolean): BadgeVariant => {
  return statusBadgeMap.get(isActive)!;
};

// Stat card color type
export type StatCardColor = 'blue' | 'green' | 'purple' | 'red';

// Stat card icon background mapping
const statCardColorMap = new Map<StatCardColor, string>([
  ['blue', 'bg-blue-100'],
  ['green', 'bg-green-100'],
  ['purple', 'bg-purple-100'],
  ['red', 'bg-red-100'],
]);

const statCardIconColorMap = new Map<StatCardColor, string>([
  ['blue', 'text-blue-600'],
  ['green', 'text-green-600'],
  ['purple', 'text-purple-600'],
  ['red', 'text-red-600'],
]);

/**
 * Get stat card background color class
 */
export const getStatCardBgClass = (color: StatCardColor): string => {
  return statCardColorMap.get(color) || statCardColorMap.get('blue')!;
};

/**
 * Get stat card icon color class
 */
export const getStatCardIconClass = (color: StatCardColor): string => {
  return statCardIconColorMap.get(color) || statCardIconColorMap.get('blue')!;
};
