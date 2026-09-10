import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { index as areaIndex } from '@/routes/maintenance/area_of_assignment';
import { index as groupIndex } from '@/routes/maintenance/group';
import { index as holidayIndex } from '@/routes/maintenance/holiday';
import { index as loanIndex } from '@/routes/maintenance/loan_type';
import { index as positionIndex } from '@/routes/maintenance/position';
import type { NavItem } from '@/types';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Loan Type',
        href: loanIndex.url(),
        icon: null,
    },
    {
        title: 'Group',
        href: groupIndex.url(),
        icon: null,
    },
    {
        title: 'Position',
        href: positionIndex.url(),
        icon: null,
    },
    {
        title: 'Area of assignment',
        href: areaIndex.url(),
        icon: null,
    },
    {
        title: 'Holiday',
        href: holidayIndex.url(),
        icon: null,
    },
];

export default function MaintenanceLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="px-4 py-6">
            <Heading
                title="Maintenance"
                description="Manage system master data and configurations."
            />

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav
                        className="flex flex-col space-y-1 space-x-0"
                        aria-label="Settings"
                    >
                        {sidebarNavItems.map((item, index) => (
                            <Button
                                key={`${toUrl(item.href)}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': isCurrentOrParentUrl(item.href),
                                })}
                            >
                                <Link href={item.href}>
                                    {item.icon && (
                                        <item.icon className="h-4 w-4" />
                                    )}
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="flex-1 md:max-w-5xl">
                    <section className="max-w-5xl space-y-12">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}
