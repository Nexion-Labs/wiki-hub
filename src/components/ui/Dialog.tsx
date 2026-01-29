import { type ReactNode, useEffect, useRef } from 'react';
import { Button } from './Button';
import { XIcon } from '../icons';

export interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: ReactNode;
    footer?: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    className?: string;
}

export function Dialog({
    isOpen,
    onClose,
    title,
    description,
    children,
    footer,
    size = 'md',
    className = '',
}: DialogProps) {
    const dialogRef = useRef<HTMLDivElement>(null);

    // Close on ESC key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    // Close on backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (dialogRef.current === e.target) {
            onClose();
        }
    };

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-[95vw]',
    };

    return (
        <div 
            ref={dialogRef}
            onClick={handleBackdropClick}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
        >
            <div 
                className={`bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 ${className}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                        {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <XIcon size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-6 overflow-y-auto">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-row-reverse gap-3 shrink-0">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
