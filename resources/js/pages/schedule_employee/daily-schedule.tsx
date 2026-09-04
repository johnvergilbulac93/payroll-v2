import { useForm } from '@inertiajs/react';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { ConfirmDialog } from '@/components/alert-dialog';
import { FormDialog } from '@/components/base-modal';
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
    TableCaption,
    TableRow,
} from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

import { cn } from '@/lib/utils';
import { store, destroy as remove } from '@/routes/employee_schedule';
import type { Employee } from '@/types/employee';
import type { ScheduleTemplate, ShiftCode } from '@/types/schedule-template';
import { DAYS_OF_WEEK } from '@/types/schedule-template';

type DailyScheduleProps = {
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

export function DailySchedule({
    employee,
    templates,
    shiftCodes,
}: DailyScheduleProps) {
    const [visible, setVisible] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const empId = Number(employee?.id);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
        delete: destroy,
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

        for (const t of templates ?? []) {
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
            setDescription(employee?.FullName ?? '');
            setVisible(true);
        }
    };

    const onSubmit = () => {
        post(store.url(), {
            preserveScroll: true,
            onSuccess: () => setVisible(false),
        });
    };
    const onDelete = () => {
        destroy(remove.url(data.id), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <div className="overflow-hidden rounded-lg border">
                <Table>
                    <TableCaption className="p-2 text-sm">
                        {employee.FullName}
                    </TableCaption>

                    <TableHeader className="sticky top-0 z-10 bg-muted">
                        <TableRow>
                            {DAYS_OF_WEEK.map((day) => (
                                <TableHead
                                    key={day.value}
                                    className="w-27.5 text-center"
                                >
                                    {day.label}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody className="**:data-[slot=table-cell]:first:w-8">
                        <TableRow>
                            {DAYS_OF_WEEK.map((day) => {
                                const cell = templateGrid[empId]?.[day.value];

                                return (
                                    <TableCell
                                        key={day.value}
                                        className="p-2 text-center"
                                    >
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button
                                                    type="button"
                                                    className={cn(
                                                        'group flex h-24 w-full items-center justify-center rounded-md border px-2',
                                                        cell
                                                            ? cell.shift_code
                                                                  ?.IsWorkingDay
                                                                ? 'border-transparent bg-primary text-primary-foreground hover:bg-primary/90'
                                                                : 'border-transparent bg-secondary'
                                                            : 'border-dashed hover:border-border hover:bg-muted/50',
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
                                                                {cell.shift_code
                                                                    ?.IsWorkingDay ? (
                                                                    <>
                                                                        <p>
                                                                            {formatTime(
                                                                                cell
                                                                                    .shift_code
                                                                                    ?.TimeIn,
                                                                            )}
                                                                        </p>
                                                                        to
                                                                        <p>
                                                                            {formatTime(
                                                                                cell
                                                                                    .shift_code
                                                                                    ?.TimeOut,
                                                                            )}
                                                                        </p>
                                                                    </>
                                                                ) : (
                                                                    <span>
                                                                        Rest Day
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <IconTrash className="absolute h-6 w-6 opacity-0 transition group-hover:opacity-100" />
                                                        </div>
                                                    ) : (
                                                        <IconPlus className="h-4 w-4 text-muted-foreground" />
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
        </>
    );
}
