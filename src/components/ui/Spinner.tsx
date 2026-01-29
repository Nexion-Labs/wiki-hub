interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <div
      className={`animate-spin rounded-full border-b-2 border-emerald-600 ${sizes[size]} ${className}`}
    />
  );
}

interface LoadingStateProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function LoadingState({ text = 'Đang tải...', size = 'lg' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <Spinner size={size} />
      {text && <p className="text-slate-500">{text}</p>}
    </div>
  );
}

export function LoadingOverlay({ text }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <LoadingState text={text} size="xl" />
    </div>
  );
}
