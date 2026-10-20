import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-sidebar px-4 py-10 text-sidebar-foreground">
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage:
                        'radial-gradient(circle, rgba(255, 255, 255, 0.16) 1.5px, transparent 1.5px)',
                    backgroundSize: '24px 24px',
                    maskImage:
                        'radial-gradient(ellipse at center, transparent 20%, black 70%)',
                    WebkitMaskImage:
                        'radial-gradient(ellipse at center, transparent 20%, black 70%)',
                }}
            ></div>
            <div className="relative z-10 w-full max-w-md rounded-2xl border border-sidebar-border bg-background p-7 text-foreground shadow-2xl shadow-black/25 sm:p-9">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-2 font-medium"
                        >
                            <div className="mb-1 flex h-16 w-16 items-center justify-center rounded-2xl bg-sidebar-primary p-2 text-sidebar-primary-foreground shadow-lg shadow-blue-950/25">
                                <AppLogoIcon className="size-12 fill-current text-sidebar-primary-foreground" />
                            </div>
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                            <p className="text-center text-sm leading-6 text-muted-foreground">
                                {description}
                            </p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
