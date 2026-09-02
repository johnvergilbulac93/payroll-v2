import { IconLoader2 } from '@tabler/icons-react';
import { useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type ConfirmDialogVariant = 'destructive' | 'default';

type ConfirmDialogProps = {
    /** Element that opens the dialog when clicked, e.g. a <Button>. */
    trigger?: ReactNode;
    /** Control the dialog externally instead of using a trigger. */
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    title: string;
    description?: ReactNode;
    icon?: ReactNode;
    confirmText?: string;
    cancelText?: string;
    variant?: ConfirmDialogVariant;
    loading?: boolean;
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void;
    size?: 'default' | 'sm';
};

export function ConfirmDialog({
    trigger,
    open,
    onOpenChange,
    title,
    description,
    icon,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'destructive',
    loading = false,
    onConfirm,
    onCancel,
    size = 'default',
}: ConfirmDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [isBusy, setIsBusy] = useState(false);

    const isControlled = open !== undefined;
    const isOpen = isControlled ? open : internalOpen;
    const busy = loading || isBusy;

    const setOpen = (next: boolean) => {
        if (isControlled) {
            onOpenChange?.(next);
        } else {
            setInternalOpen(next);
        }
    };

    const handleConfirm = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        try {
            setIsBusy(true);
            await onConfirm();
            setOpen(false);
        } finally {
            setIsBusy(false);
        }
    };

    const handleCancel = () => {
        onCancel?.();
        setOpen(false);
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setOpen}>
            {trigger && (
                <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
            )}
            <AlertDialogContent size={size}>
                <AlertDialogHeader>
                    {icon && (
                        <AlertDialogMedia
                            className={
                                variant === 'destructive'
                                    ? 'bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive'
                                    : 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                            }
                        >
                            {icon}
                        </AlertDialogMedia>
                    )}
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    {description && (
                        <AlertDialogDescription>
                            {description}
                        </AlertDialogDescription>
                    )}
                </AlertDialogHeader>
                <AlertDialogFooter >
                    <AlertDialogCancel
                        variant="outline"
                        onClick={handleCancel}
                        disabled={busy}
                    >
                        {cancelText}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        variant={variant}
                        onClick={handleConfirm}
                        disabled={busy}
                    >
                        {busy && (
                            <IconLoader2 className="size-4 animate-spin" />
                        )}
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
