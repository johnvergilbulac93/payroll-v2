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
import { usePaginationIndexFilters } from '@/hooks/use-pagination-filter';
import { useUndoableAction } from '@/hooks/use-undoable';
import { GroupTable } from '@/pages/maintenance/group/group-table';
import {
    index,
    store,
    update,
    destroy as remove,
} from '@/routes/maintenance/group';
import type { Maintenance } from '@/types/maintenance';
import type { PaginatedData } from '@/types/paginated';

type Props = {
    groups: PaginatedData<Maintenance>;
};
export default function GroupPage({ groups }: Props) {
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
    });

    const { updateFilters } = usePaginationIndexFilters({
        route: index.url(),
        defaults: { page: 1, search: '', limit: 10 },
    });
    const onAdd = () => {
        resetAndClearErrors();
        setIsAdd(true);
        setDialogTitle('Add Group');
        setDialogDescription('Add a new group to the system.');
        setVisible(true);
    };
    const onEdit = (record: Maintenance) => {
        resetAndClearErrors();
        setIsAdd(false);
        setDialogTitle('Edit Group');
        setDialogDescription(
            `Make changes to this group. Click save when you're done.`,
        );
        setData({
            id: String(record.id),
            name: record.name,
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
            <Head title="Group" />
            <Heading
                variant="small"
                title="Group Maintenance"
                description="Add, update, and manage group."
            />
            <GroupTable
                data={groups}
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
                        <FieldLabel htmlFor="group.name">Name</FieldLabel>
                        <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            type="text"
                            id="group.name"
                            placeholder="Name"
                            aria-invalid={!!errors.name}
                            tabIndex={1}
                        />
                        {errors.name && <FieldError>{errors.name}</FieldError>}
                    </Field>
                </FieldGroup>
            </FormDialog>

            <ConfirmDialog
                size="sm"
                open={confirmOpen}
                icon={<IconTrash />}
                onOpenChange={setConfirmOpen}
                title="Delete group?"
                description="This will permanently delete this group record. This action cannot be undone."
                confirmText="Delete"
                onConfirm={async () => {
                    if (pendingDeleteId !== null) {
                        triggerUndoable(pendingDeleteId, {
                            action: onDelete,
                            message: 'Group will be deleted',
                            toastId: `delete-${pendingDeleteId}`,
                        });
                    }
                }}
            />
        </div>
    );
}

GroupPage.layout = {
    breadcrumbs: [
        {
            title: 'Group',
            href: '#',
        },
    ],
};
