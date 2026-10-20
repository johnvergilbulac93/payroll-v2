import { Head, router } from '@inertiajs/react';
import {
    IconArrowLeft,
    IconBuilding,
    IconCalendarStats,
    IconClockHour4,
    IconEdit,
    IconId,
    IconLoader2,
    IconUser,
} from '@tabler/icons-react';
import { useState } from 'react';
import { EmployeeDtr } from '@/pages/process_dtr/employee-dtr';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import type { DTRRecordsDetails } from '@/types/payroll-period';

type Employee = {
    id: number;
    FullName: string;
    EmpNbr: string;
    Assignment: string | null;
    Department: string | null;
};

type PayrollSummary = {
    TotalWorkingDays: number | string;
    Absences: number | string;
    Tardiness: number | string;
    OTHours: number | string;
    NDHours: number | string;
    RegularHoliday: number | string;
    SpecialHoliday: number | string;
    SL: number | string;
    VL: number | string;
} | null;

type Props = {
    employee: Employee;
    period: {
        id: number;
        Label: string;
        PeriodStart: string;
        PeriodEnd: string;
        PayDate: string;
    };
    dtrRecords: DTRRecordsDetails[];
    payrollSummary: PayrollSummary;
};

const summaryItems = [
    ['Total Working Days', 'TotalWorkingDays'],
    ['Absences', 'Absences'],
    ['Tardiness', 'Tardiness'],
    ['OT Hours', 'OTHours'],
    ['ND Hours', 'NDHours'],
    ['Regular Holiday', 'RegularHoliday'],
    ['Special Holiday', 'SpecialHoliday'],
    ['SL', 'SL'],
    ['VL', 'VL'],
] as const;

const summaryGroups = [
    {
        title: 'Attendance',
        description: 'Work days and attendance adjustments',
        keys: ['TotalWorkingDays', 'Absences', 'Tardiness'],
    },
    {
        title: 'Hours',
        description: 'Overtime and night differential',
        keys: ['OTHours', 'NDHours'],
    },
    {
        title: 'Holidays & leave',
        description: 'Holiday credits and leave totals',
        keys: ['RegularHoliday', 'SpecialHoliday', 'SL', 'VL'],
    },
] as const;

const formatSummaryValue = (value: number | string): number | string => {
    const numericValue = Number(value);

    return Number.isNaN(numericValue) ? value : numericValue;
};

const formatDate = (value: string): string => {
    if (!value) return '—';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('en-PH', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Manila',
    }).format(date);
};

