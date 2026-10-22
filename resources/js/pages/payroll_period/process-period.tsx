import { Link, router } from '@inertiajs/react';
import {
    IconCalendarMonth,
    IconCircleCheck,
    IconClock,
    IconShield,
    IconUser,
    IconChevronRight,
    IconLock,
    IconReceipt,
    IconSparkles,
} from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import {
    lockPeriod,
    computePayroll,
    releasedPayslip,
} from '@/actions/App/Http/Controllers/Main/PayrollPeriodController';
import Stepper from '@/components/stepper';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

import { index as dtrProcessIndex } from '@/routes/dtr';
import { index as payrollPeriodIndex } from '@/routes/payroll_period';
import { generatePaySlip } from '@/routes/report';
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
    Processed: { icon: IconCircleCheck, className: 'h-5 w-5 text-emerald-600 dark:text-emerald-400' },
    Pending: { icon: IconClock, className: 'h-5 w-5 text-amber-600 dark:text-amber-400' },
    Flagged: { icon: IconShield, className: 'h-5 w-5 text-rose-600 dark:text-rose-400' },
    'No Entry': { icon: IconClock, className: 'h-5 w-5 text-muted-foreground' },
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
                router.visit(
                    generatePaySlip.url({ query: { period: period.id } }),
                    {
                        preserveScroll: true,
                        preserveState: true,
                    },
                );
                break;
        }
    };

    // const onRecomputePayroll = () => {
    //     router.post(
    //         reComputePayroll(Number(period.id)).url,
    //         {},
    //         {
    //             preserveScroll: true,
    //             onStart: () => setProcessing(true),
    //             onFinish: () => setProcessing(false),
    //             onHttpException: () => setProcessing(false),
    //         },
    //     );
    // };

    return (
        <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 md:p-6">
            <section className="relative overflow-hidden rounded-2xl border bg-sidebar shadow-sm">
                <div className="absolute inset-y-0 left-0 w-1 bg-primary" />
                <div className="flex flex-col gap-5 p-5 pl-6 md:flex-row md:items-center md:justify-between md:p-7 md:pl-8">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <IconCalendarMonth className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-medium text-muted-foreground">Payroll processing</p>
                                <span className="rounded-full border bg-muted/60 px-2.5 py-0.5 text-xs font-medium capitalize text-foreground">
                                    {period.Status.replace('_', ' ')}
                                </span>
                            </div>
                            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{period.Label}</h1>
                            <p className="text-sm text-muted-foreground">
                                {period.Cutoff} <span className="px-1.5">·</span> {period.PeriodStart} – {period.PeriodEnd}
                            </p>
                            <p className="text-sm text-muted-foreground">Pay date: <span className="font-medium text-foreground">{period.PayDate}</span></p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row md:items-center">
                        <Button
                            variant="outline"
                            onClick={() => router.visit(payrollPeriodIndex.url(), { preserveScroll: true, preserveState: true })}
                        >
                            Cancel
                        </Button>
                        <Button className="min-w-44 gap-2" onClick={onNextStep} disabled={processing}>
                            {processing ? <Spinner /> : currentStep === 1 ? <IconLock className="h-4 w-4" /> : currentStep === 4 ? <IconReceipt className="h-4 w-4" /> : <IconChevronRight className="h-4 w-4" />}
                            {buttonLabel}
                        </Button>
                    </div>
                </div>
            </section>

            <section className="space-y-3">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-base font-semibold">Attendance overview</h2>
                        <p className="text-sm text-muted-foreground">Check the DTR status before moving payroll forward.</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{employee_details.find((item) => item.label === 'Employees')?.value ?? 0} employees in this period</p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    {employee_details.map((item) => {
                        const config = iconMap[item.label];
                        const Icon = config?.icon ?? IconUser;
                        const detailsHref = item.label === 'Flagged' && Number(item.value) > 0
                            ? dtrProcessIndex({ query: { period: period.id, status: 'flagged' } }).url
                            : undefined;
                        const accent = item.label === 'Processed'
                            ? 'border-t-emerald-500'
                            : item.label === 'Pending'
                              ? 'border-t-amber-500'
                              : item.label === 'Flagged'
                                ? 'border-t-rose-500'
                                : item.label === 'Employees'
                                  ? 'border-t-primary'
                                  : 'border-t-muted-foreground/40';

                        return (
                            <div key={item.label} className={`rounded-xl border border-t-[3px] ${accent} bg-sidebar p-4 shadow-sm transition-shadow hover:shadow-md`}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                                        <p className="text-3xl font-semibold tracking-tight tabular-nums">{item.value.toLocaleString()}</p>
                                    </div>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/70">
                                        <Icon className={config?.className ?? 'h-5 w-5 text-primary'} />
                                    </div>
                                </div>
                                {detailsHref ? (
                                    <div className="mt-3 border-t pt-3">
                                        <Link href={detailsHref} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                                            Review flagged records <IconChevronRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="mt-3 border-t pt-3 text-xs text-muted-foreground">
                                        {item.label === 'Processed' ? 'Ready for payroll' : item.label === 'Pending' ? 'Needs attendance review' : item.label === 'No Entry' ? 'No attendance records' : item.label === 'Employees' ? 'Included in cutoff' : 'Current status'}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="rounded-2xl border bg-sidebar p-5 shadow-sm md:p-6">
                <div className="mb-6 flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <IconSparkles className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="font-semibold">Payroll workflow</h2>
                        <p className="mt-1 text-sm text-muted-foreground">Follow each step to validate attendance, calculate payroll, and release payslips.</p>
                    </div>
                </div>
                <Stepper steps={workflowSteps} modelValue={currentStep} className="pb-2" />
            </section>

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
