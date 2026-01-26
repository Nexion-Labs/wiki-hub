import { memo, type ButtonHTMLAttributes } from 'react';

/**
 * Button component with variant styles
 * Following Vercel React Best Practices:
 * - rerender-memo: Memoized component
 * - rerender-dependencies: Primitive props
 */

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'warning' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

// Variant class mapping (js-index-maps for O(1) lookup)
const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400',
  danger: 'text-red-600 hover:text-red-900',
  warning: 'text-yellow-600 hover:text-yellow-900',
  ghost: 'text-gray-400 hover:text-gray-600',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg',
};

export const Button = memo<ButtonProps>(({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const variantClass = variantClasses[variant];
  const sizeClass = sizeClasses[size];

  const baseClasses = variant === 'danger' || variant === 'warning' || variant === 'ghost'
    ? 'font-medium focus:outline-none'
    : 'rounded-md font-medium focus:outline-none focus:ring-2';

  return (
    <button
      className={`${baseClasses} ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';
