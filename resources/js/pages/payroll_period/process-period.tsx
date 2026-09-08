import { Link, router } from '@inertiajs/react';
import {
    IconCalendarMonth,
    IconCircleCheck,
    IconClock,
    IconShield,
    IconUser,
} from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import {
    lockPeriod,
    computePayroll,
    releasedPayslip,
    reComputePayroll,
} from '@/actions/App/Http/Controllers/Main/PayrollPeriodController';
import Stepper from '@/components/stepper';
import { Button } from '@/components/ui/button';
import {
    Item,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
    ItemActions,
} from '@/components/ui/item';
import { Spinner } from '@/components/ui/spinner';
import { index as dtrProcessIndex } from '@/routes/dtr';
import type { PayrollPeriod } from '@/types/payroll-period';
import type { StepperStep } from '@/types/stepper';

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

const workflowSteps: StepperStep[] = [
    {
        step: 1,
        title: 'DTR collection',
        description: 'Attendance being gathered and verified',
    },
    {
        step: 2,
        title: 'Lock & compute',
        description: 'DTR locked, payroll being calculated',
    },
    {
        step: 3,
        title: 'Review & release',
        description: 'Payslips finalized and released',
    },
];

export default function ProcessPeriodPage({ employee_details, period }: Props) {
    const [processing, setProcessing] = useState(false);
    const currentStep = useMemo<number>(() => {
        switch (period.Status) {
            case 'open':
                return 1;
            case 'processing':
                return 2;
            case 'closed':
                return 3;
            case 'released':
                return 4;
            default:
                return 1;
        }
    }, [period.Status]);

    const buttonLabel = useMemo(() => {
        switch (currentStep) {
            case 1:
                return 'Lock DTR';
            case 2:
                return 'Compute Payroll';
            case 3:
                return 'Release Payslips';
            case 4:
                return 'Generate Payslips';
            default:
                return 'Lock DTR';
        }
    }, [currentStep]);

    const onNextStep = () => {
        switch (currentStep) {
            case 1:
                router.post(
                    lockPeriod(Number(period.id)).url,
                    {},
                    {
                        preserveScroll: true,
                        onStart: () => setProcessing(true),
                        onFinish: () => setProcessing(false),
                        onHttpException: () => setProcessing(false),
                    },
                );
                break;
            case 2:
                router.post(
                    computePayroll(Number(period.id)).url,
                    {},
                    {
                        preserveScroll: true,
                        onStart: () => setProcessing(true),
                        onFinish: () => setProcessing(false),
                        onHttpException: () => setProcessing(false),
                    },
                );
                break;
            case 3:
                router.post(
                    releasedPayslip(Number(period.id)).url,
                    {},
                    {
                        preserveScroll: true,
                        onStart: () => setProcessing(true),
                        onFinish: () => setProcessing(false),
                        onHttpException: () => setProcessing(false),
                    },
                );
                break;

            case 4:
                alert('view payslip');
                break;
        }
    };

    const onRecomputePayroll = () => {
        router.post(
            reComputePayroll(Number(period.id)).url,
            {},
            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onFinish: () => setProcessing(false),
                onHttpException: () => setProcessing(false),
            },
        );
    };

    return (
        <div className="space-y-4 p-4">
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
            <div className="space-y-4">
                <Stepper steps={workflowSteps} modelValue={currentStep} />
                <div className="flex w-full justify-center">
                    <Item variant="outline">
                        <ItemMedia variant="icon">
                            <IconCalendarMonth className="text-muted-foreground" />
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle>{period.Label}</ItemTitle>
                            <ItemDescription>
                                {period.Cutoff} | {period.PeriodStart} -{' '}
                                {period.PeriodEnd} | Pay Date: {period.PayDate}
                            </ItemDescription>
                        </ItemContent>
                        <ItemActions>
                            {currentStep == 4 && (
                                <Button onClick={onRecomputePayroll}>
                                    {currentStep == 4 && processing && (
                                        <Spinner />
                                    )}
                                    Recompute payroll
                                </Button>
                            )}
                            <Button className="w-40" onClick={onNextStep}>
                                {currentStep !== 4 && processing && <Spinner />}
                                {buttonLabel}
                            </Button>
                        </ItemActions>
                    </Item>
                </div>
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
