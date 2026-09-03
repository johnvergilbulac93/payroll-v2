import { IconLoader2 } from '@tabler/icons-react';
import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const sizeClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
    '3xl': 'sm:max-w-3xl',
    '4xl': 'sm:max-w-4xl',
    '5xl': 'sm:max-w-5xl',
    '6xl': 'sm:max-w-6xl',
    full: 'sm:max-w-[95vw]',
} as const;
type DialogSize = keyof typeof sizeClasses;

type FormDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    children: ReactNode;
    onAdd?: () => void | Promise<void>;
    onCancel?: () => void;
    addText?: string;
    cancelText?: string;
    loading?: boolean;
    size?: DialogSize;
    disabled?: boolean;
    canAdd?: boolean
};

export function FormDialog({
    open,
    onOpenChange,
    title,
    description,
    children,
    onAdd,
    onCancel,
    addText = 'Save',
    cancelText = 'Cancel',
    loading = false,
    size = 'md',
    disabled,
    canAdd= true
}: FormDialogProps) {
    const isBusy = loading;

    const onCancelRef = useRef(onCancel);

    const handleCancel = () => {
        onCancel?.();
        onOpenChange(false);
    };
    useEffect(() => {
        onCancelRef.current = onCancel;
    }, [onCancel]);

    const handleAdd = async () => {
        await onAdd?.();
    };

    useEffect(() => {
        if (!open) {
            onCancelRef.current?.();
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn(sizeClasses[size])}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && (
                        <DialogDescription>{description}</DialogDescription>
                    )}
                </DialogHeader>

                <>{children}</>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isBusy}
                    >
                        {cancelText}
                    </Button>
                    {canAdd && (
                        <Button
                            type="button"
                            onClick={handleAdd}
                            disabled={isBusy || disabled}
                        >
                            {isBusy && (
                                <IconLoader2 className="size-4 animate-spin" />
                            )}
                            {addText}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
