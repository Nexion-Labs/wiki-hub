import { memo, forwardRef, type InputHTMLAttributes } from 'react';

/**
 * Input Component - Core form input with consistent styling
 *
 * Following Vercel React Best Practices:
 * - rerender-memo: Memoized component prevents unnecessary re-renders
 * - rerender-dependencies: Uses primitive props only
 * - rendering-hoist-jsx: Static class strings computed once
 */

export type InputSize = 'sm' | 'md' | 'lg';
export type InputVariant = 'default' | 'error' | 'success';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Size of the input
   * @default 'md'
   */
  size?: InputSize;

  /**
   * Visual variant
   * @default 'default'
   */
  variant?: InputVariant;

  /**
   * Label text
   */
  label?: string;

  /**
   * Error message to display
   */
  error?: string;

  /**
   * Helper text to display
   */
  helperText?: string;

  /**
   * Full width input
   * @default false
   */
  fullWidth?: boolean;
}

// Hoisted size mappings (rendering-hoist-jsx, js-index-maps)
const sizeClasses: Record<InputSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-5 py-3 text-lg',
};

// Hoisted variant mappings (js-index-maps)
const variantClasses: Record<InputVariant, string> = {
  default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
  error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
  success: 'border-green-500 focus:border-green-500 focus:ring-green-500',
};

// Base classes (rendering-hoist-jsx)
const baseClasses = 'w-full rounded-md border focus:outline-none focus:ring-2 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed';

/**
 * Input component with forward ref support
 * Memoized to prevent re-renders when parent updates
 */
export const Input = memo(
  forwardRef<HTMLInputElement, InputProps>(
    (
      {
        size = 'md',
        variant = 'default',
        label,
        error,
        helperText,
        fullWidth = false,
        className = '',
        disabled,
        ...props
      },
      ref
    ) => {
      // Derive variant from error prop (rerender-derived-state)
      const effectiveVariant = error ? 'error' : variant;

      // Combine classes (js-early-exit pattern for optimization)
      const sizeClass = sizeClasses[size];
      const variantClass = variantClasses[effectiveVariant];
      const widthClass = fullWidth ? 'w-full' : '';

      const inputClasses = `${baseClasses} ${sizeClass} ${variantClass} ${className}`;

      return (
        <div className={widthClass}>
          {/* Label */}
          {label && (
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {label}
              {props.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}

          {/* Input field */}
          <input
            ref={ref}
            className={inputClasses}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined
            }
            {...props}
          />

          {/* Error message */}
          {error && (
            <p
              id={`${props.id}-error`}
              className="mt-2 text-sm text-red-600"
              role="alert"
            >
              {error}
            </p>
          )}

          {/* Helper text */}
          {!error && helperText && (
            <p
              id={`${props.id}-helper`}
              className="mt-2 text-sm text-gray-500"
            >
              {helperText}
            </p>
          )}
        </div>
      );
    }
  )
);

Input.displayName = 'Input';
