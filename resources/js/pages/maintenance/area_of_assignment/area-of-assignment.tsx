import { Head, useForm } from '@inertiajs/react';
import { IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/alert-dialog';
import { FormDialog } from '@/components/base-modal';
import Heading from '@/components/heading';
import {
    Field,
    FieldLabel,
    FieldGroup,
    FieldError,
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
import { usePaginationIndexFilters } from '@/hooks/use-pagination-filter';
import { useUndoableAction } from '@/hooks/use-undoable';
import { AreaOfAssignmentTable } from '@/pages/maintenance/area_of_assignment/area-of-assignment-table';

import {
    index,
    store,
    update,
    destroy as remove,
} from '@/routes/maintenance/area_of_assignment';
import type { Maintenance } from '@/types/maintenance';
import type { Option } from '@/types/option';
import type { PaginatedData } from '@/types/paginated';

type Props = {
    areas: PaginatedData<Maintenance>;
    groups: Option[];
};
export default function AreaOfAssignmentPage({ areas, groups }: Props) {
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
        name: '',
        type: '',
    });

    const { filters, updateFilters } = usePaginationIndexFilters({
        route: index.url(),
        defaults: { page: 1, search: '', limit: 10 },
    });
    const onAdd = () => {
        resetAndClearErrors();
        setIsAdd(true);
        setDialogTitle('Add Area');
        setDialogDescription('Add a new area to the system.');
        setVisible(true);
    };
    const onEdit = (record: Maintenance) => {
        resetAndClearErrors();
        setIsAdd(false);
        setDialogTitle('Edit Area');
        setDialogDescription(
            `Make changes to this area. Click save when you're done.`,
        );
        setData({
            id: String(record.id),
            name: record.name,
            type: String(record.type),
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
            <Head title="Area" />
            <Heading
                variant="small"
                title="Area Maintenance"
                description="Add, update, and manage area."
            />
            <AreaOfAssignmentTable
                initialSearch={filters.search}
                data={areas}
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
                size="md"
            >
                <FieldGroup className="gap-4">
                    <Field data-invalid={!!errors.name} className="gap-2">
                        <FieldLabel htmlFor="area.name">Name</FieldLabel>
                        <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            type="text"
                            id="area.name"
                            placeholder="Name"
                            aria-invalid={!!errors.name}
                            tabIndex={1}
                        />
                        {errors.name && <FieldError>{errors.name}</FieldError>}
                    </Field>
                    <Field data-invalid={!!errors.type} className="gap-2">
                        <FieldLabel htmlFor="area.type">Group</FieldLabel>
                        <Select
                            value={data.type}
                            onValueChange={(value) => setData('type', value)}
                        >
                            <SelectTrigger
                                id="area.type"
                                className="w-full"
                                tabIndex={5}
                                aria-invalid={!!errors.type}
                            >
                                <SelectValue placeholder="Select a group" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Groups</SelectLabel>
                                    {groups.map((group) => (
                                        <SelectItem
                                            key={group.value}
                                            value={group.value}
                                        >
                                            {group.label}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        {errors.type && <FieldError>{errors.type}</FieldError>}
                    </Field>
                </FieldGroup>
            </FormDialog>

            <ConfirmDialog
                size="sm"
                open={confirmOpen}
                icon={<IconTrash />}
                onOpenChange={setConfirmOpen}
                title="Delete area?"
                description="This will permanently delete this area record. This action cannot be undone."
                confirmText="Delete"
                onConfirm={async () => {
                    if (pendingDeleteId !== null) {
                        triggerUndoable(pendingDeleteId, {
                            action: onDelete,
                            message: 'Area will be deleted',
                            toastId: `delete-${pendingDeleteId}`,
                        });
                    }
                }}
            />
        </div>
    );
}

AreaOfAssignmentPage.layout = {
    breadcrumbs: [
        {
            title: 'Area',
            href: '#',
        },
    ],
};
