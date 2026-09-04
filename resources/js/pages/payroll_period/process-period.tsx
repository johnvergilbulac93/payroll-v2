import { Link } from '@inertiajs/react';
import {
    IconCircleCheck,
    IconClock,
    IconShield,
    IconUser,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import {
    Item,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
    ItemActions,
} from '@/components/ui/item';
import { index as dtrProcessIndex } from '@/routes/dtr';
import type { PayrollPeriod } from '@/types/payroll-period';
type SummaryItem = {
    label: string;
    value: number;
};

type Props = {
    employee_details: SummaryItem[];
    period: PayrollPeriod;
};

const iconMap: Record<string, { icon: typeof IconUser; className: string }> = {
    Employees: { icon: IconUser, className: 'text-primary h-5' },
    Processed: { icon: IconCircleCheck, className: 'text-primary h-5' },
    Flagged: { icon: IconShield, className: 'text-primary h-5' },
    Pending: { icon: IconClock, className: 'text-primary h-5' },
};

export default function ProcessPeriodPage({ employee_details, period }: Props) {
    return (
        <div className="p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {employee_details.map((item) => {
                    const config = iconMap[item.label];
                    const Icon = config?.icon ?? IconUser;
                    const detailsHref =
                        ['Flagged', 'Pending'].includes(item.label) &&
                        Number(item.value) > 0
                            ? dtrProcessIndex({ query: { period: period.id } })
                                  .url
                            : undefined;

                    return (
                        <Item key={item.label} variant="outline">
                            <ItemMedia variant="icon">
                                <Icon className={config?.className} />
                            </ItemMedia>
                            <ItemContent>
                                <ItemTitle>{item.label}</ItemTitle>
                                <ItemDescription className="text-lg">
                                    {item.value}
                                </ItemDescription>
                            </ItemContent>
                            {detailsHref && (
                                <ItemActions>
                                    <Button size="sm" variant="outline" asChild>
                                        <Link href={detailsHref}>Review</Link>
                                    </Button>
                                </ItemActions>
                            )}
                        </Item>
                    );
                })}
            </div>
        </div>
    );
}

ProcessPeriodPage.layout = {
    breadcrumbs: [
        {
            title: 'Process period',
            href: '#',
        },
    ],
};
