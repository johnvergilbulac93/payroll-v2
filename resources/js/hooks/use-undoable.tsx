import { useRef } from 'react';
import { toast } from 'sonner';

const DEFAULT_UNDO_TIMEOUT_MS = 5000;

type UndoableActionOptions<T> = {
    /** The actual action to run once the undo window expires. */
    action: (value: T) => void;
    message: string;
    description?: string;
    timeout?: number;
    toastId?: string;
};

type PendingEntry = {
    timeout: ReturnType<typeof setTimeout>;
    interval: ReturnType<typeof setInterval>;
};

export function useUndoableAction<T>() {
    const pendingRef = useRef<Map<string, PendingEntry>>(new Map());

    const trigger = (value: T, options: UndoableActionOptions<T>) => {
        const {
            action,
            message,
            timeout = DEFAULT_UNDO_TIMEOUT_MS,
            toastId = `undoable-${Date.now()}-${Math.random()}`,
        } = options;

        const endTime = Date.now() + timeout;

        const clearPending = () => {
            const pending = pendingRef.current.get(toastId);

            if (pending) {
                clearTimeout(pending.timeout);
                clearInterval(pending.interval);
                pendingRef.current.delete(toastId);
            }
        };

        const render = () => {
            const remaining = Math.max(
                0,
                Math.ceil((endTime - Date.now()) / 1000),
            );
            const description =
                options.description ??
                `This action can be undone within ${remaining} second${remaining === 1 ? '' : 's'}.`;

            toast(message, {
                id: toastId,
                description,
                duration: timeout,
                action: {
                    label: 'Continue',
                    onClick: () => {
                        clearPending();
                        toast.dismiss(toastId);
                        action(value);
                    },
                },
                cancel: {
                    label: 'Cancel',
                    onClick: () => {
                        clearPending();
                        toast.dismiss(toastId);
                    },
                },
                classNames: {
                    actionButton: '!bg-destructive !text-white',
                },
            });

            if (remaining <= 0) {
                clearInterval(interval);
            }
        };

        const interval = setInterval(render, 1000);
        render();

        const timeoutId = setTimeout(() => {
            clearInterval(interval);
            toast.dismiss(toastId);
            action(value);
            pendingRef.current.delete(toastId);
        }, timeout);

        pendingRef.current.set(toastId, { timeout: timeoutId, interval });
    };

    return { trigger };
}
