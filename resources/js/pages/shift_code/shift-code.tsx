import { Head, useForm } from '@inertiajs/react';
import { IconTrash } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { ConfirmDialog } from '@/components/alert-dialog';
import { FormDialog } from '@/components/base-modal';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    FieldGroup,
    FieldLabel,
    Field,
    FieldContent,
    FieldError,
    FieldTitle,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { usePaginationIndexFilters } from '@/hooks/use-pagination-filter';
import { useUndoableAction } from '@/hooks/use-undoable';
import { ShiftCodeTable } from '@/pages/shift_code/shift-code-table';
import { destroy as remove, index, store, update } from '@/routes/shift';
import type { PaginatedData } from '@/types/paginated';
import type { ShiftCode } from '@/types/shift-code';
type Props = {
    shift_codes: PaginatedData<ShiftCode>;
};

function calculateTotalHours(
    timeIn: string | null | undefined,
    timeOut: string | null | undefined,
    breakMinutes: number,
    gracePeriodMinutes: number,
    crossesMidnight: boolean,
) {
    if (typeof timeIn !== 'string' || typeof timeOut !== 'string') {
        return 0;
    }

    const [startHours, startMinutes] = timeIn.split(':').map(Number);
    const [endHours, endMinutes] = timeOut.split(':').map(Number);

    if (
        [startHours, startMinutes, endHours, endMinutes].some((value) =>
            Number.isNaN(value),
        )
    ) {
        return 0;
    }

    const start = startHours * 60 + startMinutes;
    let end = endHours * 60 + endMinutes;

    if (crossesMidnight && end <= start) {
        end += 24 * 60;
    }

    const elapsedMinutes = end - start;
    const totalMinutes =
        elapsedMinutes -
        Math.max(0, breakMinutes || 0) +
        Math.max(0, gracePeriodMinutes || 0);

    return Math.round((Math.max(0, totalMinutes) / 60) * 100) / 100;
}

function crossesMidnight(
    timeIn: string | null | undefined,
    timeOut: string | null | undefined,
) {
    if (typeof timeIn !== 'string' || typeof timeOut !== 'string') {
        return false;
    }

    const [startHours, startMinutes] = timeIn.split(':').map(Number);
    const [endHours, endMinutes] = timeOut.split(':').map(Number);

    if (
        [startHours, startMinutes, endHours, endMinutes].some((value) =>
            Number.isNaN(value),
        )
    ) {
        return false;
    }

    return endHours * 60 + endMinutes < startHours * 60 + startMinutes;
}

