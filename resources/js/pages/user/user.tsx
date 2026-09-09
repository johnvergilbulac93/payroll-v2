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
import {
    Select,
    SelectContent,
    SelectTrigger,
    SelectGroup,
    SelectItem,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { usePaginationIndexFilters } from '@/hooks/use-pagination-filter';
import { useUndoableAction } from '@/hooks/use-undoable';

import { UsersTable } from '@/pages/user/user-table';
import { index, store, update, destroy as remove } from '@/routes/user';
import type { Option } from '@/types/option';
import type { PaginatedData } from '@/types/paginated';
import type { User } from '@/types/user';

type Props = {
    users: PaginatedData<User>;
    roles: Option[];
};

export default function UserList({ users, roles }: Props) {
    // const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
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
        username: '',
        role_id: '',
        id: '',
        IsActive: true,
    });

    const { filters, updateFilters } = usePaginationIndexFilters({
        route: index.url(),
        defaults: { page: 1, search: '', limit: 10 },
    });

    const onAdd = () => {
        reset();
        clearErrors();
        setIsAdd(true);
        setDialogTitle('Add User');
        setDialogDescription('Add a new user to the system.');
        setVisible(true);
    };

    const onCreate = () => {
        post(store.url(), {
            onSuccess: () => {
                reset();
                toast.success('Successfully saved.');
                setVisible(false);
            },
        });
    };

    const onUpdate = () => {
        put(update.url(Number(data.id)), {
            onSuccess: () => {
                reset();
                toast.success('Changes saved successfully');
                setVisible(false);
            },
        });
    };

    const onEdit = (user: User) => {
        clearErrors();
        setIsAdd(false);
        setDialogTitle('Edit User');
        setDialogDescription(
            `Make changes to this user. Click save when you're done.`,
        );
        setData({
            id: String(user.id),
            name: user.name,
            username: user.username,
            IsActive: user.IsActive,
            role_id: String(user.role),
        });
        setVisible(true);
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
            <Head title="Users" />
            <Heading
                title="Users"
                description="View, add, edit, and manage user accounts."
            />
            <UsersTable
                initialSearch={filters.search}
                data={users}
                // onSelectionChange={setSelectedUserIds}
                onSearch={(value) => updateFilters({ search: value, page: 1 })}
                onAdd={onAdd}
                onPerPage={(value) => updateFilters({ limit: value, page: 1 })}
                onEdit={(user) => onEdit(user)}
                onDelete={(value) => onConfirm(value)}
            />
            <FormDialog
                key={isAdd ? 'add' : `edit-${data.id}`}
                open={visible}
                onOpenChange={setVisible}
                title={dialogTitle}
                description={dialogDescription}
                addText={isAdd ? 'Submit' : 'Save changes'}
                loading={processing}
                onAdd={isAdd ? onCreate : onUpdate}
                onCancel={() => setVisible(false)}
                size="lg"
            >
                <FieldGroup className="gap-4">
                    <Field data-invalid={!!errors.name} className="gap-2">
                        <FieldLabel htmlFor="user.name">Role name</FieldLabel>
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
                    <Field data-invalid={!!errors.username} className="gap-2">
                        <FieldLabel htmlFor="user.username">
                            Username
                        </FieldLabel>
                        <Input
                            value={data.username}
                            onChange={(e) =>
                                setData('username', e.target.value)
                            }
                            type="text"
                            id="user.username"
                            placeholder="Username"
                            aria-invalid={!!errors.username}
                            tabIndex={2}
                        />
                        {errors.username && (
                            <FieldError>{errors.username}</FieldError>
                        )}
                    </Field>
                    <Field data-invalid={!!errors.role_id} className="gap-2">
                        <FieldLabel htmlFor="user.role_id">Role</FieldLabel>
                        <Select
                            value={data.role_id}
                            onValueChange={(value) => setData('role_id', value)}
                        >
                            <SelectTrigger
                                aria-invalid={!!errors.role_id}
                                tabIndex={3}
                                id="user.role_id"
                            >
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {roles.map((role) => (
                                        <SelectItem
                                            key={role.value}
                                            value={role.value}
                                        >
                                            {role.label}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        {errors.role_id && (
                            <FieldError>{errors.role_id}</FieldError>
                        )}
                    </Field>
                    <FieldLabel htmlFor="switch-status">
                        <Field orientation="horizontal">
                            <FieldContent>
                                <FieldTitle>Status</FieldTitle>
                                <FieldDescription>
                                    This indicates whether the user is still
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
                title="Delete loan?"
                description="This will permanently delete this user record. This action cannot be undone."
                confirmText="Delete"
                onConfirm={async () => {
                    if (pendingDeleteId !== null) {
                        triggerUndoable(pendingDeleteId, {
                            action: onDelete,
                            message: 'User will be deleted',
                            toastId: `delete-${pendingDeleteId}`,
                        });
                    }
                }}
            />
        </div>
    );
}

UserList.layout = {
    breadcrumbs: [
        {
            title: 'Users',
            href: index(),
        },
    ],
};
