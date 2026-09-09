import { Head, useForm } from '@inertiajs/react';
import { IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/alert-dialog';
import { FormDialog } from '@/components/base-modal';
import { DatePicker } from '@/components/date-picker';
import Heading from '@/components/heading';
import {
    Field,
    FieldLabel,
    FieldGroup,
    FieldError,
    FieldContent,
    FieldDescription,
    FieldTitle,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { usePaginationIndexFilters } from '@/hooks/use-pagination-filter';
import { useUndoableAction } from '@/hooks/use-undoable';
import { HolidayTable } from '@/pages/maintenance/holiday/holiday-table';

import {
    index,
    store,
    update,
    destroy as remove,
} from '@/routes/maintenance/holiday';
import type { Holiday } from '@/types/maintenance';
import type { PaginatedData } from '@/types/paginated';

type Props = {
    holidays: PaginatedData<Holiday>;
};
const holidayType = [
    { label: 'Regular', value: 'regular' },
    { label: 'Special Non-Working', value: 'special_non_working' },
    { label: 'Special Working', value: 'special_working' },
];
export default function HolidayPage({ holidays }: Props) {
    const [visible, setVisible] = useState(false);
    const [dialogTitle, setDialogTitle] = useState('');
    const [dialogDescription, setDialogDescription] = useState('');
    const [isAdd, setIsAdd] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    const { trigger: triggerUndoable } = useUndoableAction<number>();
    const {
        data,
        setData,
        processing,
        errors,
        delete: destroy,
        resetAndClearErrors,
        post,
        put,
    } = useForm({
        id: '',
        Name: '',
        Date: '',
        HolidayType: '',
        IsRecurring: false,
    });

    const { filters, updateFilters } = usePaginationIndexFilters({
        route: index.url(),
        defaults: { page: 1, search: '', limit: 10 },
    });
    const onAdd = () => {
        resetAndClearErrors();
        setIsAdd(true);
        setDialogTitle('Add Holiday');
        setDialogDescription('Add a new holiday to the system.');
        setVisible(true);
    };
    const onEdit = (record: Holiday) => {
        resetAndClearErrors();
        setIsAdd(false);
        setDialogTitle('Edit Holiday');
        setDialogDescription(
            `Make changes to this holiday. Click save when you're done.`,
        );
        setData({
            id: String(record.id),
            Name: record.Name,
            HolidayType: record.HolidayType,
            Date: record.Date,
            IsRecurring: record.IsRecurring,
        });
        setVisible(true);
    };
    const onConfirm = (value: number) => {
        setPendingDeleteId(value);
        setConfirmOpen(true);
    };

    const onCreate = () => {
        post(store.url(), {
            preserveScroll: true,
            onSuccess: () => {
                setVisible(false);
                resetAndClearErrors();
            },
        });
    };
    const onUpdate = () => {
        put(update.url(Number(data.id)), {
            preserveScroll: true,
            onSuccess: () => {
                resetAndClearErrors();
                setVisible(false);
            },
        });
    };

    const onDelete = (id: number) => {
        destroy(remove.url(id), {
            preserveScroll: true,
        });
    };

    return (
        <div className="space-y-4 p-4">
            <Head title="Holiday" />
            <Heading
                variant="small"
                title="Holiday Maintenance"
                description="Add, update, and manage holiday."
            />
            <HolidayTable
                initialSearch={filters.search}
                data={holidays}
                // onSelectionChange={setSelectedUserIds}
                onSearch={(value) => updateFilters({ search: value, page: 1 })}
                onAdd={onAdd}
                onPerPage={(value) => updateFilters({ limit: value, page: 1 })}
                onEdit={(record) => onEdit(record)}
                onDelete={(value) => onConfirm(value)}
            />
            <FormDialog
                open={visible}
                onOpenChange={setVisible}
                title={dialogTitle}
                description={dialogDescription}
                addText={isAdd ? 'Submit' : 'Save changes'}
                loading={processing}
                onAdd={isAdd ? onCreate : onUpdate}
                onCancel={() => setVisible(false)}
                size="xl"
            >
                <FieldGroup className="gap-4">
                    <Field data-invalid={!!errors.Name} className="gap-2">
                        <FieldLabel htmlFor="holiday.Name">Name</FieldLabel>
                        <Input
                            value={data.Name}
                            onChange={(e) => setData('Name', e.target.value)}
                            type="text"
                            id="holiday.Name"
                            placeholder="Name"
                            aria-invalid={!!errors.Name}
                            tabIndex={1}
                        />
                        {errors.Name && <FieldError>{errors.Name}</FieldError>}
                    </Field>
                </FieldGroup>
                <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                        data-invalid={!!errors.HolidayType}
                        className="gap-2"
                    >
                        <FieldLabel htmlFor="position.type">
                            Holiday Type
                        </FieldLabel>
                        <Select
                            value={data.HolidayType}
                            onValueChange={(value) =>
                                setData('HolidayType', value)
                            }
                        >
                            <SelectTrigger
                                id="holiday.HolidayType"
                                className="w-full"
                                tabIndex={2}
                                aria-invalid={!!errors.HolidayType}
                            >
                                <SelectValue placeholder="Select a type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Holiday Type</SelectLabel>
                                    {holidayType.map((type) => (
                                        <SelectItem
                                            key={type.value}
                                            value={type.value}
                                        >
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        {errors.HolidayType && (
                            <FieldError>{errors.HolidayType}</FieldError>
                        )}
                    </Field>

                    <Field data-invalid={!!errors.Date} className="gap-2">
                        <FieldLabel htmlFor="holiday.Date">Date</FieldLabel>
                        <DatePicker
                            id="holiday.Date"
                            name="Date"
                            value={data.Date}
                            onChange={(value) => setData('Date', value)}
                            error={errors.Date}
                            // toDate={new Date()}
                            tabIndex={8}
                        />
                        {errors.Date && <FieldError>{errors.Date}</FieldError>}
                    </Field>
                </FieldGroup>
                <FieldLabel htmlFor="switch-status">
                    <Field
                        orientation="horizontal"
                        className="flex items-center"
                    >
                        <FieldContent>
                            <FieldTitle> Recurring</FieldTitle>
                            <FieldDescription>
                                Indicates whether this holiday repeats every
                                year.
                            </FieldDescription>
                        </FieldContent>
                        <Switch
                            id="switch-status"
                            checked={data.IsRecurring}
                            tabIndex={20}
                            onCheckedChange={(checked) =>
                                setData('IsRecurring', checked)
                            }
                        />
                    </Field>
                </FieldLabel>
            </FormDialog>

            <ConfirmDialog
                size="sm"
                open={confirmOpen}
                icon={<IconTrash />}
                onOpenChange={setConfirmOpen}
                title="Delete holiday?"
                description="This will permanently delete this holiday record. This action cannot be undone."
                confirmText="Delete"
                onConfirm={async () => {
                    if (pendingDeleteId !== null) {
                        triggerUndoable(pendingDeleteId, {
                            action: onDelete,
                            message: 'Holiday will be deleted',
                            toastId: `delete-${pendingDeleteId}`,
                        });
                    }
                }}
            />
        </div>
    );
}

HolidayPage.layout = {
    breadcrumbs: [
        {
            title: 'Holiday',
            href: '#',
        },
    ],
};