export default function ShiftCodeList({ shift_codes }: Props) {
    const [dialogTitle, setDialogTitle] = useState('');
    const [dialogDescription, setDialogDescription] = useState('');

    const [visible, setVisible] = useState(false);
    const [isAdd, setIsAdd] = useState(false);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    const { trigger: triggerUndoable } = useUndoableAction<number>();

    const {
        data,
        setData,
        processing,
        post,
        put,
        errors,
        resetAndClearErrors,
        delete: destroy,
    } = useForm({
        id: '',
        Name: '',
        TimeIn: new Date().toTimeString().slice(0, 5),
        TimeOut: new Date().toTimeString().slice(0, 5),
        BreakMinutes: '',
        GracePeriodMinutes: '',
        CrossesMidNight: false,
        IsWorkingDay: false,
        TotalHours: '',
        IsActive: true,
    });
    const { filters, updateFilters } = usePaginationIndexFilters({
        route: index.url(),
        defaults: { page: 1, search: '', limit: 10 },
    });

    useEffect(() => {
        const shouldCrossMidnight = crossesMidnight(data.TimeIn, data.TimeOut);

        if (data.CrossesMidNight !== shouldCrossMidnight) {
            setData('CrossesMidNight', shouldCrossMidnight);
        }
    }, [data.TimeIn, data.TimeOut, data.CrossesMidNight, setData]);

    useEffect(() => {
        const totalHours = calculateTotalHours(
            data.TimeIn,
            data.TimeOut,
            Number(data.BreakMinutes) || 0,
            Number(data.GracePeriodMinutes) || 0,
            data.CrossesMidNight,
        );

        if (Number(data.TotalHours) !== totalHours) {
            setData('TotalHours', String(totalHours));
        }
    }, [
        data.TimeIn,
        data.TimeOut,
        data.BreakMinutes,
        data.GracePeriodMinutes,
        data.CrossesMidNight,
        data.TotalHours,
        setData,
    ]);

    const onCreate = () => {
        resetAndClearErrors();
        setIsAdd(true);
        setDialogTitle('New shift');
        setDialogDescription('Create a new shift');
        setVisible(true);
    };
    const onSubmit = () => {
        post(store.url(), {
            onSuccess: () => {
                resetAndClearErrors();
                setVisible(false);
            },
        });
    };
    const onUpdate = () => {
        put(update.url(Number(data.id)), {
            onSuccess: () => {
                resetAndClearErrors();
                setVisible(false);
            },
        });
    };
    const onEdit = (row: ShiftCode) => {
        resetAndClearErrors();
        setData({
            id: String(row.id),
            Name: row.Name,
            TimeIn: row.TimeIn ?? '',
            TimeOut: row.TimeOut ?? '',
            BreakMinutes: String(row.BreakMinutes),
            GracePeriodMinutes: String(row.GracePeriodMinutes),
            CrossesMidNight: row.CrossesMidNight,
            IsWorkingDay: row.IsWorkingDay,
            TotalHours: String(row.TotalHours),
            IsActive: row.IsActive,
        });
        setIsAdd(false);
        setDialogTitle('Edit shift');
        setDialogDescription(`Update ${row.Name}.`);
        setVisible(true);
    };
    const onDelete = (id: number) => {
        destroy(remove.url(id));
    };
    const onConfirm = (id: number) => {
        setPendingDeleteId(id);
        setConfirmOpen(true);
    };

    return (
        <div className="p-4">
            <Head title="Shift Code" />
            <Heading
                title="Shift code"
                description="View, add, edit, and manage shift details."
            />
            <ShiftCodeTable
                initialSearch={filters.search}
                data={shift_codes}
                onSearch={(value) => updateFilters({ search: value, page: 1 })}
                onAdd={onCreate}
                onPerPage={(value) => updateFilters({ limit: value, page: 1 })}
                onEdit={onEdit}
                onDelete={onConfirm}
            />
            <FormDialog
                key={isAdd ? 'add' : `edit-${data.id}`}
                open={visible}
                onOpenChange={setVisible}
                title={dialogTitle}
                description={dialogDescription}
                addText={isAdd ? 'Submit' : 'Save changes'}
                loading={processing}
                onAdd={isAdd ? onSubmit : onUpdate}
                onCancel={() => setVisible(false)}
                size="2xl"
            >
                <FieldGroup>
                    <Field data-invalid={!!errors.Name}>
                        <FieldLabel htmlFor="Name">Shift name</FieldLabel>
                        <Input
                            id="Name"
                            name="Name"
                            tabIndex={1}
                            value={data.Name}
                            onChange={(e) => setData('Name', e.target.value)}
                            placeholder="Shift name"
                            aria-invalid={!!errors.Name}
                        />
                        {errors.Name && <FieldError>{errors.Name}</FieldError>}
                    </Field>
                </FieldGroup>
                <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field data-invalid={!!errors.TimeIn}>
                        <FieldLabel htmlFor="TimeIn">Time in</FieldLabel>
                        <Input
                            value={data.TimeIn}
                            id="time_in"
                            tabIndex={2}
                            name="TimeIn"
                            type="time"
                            placeholder="Time in"
                            onChange={(e) => setData('TimeIn', e.target.value)}
                            aria-invalid={!!errors.TimeIn}
                            className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                        />
                        {errors.TimeIn && (
                            <FieldError>{errors.TimeIn}</FieldError>
                        )}
                    </Field>
                    <Field data-invalid={!!errors.TimeOut}>
                        <FieldLabel htmlFor="TimeOut">Time out</FieldLabel>
                        <Input
                            value={data.TimeOut}
                            tabIndex={3}
                            id="time_out"
                            name="TimeOut"
                            type="time"
                            placeholder="Time out"
                            onChange={(e) => setData('TimeOut', e.target.value)}
                            aria-invalid={!!errors.TimeOut}
                            className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                        />
                        {errors.TimeOut && (
                            <FieldError>{errors.TimeOut}</FieldError>
                        )}
                    </Field>
                </FieldGroup>
                <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Field data-invalid={!!errors.BreakMinutes}>
                        <FieldLabel htmlFor="BreakMinutes">
                            Minutes of break
                        </FieldLabel>
                        <Input
                            value={data.BreakMinutes}
                            id="BreakMinutes"
                            tabIndex={4}
                            name="BreakMinutes"
                            type="number"
                            placeholder="Minutes of break"
                            aria-invalid={!!errors.BreakMinutes}
                            onChange={(e) =>
                                setData('BreakMinutes', e.target.value)
                            }
                        />
                        {errors.BreakMinutes && (
                            <FieldError>{errors.BreakMinutes}</FieldError>
                        )}
                    </Field>
                    <Field data-invalid={!!errors.GracePeriodMinutes}>
                        <FieldLabel htmlFor="TimeOut">
                            Grace period minutes
                        </FieldLabel>
                        <Input
                            value={data.GracePeriodMinutes}
                            tabIndex={5}
                            id="GracePeriodMinutes"
                            name="GracePeriodMinutes"
                            type="number"
                            placeholder="Grace period minutes"
                            aria-invalid={!!errors.GracePeriodMinutes}
                            onChange={(e) =>
                                setData('GracePeriodMinutes', e.target.value)
                            }
                        />
                        {errors.GracePeriodMinutes && (
                            <FieldError>{errors.GracePeriodMinutes}</FieldError>
                        )}
                    </Field>
                    <Field data-invalid={!!errors.TotalHours}>
                        <FieldLabel htmlFor="TotalHours">
                            Total hours
                        </FieldLabel>
                        <Input
                            value={data.TotalHours}
                            tabIndex={6}
                            id="TotalHours"
                            name="TotalHours"
                            type="number"
                            placeholder="Total hours"
                            readOnly
                            aria-invalid={!!errors.TotalHours}
                        />
                        {errors.TotalHours && (
                            <FieldError>{errors.TotalHours}</FieldError>
                        )}
                    </Field>
                </FieldGroup>
                <FieldGroup className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <FieldLabel htmlFor="crosses-midnight">
                        <Field orientation="horizontal">
                            <FieldContent>
                                <FieldTitle>Cross midnight</FieldTitle>
                            </FieldContent>
                            <Switch
                                id="crosses-midnight"
                                tabIndex={7}
                                checked={data.CrossesMidNight}
                                onCheckedChange={(checked) =>
                                    setData('CrossesMidNight', checked)
                                }
                            />
                        </Field>
                    </FieldLabel>
                    <FieldLabel htmlFor="is-working-day">
                        <Field orientation="horizontal">
                            <FieldContent>
                                <FieldTitle>Working day</FieldTitle>
                            </FieldContent>
                            <Switch
                                id="is-working-day"
                                tabIndex={8}
                                checked={data.IsWorkingDay}
                                onCheckedChange={(checked) =>
                                    setData('IsWorkingDay', checked)
                                }
                            />
                        </Field>
                    </FieldLabel>
                    <FieldLabel htmlFor="is-active">
                        <Field orientation="horizontal">
                            <FieldContent>
                                <FieldTitle>Status</FieldTitle>
                            </FieldContent>
                            <Switch
                                id="is-active"
                                tabIndex={9}
                                checked={data.IsActive}
                                onCheckedChange={(checked) =>
                                    setData('IsActive', checked)
                                }
                            />
                        </Field>
                    </FieldLabel>
                </FieldGroup>
            </FormDialog>
            <ConfirmDialog
                size="sm"
                open={confirmOpen}
                icon={<IconTrash />}
                onOpenChange={setConfirmOpen}
                title="Delete shift?"
                description="This will permanently delete this shift record. This action cannot be undone."
                confirmText="Delete"
                onConfirm={async () => {
                    if (pendingDeleteId !== null) {
                        triggerUndoable(pendingDeleteId, {
                            action: onDelete,
                            message: 'Shift will be deleted',
                            toastId: `delete-${pendingDeleteId}`,
                        });
                    }
                }}
            />
        </div>
    );
}
ShiftCodeList.layout = {
    breadcrumbs: [
        {
            title: 'Shift Code',
            href: '#',
        },
    ],
};
