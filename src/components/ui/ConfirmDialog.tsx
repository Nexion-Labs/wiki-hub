import { Button } from './Button';
import { Dialog } from './Dialog';

export interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'primary' | 'secondary';
    isLoading?: boolean;
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    variant = 'danger',
    isLoading = false,
}: ConfirmDialogProps) {
    const icons = {
        danger: '⚠️',
        primary: 'ℹ️',
        secondary: '💡',
    };

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title={`${icons[variant]} ${title}`}
            description={description}
            size="md"
            footer={
                <>
                    <Button
                        variant={variant}
                        onClick={onConfirm}
                        isLoading={isLoading}
                    >
                        {confirmText}
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                </>
            }
        >
            <div className="text-slate-600">
                {description}
            </div>
        </Dialog>
    );
}