export default function EmployeeAttendanceLogs({
    employee,
    period,
    dtrRecords,
    payrollSummary,
}: Props) {
    const [editSummaryOpen, setEditSummaryOpen] = useState(false);
    const [summaryForm, setSummaryForm] = useState<
        Record<string, number | string>
    >({});
    const [isSubmittingSummary, setIsSubmittingSummary] = useState(false);

    const openEditSummary = () => {
        if (!payrollSummary) {
            return;
        }

        setSummaryForm(
            Object.fromEntries(
                summaryItems.map(([, key]) => [
                    key,
                    formatSummaryValue(payrollSummary[key]),
                ]),
            ),
        );
        setEditSummaryOpen(true);
    };

    const updateSummaryValue = (key: string, value: string) => {
        setSummaryForm((current) => ({
            ...current,
            [key]: value,
        }));
    };

    const submitPayrollSummary = () => {
        setIsSubmittingSummary(true);

        router.put(
            `/dtr/period/${period.id}/employee/${employee.id}/payroll-summary`,
            summaryForm,
            {
                preserveScroll: true,
                onSuccess: () => setEditSummaryOpen(false),
                onFinish: () => setIsSubmittingSummary(false),
            },
        );
    };

    return (
        <div className="min-h-full space-y-6 p-4 md:p-6">
            <Head title={`Attendance Logs — ${employee.FullName}`} />

            <Button
                variant="ghost"
                className="-ml-3 text-muted-foreground hover:text-foreground"
                onClick={() =>
                    router.visit('/dtr', {
                        data: { period: period.id },
                    })
                }
            >
                <IconArrowLeft className="size-4" />
                Back to DTR Processing
            </Button>

            <div className="relative overflow-hidden rounded-2xl border bg-card shadow-sm">
                <div className="absolute inset-y-0 left-0 w-1.5 bg-primary" />
                <div className="flex flex-col gap-5 p-5 pl-7 sm:p-7 sm:pl-9 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                <IconCalendarStats className="size-3.5" />
                                {period.Label}
                            </span>
                            <span className="rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
                                Employee attendance
                            </span>
                        </div>
                        <Heading
                            title="Employee Attendance Logs"
                            description="Review daily time records and payroll attendance totals for this employee."
                        />
                        <p className="mt-3 text-sm text-muted-foreground">
                            Pay period: <span className="font-medium text-foreground">{formatDate(period.PeriodStart)}</span>
                            {' — '}
                            <span className="font-medium text-foreground">{formatDate(period.PeriodEnd)}</span>
                        </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 rounded-xl border bg-muted/40 p-3 sm:min-w-56">
                        <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <IconClockHour4 className="size-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">PAY DATE</p>
                            <p className="mt-0.5 font-semibold">{formatDate(period.PayDate)}</p>
                        </div>
                    </div>
                </div>
            </div>

            <section className="space-y-3">
                <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <IconUser className="size-4" />
                    </div>
                    <div>
                        <h2 className="font-semibold tracking-tight">Employee information</h2>
                        <p className="text-xs text-muted-foreground">Identity and assignment details</p>
                    </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <div className="rounded-xl border bg-card p-4 transition-colors hover:bg-muted/20">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <IconId className="size-4" />
                            <p className="text-xs font-semibold tracking-wide uppercase">Employee ID</p>
                        </div>
                        <p className="mt-2 break-words text-base font-semibold">{employee.EmpNbr || '—'}</p>
                    </div>
                    <div className="rounded-xl border bg-card p-4 transition-colors hover:bg-muted/20">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <IconUser className="size-4" />
                            <p className="text-xs font-semibold tracking-wide uppercase">Full name</p>
                        </div>
                        <p className="mt-2 break-words text-base font-semibold">{employee.FullName}</p>
                    </div>
                    <div className="rounded-xl border bg-card p-4 transition-colors hover:bg-muted/20 sm:col-span-2 xl:col-span-1">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <IconBuilding className="size-4" />
                            <p className="text-xs font-semibold tracking-wide uppercase">Department / Assignment</p>
                        </div>
                        <p className="mt-2 break-words text-base font-semibold">{employee.Department ?? employee.Assignment ?? '—'}</p>
                        {employee.Department && employee.Assignment && employee.Department !== employee.Assignment && (
                            <p className="mt-1 text-xs text-muted-foreground">{employee.Assignment}</p>
                        )}
                    </div>
                </div>
            </section>

            <section className="space-y-3 rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="font-semibold tracking-tight">Daily time record</h2>
                        <p className="text-sm text-muted-foreground">Daily punches, worked hours, overtime, tardiness, and undertime.</p>
                    </div>
                    <span className="mt-1 w-fit rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground sm:mt-0">
                        {dtrRecords.filter((record) => record.DTRDate !== 'TOTAL').length} record days
                    </span>
                </div>
                <EmployeeDtr dailyTimeRecords={dtrRecords} />
            </section>

            <section className="space-y-4 rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="font-semibold tracking-tight">Payroll summary</h2>
                        <p className="text-sm text-muted-foreground">Attendance totals used for payroll calculations.</p>
                    </div>
                    {payrollSummary && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" onClick={openEditSummary} className="w-full sm:w-auto">
                                    <IconEdit className="size-4" />
                                    Edit summary
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit payroll summary values</TooltipContent>
                        </Tooltip>
                    )}
                </div>
                {payrollSummary ? (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        {summaryItems.map(([label, key], index) => (
                            <div key={key} className={`rounded-xl border p-4 ${index < 3 ? 'bg-primary/[0.04]' : 'bg-muted/20'}`}>
                                <p className="text-xs font-medium text-muted-foreground">{label}</p>
                                <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
                                    {formatSummaryValue(payrollSummary[key])}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed p-8 text-center">
                        <IconCalendarStats className="mx-auto size-8 text-muted-foreground/60" />
                        <p className="mt-3 font-medium">No payroll summary available</p>
                        <p className="mt-1 text-sm text-muted-foreground">A summary has not been recorded for this employee and payroll period.</p>
                    </div>
                )}
            </section>

            <Dialog open={editSummaryOpen} onOpenChange={setEditSummaryOpen}>
                <DialogContent className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
                    <div className="shrink-0 border-b bg-muted/20 px-6 py-5 sm:px-7">
                        <DialogHeader>
                            <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <IconEdit className="size-5" />
                            </div>
                            <DialogTitle className="text-xl">Edit Payroll Summary</DialogTitle>
                            <DialogDescription>
                                Review and update the attendance totals used for payroll. Changes apply to this employee and pay period.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4 grid gap-3 rounded-xl border bg-background p-3 sm:grid-cols-2">
                            <div className="min-w-0">
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Employee</p>
                                <p className="mt-1 truncate text-sm font-semibold">{employee.FullName}</p>
                                <p className="text-xs text-muted-foreground">ID: {employee.EmpNbr || '—'}</p>
                            </div>
                            <div className="min-w-0 sm:border-l sm:pl-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Pay period</p>
                                <p className="mt-1 text-sm font-semibold">{formatDate(period.PeriodStart)} — {formatDate(period.PeriodEnd)}</p>
                                <p className="text-xs text-muted-foreground">Pay date: {formatDate(period.PayDate)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-6 py-5 sm:px-7">
                        {summaryGroups.map((group) => (
                            <section key={group.title} className="space-y-3">
                                <div>
                                    <h3 className="text-sm font-semibold">{group.title}</h3>
                                    <p className="text-xs text-muted-foreground">{group.description}</p>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {group.keys.map((key) => {
                                        const item = summaryItems.find(([, itemKey]) => itemKey === key);
                                        if (!item) return null;
                                        const [label] = item;

                                        return (
                                            <div key={key} className="grid content-start gap-2 rounded-xl border bg-card p-3.5">
                                                <Label htmlFor={`summary-${key}`} className="text-sm">{label}</Label>
                                                <Input
                                                    id={`summary-${key}`}
                                                    type="number"
                                                    min="0"
                                                    step="any"
                                                    inputMode="decimal"
                                                    className="h-10 tabular-nums"
                                                    value={summaryForm[key] ?? ''}
                                                    onChange={(event) => updateSummaryValue(key, event.target.value)}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        ))}
                        <p className="flex items-start gap-2 rounded-lg bg-muted/50 px-3 py-2.5 text-xs text-muted-foreground">
                            <IconCalendarStats className="mt-0.5 size-4 shrink-0" />
                            Check values carefully before saving. Numeric values cannot be less than zero.
                        </p>
                    </div>

                    <DialogFooter className="shrink-0 border-t bg-background px-6 pt-4 pb-6 sm:px-7">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEditSummaryOpen(false)}
                            disabled={isSubmittingSummary}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={submitPayrollSummary}
                            disabled={isSubmittingSummary}
                        >
                            {isSubmittingSummary && (
                                <IconLoader2 className="size-4 animate-spin" />
                            )}
                            {isSubmittingSummary ? 'Saving changes...' : 'Save changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

EmployeeAttendanceLogs.layout = {
    breadcrumbs: [
        {
            title: 'Process DTR',
            href: '/dtr',
        },
        {
            title: 'Employee Attendance Logs',
            href: '#',
        },
    ],
};
