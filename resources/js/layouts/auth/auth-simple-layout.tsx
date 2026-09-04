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
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-primary">
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage:
                        'radial-gradient(circle, rgba(255, 255, 255, 0.35) 1.5px, transparent 1.5px)',
                    backgroundSize: '20px 20px',
                    maskImage:
                        'radial-gradient(ellipse at center, transparent 20%, black 70%)',
                    WebkitMaskImage:
                        'radial-gradient(ellipse at center, transparent 20%, black 70%)',
                }}
            ></div>
            <div className="relative z-10 w-full max-w-md rounded-md border bg-primary-foreground p-6 shadow">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-2 font-medium"
                        >
                            <div className="mb-1 flex h-20 w-20 items-center justify-center rounded-md bg-primary p-1">
                                <AppLogoIcon className="size-20 text-primary dark:text-white" />
                            </div>
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-xl font-medium">{title}</h1>
                            <p className="text-center text-sm text-muted-foreground">
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
