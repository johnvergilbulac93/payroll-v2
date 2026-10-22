import { Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name, description: companyDescription } = usePage().props;

    return (
        <main className="grid min-h-screen bg-background lg:grid-cols-2">
            <section className="relative hidden overflow-hidden bg-sidebar text-sidebar-foreground lg:flex lg:flex-col lg:items-center lg:justify-center lg:px-12">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-80"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle, rgba(255, 255, 255, 0.16) 1.5px, transparent 1.5px)',
                        backgroundSize: '24px 24px',
                        maskImage:
                            'radial-gradient(ellipse at center, transparent 15%, black 75%)',
                        WebkitMaskImage:
                            'radial-gradient(ellipse at center, transparent 15%, black 75%)',
                    }}
                />
                <div className="relative z-10 flex max-w-lg flex-col items-center text-center">
                    <Link
                        href={home()}
                        aria-label="Go to home"
                        className="mb-8"
                    >
                        <div className="flex size-32 items-center justify-center rounded-[2rem] border border-white/15 bg-sidebar-primary p-5 shadow-2xl shadow-black/20">
                            <AppLogoIcon className="size-full fill-current text-sidebar-primary-foreground" />
                        </div>
                    </Link>
                    <h2 className="text-3xl font-bold tracking-tight xl:text-4xl">
                        {name || 'Payroll Management System'}
                    </h2>
                    <p className="mt-4 max-w-md text-sm leading-7 text-sidebar-foreground/75 xl:text-base">
                        {companyDescription ||
                            'A simpler way to manage your workforce and payroll.'}
                    </p>
                    <div className="mt-10 h-1 w-16 rounded-full bg-sidebar-primary" />
                </div>
                <p className="absolute bottom-6 text-xs text-sidebar-foreground/50">
                    Secure workforce and payroll management
                </p>
            </section>

            <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10 lg:px-12">
                <div className="w-full max-w-md">
                    <div className="mb-8 flex flex-col gap-3 lg:mb-10">
                        <div className="mb-2 flex items-center gap-3 lg:hidden">
                            <div className="flex size-12 items-center justify-center rounded-xl bg-sidebar-primary p-2 text-sidebar-primary-foreground shadow-md ring-1 ring-sidebar-primary/20">
                                <AppLogoIcon className="size-full fill-current text-sidebar-primary-foreground" />
                            </div>
                            <span className="text-sm font-semibold text-foreground">
                                {name || 'Payroll Management System'}
                            </span>
                        </div>
                        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                            {title}
                        </h1>
                        <p className="text-sm leading-6 text-muted-foreground">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>
            </section>
        </main>
    );
}
