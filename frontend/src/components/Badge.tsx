import { memo } from 'react';
import { getBadgeClasses, type BadgeVariant } from '../lib/theme';

/**
 * Badge component with memoization
 * Following Vercel React Best Practices:
 * - rerender-memo: Memoized component prevents unnecessary re-renders
 * - rerender-dependencies: Uses primitive props (string, variant)
 */

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export const Badge = memo<BadgeProps>(({ variant, children, className = '' }) => {
  // Get badge classes from memoized Map lookup
  const variantClasses = getBadgeClasses(variant);

  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${variantClasses} ${className}`}
    >
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';
