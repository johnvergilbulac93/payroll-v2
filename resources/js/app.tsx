import { createInertiaApp } from '@inertiajs/react';
import {
    IconAlertTriangleFilled,
    IconCircleCheckFilled,
    IconCircleXFilled,
    IconInfoCircleFilled,
} from '@tabler/icons-react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import MaintenanceLayout from '@/layouts/maintenance/layout';
import SettingsLayout from '@/layouts/settings/layout';
const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
                return null;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            case name.startsWith('maintenance/'):
                return [AppLayout, MaintenanceLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster
                    position="top-right"
                    duration={2000}
                    closeButton
                    swipeDirections={['right']}
                    icons={{
                        success: (
                            <IconCircleCheckFilled className="h-5 w-5 text-primary" />
                        ),
                        error: (
                            <IconCircleXFilled className="h-5 w-5 text-destructive" />
                        ),
                        warning: (
                            <IconAlertTriangleFilled className="h-5 w-5 text-yellow-500" />
                        ),
                        info: (
                            <IconInfoCircleFilled className="h-5 w-5 text-blue-500" />
                        ),
                    }}
                />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#165DFC',
    },
});

// This will set light / dark mode on load...
initializeTheme();
