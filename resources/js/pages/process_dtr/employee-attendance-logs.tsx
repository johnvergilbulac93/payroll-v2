import { Head, router } from '@inertiajs/react';
import { IconArrowLeft, IconEdit, IconLoader2 } from '@tabler/icons-react';
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
    Field,
    FieldGroup,
    FieldLegend,
    FieldSet,
    FieldDescription,
} from '@/components/ui/field';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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

const formatSummaryValue = (value: number | string): number | string => {
    const numericValue = Number(value);

    return Number.isNaN(numericValue) ? value : numericValue;
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
        <div className="p-4">
            <Head title="Employee Attendance Logs" />

            <div className="mb-4">
                <Button
                    variant="ghost"
                    className="-ml-2"
                    onClick={() =>
                        router.visit('/dtr', {
                            data: { period: period.id },
                        })
                    }
                >
                    <IconArrowLeft />
                    Back
                </Button>
            </div>

            <Heading
                title="Employee Attendance Logs"
                description={`Payroll Period: ${period.Label}`}
            />

            <FieldGroup className="mt-6">
                <FieldSet className="rounded-lg border bg-background p-4">
                    <FieldLegend variant="legend" className="px-2">
                        Employee Information
                    </FieldLegend>
                    <Field>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="rounded-md border bg-muted/30 px-4 py-3">
                                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                    ID No.
                                </p>
                                <p className="mt-1 font-medium">
                                    {employee.EmpNbr}
                                </p>
                            </div>
                            <div className="rounded-md border bg-muted/30 px-4 py-3">
                                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                    Name
                                </p>
                                <p className="mt-1 font-medium">
                                    {employee.FullName}
                                </p>
                            </div>
                            <div className="rounded-md border bg-muted/30 px-4 py-3">
                                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                    Department
                                </p>
                                <p className="mt-1 font-medium">
                                    {employee.Department ?? '—'}
                                </p>
                            </div>
                        </div>
                    </Field>
                </FieldSet>

                <FieldSet className="rounded-lg border bg-background p-4">
                    <FieldLegend variant="legend" className="px-2">
                        Daily Time Record
                    </FieldLegend>

                    <Field>
                        <EmployeeDtr
                            dailyTimeRecords={dtrRecords}
                            employeeId={employee.id}
                        />
                    </Field>
                </FieldSet>

                <FieldSet className="rounded-lg border bg-background p-4">
                    <FieldLegend variant="legend" className="px-2">
                        Summary
                    </FieldLegend>
                    <Field>
                        {payrollSummary ? (
                            <div className="overflow-hidden rounded-lg border">
                                <Table>
                                    <TableHeader className="sticky top-0 z-10 bg-muted">
                                        <TableRow>
                                            {summaryItems.map(([label]) => (
                                                <TableHead
                                                    key={label}
                                                    className="whitespace-nowrap"
                                                >
                                                    {label.toUpperCase()}
                                                </TableHead>
                                            ))}
                                            <TableHead className="w-10 text-center">
                                                <span className="sr-only">
                                                    Action
                                                </span>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow>
                                            {summaryItems.map(([, key]) => (
                                                <TableCell
                                                    key={key}
                                                    className="font-medium whitespace-nowrap"
                                                >
                                                    {formatSummaryValue(
                                                        payrollSummary[key],
                                                    )}
                                                </TableCell>
                                            ))}
                                            <TableCell className="w-10 text-center">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            size="icon"
                                                            onClick={
                                                                openEditSummary
                                                            }
                                                        >
                                                            <IconEdit className="size-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Edit Payroll Summary
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No payroll summary is available for this
                                employee and payroll period.
                            </p>
                        )}
                    </Field>
                </FieldSet>
            </FieldGroup>

            <Dialog open={editSummaryOpen} onOpenChange={setEditSummaryOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Payroll Summary</DialogTitle>
                        <DialogDescription>
                            Update the payroll summary values for{' '}
                            {employee.FullName}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {summaryItems.map(([label, key]) => (
                            <div key={key} className="grid gap-2">
                                <Label htmlFor={`summary-${key}`}>
                                    {label}
                                </Label>
                                <Input
                                    id={`summary-${key}`}
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={summaryForm[key] ?? ''}
                                    onChange={(event) =>
                                        updateSummaryValue(
                                            key,
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>
                        ))}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setEditSummaryOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={submitPayrollSummary}
                            disabled={isSubmittingSummary}
                        >
                            {isSubmittingSummary && (
                                <IconLoader2 className="animate-spin" />
                            )}
                            {isSubmittingSummary ? 'Updating...' : 'Submit'}
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
