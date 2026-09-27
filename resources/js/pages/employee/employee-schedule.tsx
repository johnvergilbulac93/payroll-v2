import { Head, useForm } from '@inertiajs/react';
import {
    IconCalendarEvent,
    IconCheck,
    IconClock,
    IconPlus,
    IconTrash,
    IconUser,
} from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { ConfirmDialog } from '@/components/alert-dialog';
import { FormDialog } from '@/components/base-modal';
import Heading from '@/components/heading';
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldError,
} from '@/components/ui/field';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Employee } from '@/types/employee';
import type { ScheduleTemplate } from '@/types/schedule-template';
import { DAYS_OF_WEEK } from '@/types/schedule-template';
import type { ShiftCode } from '@/types/shift-code';
type Props = {
    employee: Employee;
    templates: ScheduleTemplate[];
    shiftCodes: ShiftCode[];
};

const DAY_LABEL_MAP: Record<number, string> = Object.fromEntries(
    DAYS_OF_WEEK.map((day) => [day.value, day.label]),
);

function formatTime(time: any) {
    if (!time) {
        return '';
    }

    const [h, m] = time.split(':').map(Number);

    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;

    return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
}

export default function EmployeeSchedule({
    employee,
    templates,
    shiftCodes,
}: Props) {
    const [visible, setVisible] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const empId = Number(employee?.id);

    const {
        data,
        setData,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm({
        id: 0,
        EmpID: 0,
        DayOfWeek: 0,
        ShiftCodeID: '',
        EffectiveFrom: '',
        EffectiveTo: '',
    });
    const templateGrid = useMemo(() => {
        const grid: Record<number, Record<number, ScheduleTemplate>> = {};
        const today = new Date().toISOString().slice(0, 10);

        for (const t of templates) {
            const isActive = t.EffectiveTo === null || t.EffectiveTo >= today;

            if (!isActive) {
                continue;
            }

            grid[t.EmpID] ??= {};
            grid[t.EmpID][t.DayOfWeek] = t;
        }

        return grid;
    }, [templates]);

    const openCell = (employeeId: number, dayOfWeek: number) => {
        const existing = templateGrid[employeeId]?.[dayOfWeek] ?? null;

        if (existing) {
            setData('id', existing.id);
            setData('EmpID', employeeId);
            setData('DayOfWeek', dayOfWeek);
            setConfirmOpen(true);
        } else {
            clearErrors();
            reset();
            setData('ShiftCodeID', '');
            setData('EmpID', employeeId);
            setData('DayOfWeek', dayOfWeek);
            setTitle(`Assign shift - ${DAY_LABEL_MAP[dayOfWeek]}`);
            setDescription(employee.FullName);
            setVisible(true);
        }
    };

    const onSubmit = () => {
        // post(scheduleStore.url(), {
        //     preserveScroll: true,
        //     onSuccess: () => setVisible(false),
        // });
    };
    const onDelete = () => {
        // destroy(scheduleDestroy.url(data.id), {
        //     preserveScroll: true,
        // });
    };

    return (
        <div className="p-4">
            <Head title="Employee Schedule" />
            <Heading
                title={employee.FullName ?? 'Employee Schedule'}
                description="Manage the weekly shift assignment and working hours for this employee."
            />

            <div className="space-y-5">
                <Card className="overflow-hidden border-border/60 shadow-sm">
                    <CardContent className="p-0">
                        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <IconUser className="size-6" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="truncate text-base font-semibold">
                                            {employee.FullName}
                                        </h2>
                                        <Badge variant="secondary">
                                            {employee.EmpNbr}
                                        </Badge>
                                    </div>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {employee.PositionName ?? employee.Position ?? 'Employee'}
                                        {employee.AreaName ? ` · ${employee.AreaName}` : ''}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 sm:min-w-64">
                                <div className="rounded-lg bg-muted/50 px-3 py-2">
                                    <p className="text-xs text-muted-foreground">Status</p>
                                    <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                                        <span className={cn('size-2 rounded-full', employee.Status ? 'bg-emerald-500' : 'bg-muted-foreground')} />
                                        {employee.Status ? 'Active' : 'Inactive'}
                                    </div>
                                </div>
                                <div className="rounded-lg bg-muted/50 px-3 py-2">
                                    <p className="text-xs text-muted-foreground">Assigned shifts</p>
                                    <p className="mt-1 text-sm font-medium">
                                        {DAYS_OF_WEEK.filter((day) => templateGrid[empId]?.[day.value]).length} / {DAYS_OF_WEEK.length} days
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="border-b bg-muted/20 px-5 py-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <IconCalendarEvent className="size-4 text-primary" />
                                    Weekly schedule
                                </CardTitle>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Click a day to assign a shift or update the schedule.
                                </p>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" /> Working day</span>
                                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-secondary-foreground/30" /> Rest day</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4">
                <div className="overflow-hidden rounded-xl border border-border/70 bg-background">
                    <Table>
                        <TableHeader className="sticky top-0 z-10 bg-muted">
                            <TableRow>
                                {DAYS_OF_WEEK.map((day) => (
                                    <TableHead
                                        key={`${day.value}-header`}
                                        className="h-10 w-27.5 border-r bg-muted/40 px-2 text-center text-xs font-semibold uppercase tracking-wide last:border-r-0"
                                    >
                                        {day.label.slice(0, 3)}
                                    </TableHead>
                                ))}
                            </TableRow>
                            <TableRow className="hover:bg-transparent">
                                {DAYS_OF_WEEK.map((day) => (
                                    <TableHead
                                        key={day.value}
                                        className="hidden"
                                    >
                                        {day.label}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                {DAYS_OF_WEEK.map((day) => {
                                    const cell =
                                        templateGrid[empId]?.[day.value];

                                    return (
                                        <TableCell
                                            key={day.value}
                                            className="border-r p-2 align-top last:border-r-0"
                                        >
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        type="button"
                                                        className={cn(
                                                            'group relative flex min-h-28 w-full items-center justify-center rounded-lg border px-2.5 py-3 text-center transition-all hover:-translate-y-0.5 hover:shadow-sm',
                                                            cell
                                                                ? cell
                                                                      .shift_code
                                                                      ?.IsWorkingDay
                                                                    ? 'border-primary/20 bg-primary text-primary-foreground hover:bg-primary/90'
                                                                    : 'border-border/60 bg-muted/50 hover:bg-muted'
                                                                : 'border-dashed border-muted-foreground/25 bg-muted/10 hover:border-primary/40 hover:bg-primary/5',
                                                        )}
                                                        onClick={() =>
                                                            openCell(
                                                                empId,
                                                                day.value,
                                                            )
                                                        }
                                                    >
                                                        {cell ? (
                                                            <div className="relative flex h-full w-full items-center justify-center">
                                                                <div className="flex flex-col items-center transition group-hover:opacity-30 group-hover:blur-[1px]">
                                                                    {cell
                                                                        .shift_code
                                                                        ?.IsWorkingDay ? (
                                                                        <>
                                                                            <div className="mb-1.5 flex items-center gap-1 text-[11px] font-medium opacity-80">
                                                                                <IconClock className="size-3" />
                                                                                {cell.shift_code.Name}
                                                                            </div>
                                                                            <p className="text-sm font-semibold">
                                                                                {formatTime(cell.shift_code?.TimeIn)}
                                                                                <span className="mx-1.5 font-normal opacity-70">–</span>
                                                                                {formatTime(cell.shift_code?.TimeOut)}
                                                                            </p>
                                                                        </>
                                                                    ) : (
                                                                        <div className="flex flex-col items-center gap-1">
                                                                            <span className="text-sm font-semibold">Rest Day</span>
                                                                            <span className="text-[11px] opacity-70">No shift assigned</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="absolute right-2 top-2 rounded-full bg-background/15 p-1 opacity-0 transition group-hover:opacity-100">
                                                                    <IconTrash className="size-3.5" />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col items-center gap-1.5">
                                                        <span className="flex size-8 items-center justify-center rounded-full border border-dashed border-muted-foreground/30 bg-background text-muted-foreground transition group-hover:border-primary/40 group-hover:text-primary">
                                                            <IconPlus className="size-4" />
                                                        </span>
                                                        <span className="text-xs font-medium text-muted-foreground">Assign shift</span>
                                                    </div>
                                                        )}
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    {cell?.shift_code?.Name ??
                                                        'Not set'}
                                                </TooltipContent>
                                            </Tooltip>
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
                    </CardContent>
                </Card>
            </div>
            <FormDialog
                key="schedule-dialog"
                open={visible}
                onOpenChange={setVisible}
                title={title}
                description={description}
                addText="Submit"
                loading={processing}
                onAdd={onSubmit}
                onCancel={() => setVisible(false)}
                size="lg"
            >
                <FieldGroup>
                    <Field data-invalid={!!errors.ShiftCodeID}>
                        <FieldLabel htmlFor="data.ShiftCodeID">
                            Shift schedule
                        </FieldLabel>
                        <Select
                            value={data.ShiftCodeID}
                            onValueChange={(value) =>
                                setData('ShiftCodeID', value)
                            }
                        >
                            <SelectTrigger
                                id="data.ShiftCodeID"
                                aria-invalid={!!errors.ShiftCodeID}
                            >
                                <SelectValue placeholder="Select a shift" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Year</SelectLabel>
                                    {shiftCodes.map((row) => (
                                        <SelectItem
                                            key={row.id}
                                            value={String(row.id)}
                                        >
                                            {row.Name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        {errors.ShiftCodeID && (
                            <FieldError>{errors.ShiftCodeID}</FieldError>
                        )}
                    </Field>
                </FieldGroup>
            </FormDialog>
            <ConfirmDialog
                size="sm"
                open={confirmOpen}
                icon={<IconTrash />}
                onOpenChange={setConfirmOpen}
                title="Delete schedule?"
                description="This will permanently delete this schedule record. This action cannot be undone."
                confirmText="Delete"
                onConfirm={async () => {
                    onDelete();
                    setConfirmOpen(false);
                }}
            />
        </div>
    );
}
EmployeeSchedule.layout = {
    breadcrumbs: [
        {
            title: 'Employee Schedule',
            href: '#',
        },
    ],
};
