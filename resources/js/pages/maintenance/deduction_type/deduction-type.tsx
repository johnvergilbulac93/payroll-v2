import { Head, useForm } from '@inertiajs/react';
import { IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/alert-dialog';
import { FormDialog } from '@/components/base-modal';
import Heading from '@/components/heading';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { usePaginationIndexFilters } from '@/hooks/use-pagination-filter';
import { useUndoableAction } from '@/hooks/use-undoable';
import { DeductionTypeTable } from '@/pages/maintenance/deduction_type/deduction-type-table';
import { index, store, update, destroy as remove } from '@/routes/maintenance/deduction_type';
import type { DeductionType } from '@/types/maintenance';
import type { PaginatedData } from '@/types/paginated';

type Props = {
    deduction_types: PaginatedData<DeductionType>;
};

const frequencyOptions = [
    { label: 'Every Payday', value: '00' },
    { label: 'Every 15th', value: '15' },
    { label: 'End of Month', value: '30' },
];

export default function DeductionTypePage({ deduction_types }: Props) {
    const [visible, setVisible] = useState(false);
    const [dialogTitle, setDialogTitle] = useState('');
    const [dialogDescription, setDialogDescription] = useState('');
    const [isAdd, setIsAdd] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    const { trigger: triggerUndoable } = useUndoableAction<number>();

    const { data, setData, processing, errors, resetAndClearErrors, post, put, delete: destroy } =
        useForm({
            id: '',
            name: '',
            frequency: '00',
        });

    const { filters, updateFilters } = usePaginationIndexFilters({
        route: index.url(),
        defaults: { page: 1, search: '', limit: 10 },
    });

    const onAdd = () => {
        resetAndClearErrors();
        setData({ id: '', name: '', frequency: '00' });
        setIsAdd(true);
        setDialogTitle('Add Deduction Type');
        setDialogDescription('Add a new deduction type to the system.');
        setVisible(true);
    };

    const onEdit = (record: DeductionType) => {
        resetAndClearErrors();
        setIsAdd(false);
        setDialogTitle('Edit Deduction Type');
        setDialogDescription(
            'Make changes to this deduction type. Click save when you are done.',
        );
        setData({
            id: String(record.id),
            name: record.name,
            frequency: record.frequency,
        });
        setVisible(true);
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

    const onConfirm = (id: number) => {
        setPendingDeleteId(id);
        setConfirmOpen(true);
    };

    const onDelete = (id: number) => {
        destroy(remove.url(id), {
            preserveScroll: true,
            onFinish: () => setConfirmOpen(false),
        });
    };

    return (
        <div className="space-y-4 p-4">
            <Head title="Deduction Type" />
            <Heading
                variant="small"
                title="Deduction Type"
                description="Add, update, and manage deduction types."
            />

            <DeductionTypeTable
                initialSearch={filters.search}
                data={deduction_types}
                onSearch={(value) => updateFilters({ search: value, page: 1 })}
                onAdd={onAdd}
                onPerPage={(value) => updateFilters({ limit: value, page: 1 })}
                onEdit={onEdit}
                onDelete={onConfirm}
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
                size="md"
            >
                <FieldGroup className="gap-4">
                    <Field data-invalid={!!errors.name} className="gap-2">
                        <FieldLabel htmlFor="deduction_type.name">Name</FieldLabel>
                        <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            id="deduction_type.name"
                            placeholder="Name"
                            aria-invalid={!!errors.name}
                        />
                        {errors.name && <FieldError>{errors.name}</FieldError>}
                    </Field>
                    <Field data-invalid={!!errors.frequency} className="gap-2">
                        <FieldLabel htmlFor="deduction_type.frequency">Frequency</FieldLabel>
                        <Select
                            value={data.frequency}
                            onValueChange={(value) => setData('frequency', value)}
                        >
                            <SelectTrigger
                                id="deduction_type.frequency"
                                className="w-full"
                                aria-invalid={!!errors.frequency}
                            >
                                <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                                {frequencyOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.frequency && <FieldError>{errors.frequency}</FieldError>}
                    </Field>
                </FieldGroup>
            </FormDialog>

            <ConfirmDialog
                size="sm"
                open={confirmOpen}
                icon={<IconTrash />}
                onOpenChange={setConfirmOpen}
                title="Delete deduction type?"
                description="This will permanently delete this deduction type. This action cannot be undone."
                confirmText="Delete"
                onConfirm={async () => {
                    if (pendingDeleteId !== null) {
                        triggerUndoable(pendingDeleteId, {
                            action: onDelete,
                            message: 'Deduction type will be deleted',
                            toastId: `delete-${pendingDeleteId}`,
                        });
                    }
                }}
            />
        </div>
    );
}

DeductionTypePage.layout = {
    breadcrumbs: [{ title: 'Deduction Type', href: '#' }],
};
