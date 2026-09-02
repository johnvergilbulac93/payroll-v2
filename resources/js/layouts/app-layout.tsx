import { router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { BreadcrumbItem } from '@/types';

interface PageProps {
    flash: {
        success?: string;
        error?: string;
    };
    [key: string]: any;
}

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    const { flash } = usePage<PageProps>().props;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success, { id: `success-${Date.now()}` });
            router.replaceProp('flash.success', undefined);
        }

        if (flash?.error) {
            toast.error(flash.error, { id: `error-${Date.now()}` });
            router.replaceProp('flash.error', undefined);
        }
    }, [flash]);

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs}>
            {children}
        </AppLayoutTemplate>
    );
}
