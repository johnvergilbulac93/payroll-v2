import { useForm } from '@inertiajs/react';
import { IconCalendarEvent, IconClock, IconPlus, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/alert-dialog';
import { FormDialog } from '@/components/base-modal';
import { DatePicker } from '@/components/date-picker';
import { Button } from '@/components/ui/button';
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
import { storePerDate } from '@/routes/employee_schedule';
import { destroyPerDate } from '@/routes/employee_schedule';
import type { SchedulePerDate } from '@/types/per-date-schedule';
import type { ShiftCode } from '@/types/schedule-template';

type PerDateScheduleProps = {
    empID: number;
    shiftCodes: ShiftCode[];
    perDateSchedules: SchedulePerDate[] | null | undefined;
};

export function PerDateSchedule({
    empID,
    shiftCodes,
    perDateSchedules,
}: PerDateScheduleProps) {
    const [dialogTitle, setDialogTitle] = useState('');
    const [dialogDescription, setDialogDescription] = useState('');
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const [visible, setVisible] = useState(false);
    const [isAdd, setIsAdd] = useState(false);

    const {
        data,
        setData,
        errors,
        processing,
        resetAndClearErrors,
        post,
        delete: destroy,
    } = useForm({
        id: '',
        EmpID: empID,
        ShiftCodeID: '',
        EffectiveFrom: '',
        ScheduleType: 'per_date',
        IsActive: true,
    });
    const onAdd = () => {
        resetAndClearErrors();
        setDialogTitle('Employee per date schedule');
        setDialogDescription('Assign employee shifts for each date.');
        setIsAdd(true);
        setVisible(true);
    };
    const onCreate = () => {
        post(storePerDate.url(), {
            preserveScroll: true,
            onSuccess: () => setVisible(false),
        });
    };
    const onConfirm = (id: number) => {
        setPendingDeleteId(id);
        setConfirmOpen(true);
    };

    const formatDate = (value: string | null | undefined) => {
        if (!value) return 'No date';
        const date = new Date(`${value}T00:00:00`);
        if (Number.isNaN(date.getTime())) return value;
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }).format(date);
    };

    const formatTime = (value: string | null | undefined) => {
        if (!value) return null;
        const parts = value.split(':');
        if (parts.length < 2) return value;
        const hours = Number(parts[0]);
        const minutes = parts[1];
        const suffix = hours >= 12 ? 'PM' : 'AM';
        const hour = hours % 12 || 12;
        return `${hour}:${minutes} ${suffix}`;
    };

    const scheduleCount = perDateSchedules?.length ?? 0;

    return (
        <div className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <IconCalendarEvent className="size-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold">Per date schedule</h3>
                        <p className="text-xs text-muted-foreground">
                            {scheduleCount === 1 ? '1 date-specific schedule assigned' : `${scheduleCount} date-specific schedules assigned`}
                        </p>
                    </div>
                </div>
                <Button onClick={onAdd} size="sm">
                    <IconPlus /> Add schedule
                </Button>
            </div>

            {scheduleCount > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {perDateSchedules?.map((row) => {
                        const shift = row.shift_code;
                        const isWorkingDay = shift?.IsWorkingDay ?? true;
                        const timeIn = formatTime(shift?.TimeIn);
                        const timeOut = formatTime(shift?.TimeOut);

                        return (
                            <div key={row.id} className="group relative overflow-hidden rounded-xl border bg-background p-4 transition-colors hover:bg-muted/30">
                                <div className="mb-4 flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                            <IconCalendarEvent className="size-4 shrink-0" />
                                            <span>{formatDate(row.EffectiveFrom)}</span>
                                        </div>
                                        <p className="mt-1 truncate text-sm font-semibold">{shift?.Name ?? 'Schedule not found'}</p>
                                    </div>
                                    <span className={isWorkingDay ? 'shrink-0 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary' : 'shrink-0 rounded-full bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground'}>
                                        {isWorkingDay ? 'Working day' : 'Rest day'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2.5">
                                    <IconClock className="size-4 text-muted-foreground" />
                                    {isWorkingDay && timeIn && timeOut ? (
                                        <span className="text-sm font-medium">{timeIn} <span className="mx-1 text-muted-foreground">–</span> {timeOut}</span>
                                    ) : (
                                        <span className="text-sm font-medium text-muted-foreground">No working hours</span>
                                    )}
                                </div>
                                <Button variant="ghost" size="icon" className="absolute right-2 bottom-2 size-8 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100" aria-label="Delete schedule" onClick={() => onConfirm(Number(row.id))}>
                                    <IconTrash className="size-4 text-destructive" />
                                </Button>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex min-h-32 flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-4 py-8 text-center">
                    <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <IconCalendarEvent className="size-5" />
                    </div>
                    <p className="text-sm font-medium">No per-date schedules</p>
                    <p className="mt-1 max-w-sm text-xs text-muted-foreground">Add a date-specific schedule when an employee needs a shift that differs from the regular weekly schedule.</p>
                </div>
            )}
            <FormDialog
                key="add schedule per date"
                open={visible}
                onOpenChange={setVisible}
                title={dialogTitle}
                description={dialogDescription}
                addText={isAdd ? 'Submit' : 'Save changes'}
                loading={processing}
                onAdd={onCreate}
                onCancel={() => setVisible(false)}
                size="xl"
                className="sm:max-h-[32rem]"
            >
                <FieldGroup className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2">
                    <Field data-invalid={!!errors.ShiftCodeID}>
                        <FieldLabel htmlFor="employee.ShiftCodeID">
                            Shift Code
                        </FieldLabel>
                        <Select
                            value={data.ShiftCodeID}
                            onValueChange={(value) =>
                                setData('ShiftCodeID', value)
                            }
                        >
                            <SelectTrigger
                                id="employee.ShiftCodeID"
                                className="w-full"
                                tabIndex={1}
                                aria-invalid={!!errors.ShiftCodeID}
                            >
                                <SelectValue placeholder="Select a shift" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Shift</SelectLabel>
                                    {shiftCodes.map((shift) => (
                                        <SelectItem
                                            key={shift.id}
                                            value={shift.id.toString()}
                                        >
                                            {shift.Name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        {errors.ShiftCodeID && (
                            <FieldError>{errors.ShiftCodeID}</FieldError>
                        )}
                    </Field>
                    <Field data-invalid={!!errors.EffectiveFrom}>
                        <FieldLabel htmlFor="EffectiveFrom">
                            Effective date
                        </FieldLabel>
                        <DatePicker
                            id="EffectiveFrom"
                            name="EffectiveFrom"
                            value={data.EffectiveFrom}
                            onChange={(value) =>
                                setData('EffectiveFrom', value)
                            }
                            error={errors.EffectiveFrom}
                            // toDate={new Date()}
                            tabIndex={2}
                        />
                        {errors.EffectiveFrom && (
                            <FieldError>{errors.EffectiveFrom}</FieldError>
                        )}
                    </Field>
                </FieldGroup>
            </FormDialog>
            <ConfirmDialog
                size="sm"
                open={confirmOpen}
                icon={<IconTrash />}
                onOpenChange={setConfirmOpen}
                title="Delete assign schedule?"
                description="This will permanently delete this schedule record. This action cannot be undone."
                confirmText="Delete"
                onConfirm={async () => {
                    if (pendingDeleteId !== null) {
                        destroy(destroyPerDate.url(pendingDeleteId), {
                            preserveScroll: true,
                            onSuccess: () => setVisible(false),
                        });
                    }
                }}
            />
        </div>
    );
}
