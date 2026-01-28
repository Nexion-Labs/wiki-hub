import type { HTMLAttributes, ReactNode } from 'react';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  icon?: ReactNode;
  onClose?: () => void;
}

const variants = {
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: '💡',
    title: 'text-blue-900',
  },
  success: {
    container: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    icon: '✅',
    title: 'text-emerald-900',
  },
  warning: {
    container: 'bg-amber-50 border-amber-200 text-amber-800',
    icon: '⚠️',
    title: 'text-amber-900',
  },
  danger: {
    container: 'bg-red-50 border-red-200 text-red-800',
    icon: '🚨',
    title: 'text-red-900',
  },
};

export function Alert({
  children,
  variant = 'info',
  title,
  icon,
  onClose,
  className = '',
  ...props
}: AlertProps) {
  const styles = variants[variant];

  return (
    <div
      role="alert"
      className={`
        rounded-lg border p-4
        ${styles.container}
        ${className}
      `}
      {...props}
    >
      <div className="flex gap-3">
        <span className="text-xl flex-shrink-0">{icon || styles.icon}</span>
        <div className="flex-1">
          {title && (
            <h4 className={`font-semibold mb-1 ${styles.title}`}>{title}</h4>
          )}
          <div className="text-sm">{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
