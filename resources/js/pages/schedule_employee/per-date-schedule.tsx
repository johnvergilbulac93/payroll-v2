import { useForm } from '@inertiajs/react';
import { IconPlus, IconTrash } from '@tabler/icons-react';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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

    return (
        <div className="rounded-md border p-4">
            <div className="space-y-2">
                <div className="flex items-center justify-end">
                    <Button onClick={onAdd}>
                        <IconPlus /> Add
                    </Button>
                </div>
                <div className="overflow-hidden rounded-lg border">
                    <Table>
                        <TableHeader className="sticky top-0 z-10 bg-muted">
                            <TableRow>
                                <TableHead className="w-34">
                                    Shift name{' '}
                                </TableHead>
                                <TableHead className="w-20">Date</TableHead>
                                <TableHead className="w-2"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="**:data-[slot=table-cell]:first:w-8">
                            {perDateSchedules && perDateSchedules.length > 0 ? (
                                perDateSchedules.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell>
                                            {row.shift_code?.Name}
                                        </TableCell>
                                        <TableCell>
                                            {row.EffectiveFrom}
                                        </TableCell>
                                        <TableCell className="flex justify-end gap-2">
                                            <Button
                                                variant="destructive"
                                                onClick={() =>
                                                    onConfirm(Number(row.id))
                                                }
                                            >
                                                <IconTrash />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={2}
                                        className="text-center text-muted-foreground"
                                    >
                                        No assigned schedule
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
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
