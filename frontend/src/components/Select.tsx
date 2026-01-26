import { memo, forwardRef, type SelectHTMLAttributes } from 'react';

/**
 * Select Component - Core dropdown select with consistent styling
 *
 * Following Vercel React Best Practices:
 * - rerender-memo: Memoized component prevents unnecessary re-renders
 * - rerender-dependencies: Uses primitive props only
 * - rendering-hoist-jsx: Static class strings computed once
 * - js-index-maps: Use Record for O(1) class lookups
 */

export type SelectSize = 'sm' | 'md' | 'lg';
export type SelectVariant = 'default' | 'error' | 'success';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /**
   * Size of the select
   * @default 'md'
   */
  size?: SelectSize;

  /**
   * Visual variant
   * @default 'default'
   */
  variant?: SelectVariant;

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
   * Full width select
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Options array
   */
  options?: SelectOption[];

  /**
   * Placeholder text (shown as first disabled option)
   */
  placeholder?: string;
}

// Hoisted size mappings (rendering-hoist-jsx, js-index-maps)
const sizeClasses: Record<SelectSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-5 py-3 text-lg',
};

// Hoisted variant mappings (js-index-maps)
const variantClasses: Record<SelectVariant, string> = {
  default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
  error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
  success: 'border-green-500 focus:border-green-500 focus:ring-green-500',
};

// Base classes (rendering-hoist-jsx)
const baseClasses =
  'w-full rounded-md border bg-white focus:outline-none focus:ring-2 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed appearance-none bg-no-repeat bg-right pr-10';

// Background image for arrow (rendering-hoist-jsx)
const arrowStyles = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
  backgroundPosition: 'right 0.5rem center',
  backgroundSize: '1.5em 1.5em',
};

/**
 * Select component with forward ref support
 * Memoized to prevent re-renders when parent updates
 */
export const Select = memo(
  forwardRef<HTMLSelectElement, SelectProps>(
    (
      {
        size = 'md',
        variant = 'default',
        label,
        error,
        helperText,
        fullWidth = false,
        options = [],
        placeholder,
        className = '',
        disabled,
        children,
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

      const selectClasses = `${baseClasses} ${sizeClass} ${variantClass} ${className}`;

      return (
        <div className={widthClass}>
          {/* Label */}
          {label && (
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {label}
              {props.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}

          {/* Select field */}
          <div className="relative">
            <select
              ref={ref}
              className={selectClasses}
              style={arrowStyles}
              disabled={disabled}
              aria-invalid={!!error}
              aria-describedby={
                error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined
              }
              {...props}
            >
              {/* Placeholder */}
              {placeholder && (
                <option value="" disabled>
                  {placeholder}
                </option>
              )}

              {/* Options from array */}
              {options.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </option>
              ))}

              {/* Children options (alternative to options prop) */}
              {children}
            </select>
          </div>

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

Select.displayName = 'Select';
