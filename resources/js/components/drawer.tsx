// components/reusable-drawer.tsx
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import { Spinner } from './ui/spinner';

type ReusableDrawerProps = {
    title: string;
    description?: string;
    children: React.ReactNode;
    onSubmit: () => void;
    submitLabel?: string;
    cancelLabel?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    swipeDirectionMobile?: 'down' | 'right' | 'left' | 'up';
    swipeDirectionDesktop?: 'down' | 'right' | 'left' | 'up';
    loading?: boolean;
};

export function ReusableDrawer({
    title,
    description,
    children,
    onSubmit,
    submitLabel = 'Submit',
    cancelLabel = 'Cancel',
    open,
    loading,
    onOpenChange,
    swipeDirectionMobile = 'down',
    swipeDirectionDesktop = 'right',
}: ReusableDrawerProps) {
    const isMobile = useIsMobile();

    return (
        <Drawer
            open={open}
            onOpenChange={onOpenChange}
            showSwipeHandle={isMobile}
            swipeDirection={
                isMobile ? swipeDirectionMobile : swipeDirectionDesktop
            }
        >
            {/* <DrawerTrigger render={trigger} /> */}
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>{title}</DrawerTitle>
                    {description && (
                        <DrawerDescription>{description}</DrawerDescription>
                    )}
                </DrawerHeader>

                <div className="flex-1 scroll-fade overflow-y-auto p-4">
                    {children}
                </div>

                <DrawerFooter>
                    <Button
                        onClick={onSubmit}

                        disabled={loading}
                    >
                        {loading && <Spinner />}
                        {submitLabel}
                    </Button>
                    <DrawerClose
                        render={
                            <Button variant="outline">{cancelLabel}</Button>
                        }
                    />
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
