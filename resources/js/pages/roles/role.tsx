import { Head, useForm } from '@inertiajs/react';
import { IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/alert-dialog';
import { FormDialog } from '@/components/base-modal';
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
import { Switch } from '@/components/ui/switch';
import { usePaginationIndexFilters } from '@/hooks/use-pagination-filter';
import { useUndoableAction } from '@/hooks/use-undoable';
import { RolesTable } from '@/pages/roles/role-table';
import { index, store, update, destroy as remove } from '@/routes/role';
import type { PaginatedData } from '@/types/paginated';
import type { Role } from '@/types/role';
type Props = {
    roles: PaginatedData<Role>;
};

export default function Role({ roles }: Props) {
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
        delete: destroy,
        reset,
        errors,
        clearErrors,
    } = useForm({
        name: '',
        id: '',
        IsActive: true,
    });
    const { updateFilters } = usePaginationIndexFilters({
        route: index.url(),
        defaults: { page: 1, search: '', limit: 10 },
    });

    const onAdd = () => {
        clearErrors();
        reset();
        setIsAdd(true);
        setDialogTitle('Add Role');
        setDialogDescription('Add a new role to the system.');
        setVisible(true);
    };
    const onEdit = (role: Role) => {
        clearErrors();
        setIsAdd(false);
        setDialogTitle('Edit Role');
        setDialogDescription(
            `Make changes to this role. Click save when you're done.`,
        );
        setData({
            id: String(role.id),
            name: role.name,
            IsActive: role.IsActive,
        });
        setVisible(true);
    };
    const onCreate = () => {
        post(store.url(), {
            onSuccess: () => {
                setVisible(false);
                reset();
                toast.success('Successfully saved.');
            },
        });
    };
    const onUpdate = () => {
        put(update.url(Number(data.id)), {
            onSuccess: () => {
                setVisible(false);
                toast.success('Successfully updated.');
            },
        });
    };
    const onConfirm = (value: number) => {
        setPendingDeleteId(value);
        setConfirmOpen(true);
    };
    const onDelete = (id: number) => {
        destroy(remove.url(id), {
            onSuccess: () => {
                toast.success('Successfully deleted.');
            },
        });
    };

    return (
        <div className="p-4">
            <Head title="Roles" />
            <Heading
                title="Roles"
                description="View, add, edit, and manage role details."
            />
            <RolesTable
                data={roles}
                // onSelectionChange={setSelectedUserIds}
                onSearch={(value) => updateFilters({ search: value, page: 1 })}
                onAdd={onAdd}
                onPerPage={(value) => updateFilters({ limit: value, page: 1 })}
                onEdit={(role) => onEdit(role)}
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
                        <FieldLabel htmlFor="user.name">Name</FieldLabel>
                        <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            type="text"
                            id="user.name"
                            placeholder="Name"
                            aria-invalid={!!errors.name}
                            tabIndex={1}
                        />
                        {errors.name && <FieldError>{errors.name}</FieldError>}
                    </Field>
                    <FieldLabel htmlFor="switch-status">
                        <Field orientation="horizontal">
                            <FieldContent>
                                <FieldTitle>Status</FieldTitle>
                                <FieldDescription>
                                    This indicates whether the role is still
                                    active.
                                </FieldDescription>
                            </FieldContent>
                            <Switch
                                id="switch-status"
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
                title="Delete role?"
                description="This will permanently delete this role record. This action cannot be undone."
                confirmText="Delete"
                onConfirm={async () => {
                    if (pendingDeleteId !== null) {
                        triggerUndoable(pendingDeleteId, {
                            action: onDelete,
                            message: 'Role will be deleted',
                            toastId: `delete-${pendingDeleteId}`,
                        });
                    }
                }}
            />
        </div>
    );
}

Role.layout = {
    breadcrumbs: [
        {
            title: 'Roles',
            href: index(),
        },
    ],
};
