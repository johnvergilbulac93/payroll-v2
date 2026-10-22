import { useForm } from '@inertiajs/react';
import { IconClock, IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { FormDialog } from '@/components/base-modal';
import { Button } from '@/components/ui/button';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { storePerDate } from '@/routes/employee_schedule';
import type { SchedulePerDate } from '@/types/per-date-schedule';
import type { ShiftCode } from '@/types/schedule-template';

type DefaultScheduleProps = {
    empID: number;
    shiftCodes: ShiftCode[];
    defaultSchedule?: SchedulePerDate | null;
};

function formatTime(value: string | null | undefined) {
    if (!value) return null;
    const [hourValue, minute] = value.split(':');
    const hour = Number(hourValue);
    return `${hour % 12 || 12}:${minute} ${hour >= 12 ? 'PM' : 'AM'}`;
}

export function DefaultSchedule({
    empID,
    shiftCodes,
    defaultSchedule,
}: DefaultScheduleProps) {
    const [visible, setVisible] = useState(false);
    const {
        data,
        setData,
        errors,
        processing,
        resetAndClearErrors,
        post,
    } = useForm({
        EmpID: empID,
        ShiftCodeID: defaultSchedule?.ShiftCodeID
            ? String(defaultSchedule.ShiftCodeID)
            : '',
        EffectiveFrom: defaultSchedule?.EffectiveFrom
            ?? new Date().toISOString().slice(0, 10),
        ScheduleType: 'default',
        IsActive: true,
    });

    const onAdd = () => {
        resetAndClearErrors();
        setData('EmpID', empID);
        setData('ScheduleType', 'default');
        setData('EffectiveFrom', defaultSchedule?.EffectiveFrom ?? new Date().toISOString().slice(0, 10));
        setData('ShiftCodeID', defaultSchedule?.ShiftCodeID ? String(defaultSchedule.ShiftCodeID) : '');
        setVisible(true);
    };

    const onSubmit = () => {
        post(storePerDate.url(), {
            preserveScroll: true,
            onSuccess: () => setVisible(false),
        });
    };

    const shift = defaultSchedule?.shift_code;
    const timeIn = formatTime(shift?.TimeIn);
    const timeOut = formatTime(shift?.TimeOut);

    return (
        <div className="rounded-xl border bg-sidebar p-4 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-sm font-semibold">Default shift schedule</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                        This shift applies to the employee unless a per-date schedule overrides it.
                    </p>
                </div>
                <Button onClick={onAdd} size="sm">
                    <IconPlus /> {defaultSchedule ? 'Update default shift' : 'Create default shift'}
                </Button>
            </div>

            {defaultSchedule ? (
                <div className="flex flex-col gap-3 rounded-lg border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <IconClock className="size-5" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold">{shift?.Name ?? 'Shift not found'}</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {shift?.IsWorkingDay === false
                                    ? 'Rest day · No working hours'
                                    : timeIn && timeOut
                                      ? `${timeIn} – ${timeOut}`
                                      : 'Working hours not set'}
                            </p>
                        </div>
                    </div>
                    <span className="w-fit rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                        Default
                    </span>
                </div>
            ) : (
                <div className="flex min-h-28 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 px-4 py-6 text-center">
                    <p className="text-sm font-medium">No default shift assigned</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Create a default shift to use on dates without a specific schedule.
                    </p>
                </div>
            )}

            <FormDialog
                key={defaultSchedule?.id ?? 'create-default-schedule'}
                open={visible}
                onOpenChange={setVisible}
                title={defaultSchedule ? 'Update default schedule' : 'Create default schedule'}
                description="Choose the shift that should apply by default to this employee."
                addText={defaultSchedule ? 'Save changes' : 'Create schedule'}
                loading={processing}
                onAdd={onSubmit}
                onCancel={() => setVisible(false)}
                size="lg"
            >
                <FieldGroup>
                    <Field data-invalid={!!errors.ShiftCodeID}>
                        <FieldLabel htmlFor="default.ShiftCodeID">Default shift</FieldLabel>
                        <Select
                            value={data.ShiftCodeID}
                            onValueChange={(value) => setData('ShiftCodeID', value)}
                        >
                            <SelectTrigger
                                id="default.ShiftCodeID"
                                className="w-full"
                                aria-invalid={!!errors.ShiftCodeID}
                            >
                                <SelectValue placeholder="Select a shift" />
                            </SelectTrigger>
                            <SelectContent>
                                {shiftCodes.map((row) => (
                                    <SelectItem key={row.id} value={String(row.id)}>
                                        {row.Name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.ShiftCodeID && <FieldError>{errors.ShiftCodeID}</FieldError>}
                    </Field>
                </FieldGroup>
            </FormDialog>
        </div>
    );
}
