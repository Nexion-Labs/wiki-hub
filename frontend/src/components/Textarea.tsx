import { memo, forwardRef, type TextareaHTMLAttributes } from 'react';

/**
 * Textarea Component - Core multi-line text input with consistent styling
 *
 * Following Vercel React Best Practices:
 * - rerender-memo: Memoized component prevents unnecessary re-renders
 * - rerender-dependencies: Uses primitive props only
 * - rendering-hoist-jsx: Static class strings computed once
 */

export type TextareaSize = 'sm' | 'md' | 'lg';
export type TextareaVariant = 'default' | 'error' | 'success';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Size of the textarea
   * @default 'md'
   */
  size?: TextareaSize;

  /**
   * Visual variant
   * @default 'default'
   */
  variant?: TextareaVariant;

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
   * Full width textarea
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Show character count
   */
  showCount?: boolean;
}

// Hoisted size mappings (rendering-hoist-jsx, js-index-maps)
const sizeClasses: Record<TextareaSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-5 py-3 text-lg',
};

// Hoisted variant mappings (js-index-maps)
const variantClasses: Record<TextareaVariant, string> = {
  default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
  error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
  success: 'border-green-500 focus:border-green-500 focus:ring-green-500',
};

// Base classes (rendering-hoist-jsx)
const baseClasses =
  'w-full rounded-md border focus:outline-none focus:ring-2 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed resize-y';

/**
 * Textarea component with forward ref support
 * Memoized to prevent re-renders when parent updates
 */
export const Textarea = memo(
  forwardRef<HTMLTextAreaElement, TextareaProps>(
    (
      {
        size = 'md',
        variant = 'default',
        label,
        error,
        helperText,
        fullWidth = false,
        showCount = false,
        className = '',
        disabled,
        maxLength,
        value,
        ...props
      },
      ref
    ) => {
      // Derive variant from error prop (rerender-derived-state)
      const effectiveVariant = error ? 'error' : variant;

      // Calculate character count (rerender-derived-state-no-effect)
      const currentLength = value?.toString().length || 0;

      // Combine classes (js-early-exit pattern for optimization)
      const sizeClass = sizeClasses[size];
      const variantClass = variantClasses[effectiveVariant];
      const widthClass = fullWidth ? 'w-full' : '';

      const textareaClasses = `${baseClasses} ${sizeClass} ${variantClass} ${className}`;

      return (
        <div className={widthClass}>
          {/* Label */}
          {label && (
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {label}
              {props.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}

          {/* Textarea field */}
          <textarea
            ref={ref}
            className={textareaClasses}
            disabled={disabled}
            maxLength={maxLength}
            value={value}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined
            }
            {...props}
          />

          {/* Character count */}
          {showCount && maxLength && (
            <div className="mt-1 text-right text-sm text-gray-500">
              {currentLength} / {maxLength}
            </div>
          )}

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

Textarea.displayName = 'Textarea';
