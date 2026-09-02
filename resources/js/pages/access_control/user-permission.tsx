import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import ComboBox from '@/components/combo-box';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import PermissionTree from '@/pages/access_control/permission-tree';
import { userPermission, updateUserPermission } from '@/routes/access_control';
import type { Option } from '@/types/option';
import type { Permission } from '@/types/permission';
type UserPermissionProps = {
    users: Option[];
};

export default function UserPermission({ users }: UserPermissionProps) {
    const [selectedUser, setSelectedUser] = useState<Option | null>(null);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const onChange = async (value: Option | null) => {
        setSelectedUser(value);

        if (!value) {
            setPermissions([]);

            return;
        }

        const response = await fetch(userPermission.url(Number(value.value)), {
            headers: { Accept: 'application/json' },
        });

        const { data } = await response.json();
        setPermissions(data);
    };

    const onSave = () => {
        if (!selectedUser) {
            return;
        }

        router.post(
            updateUserPermission.url(Number(selectedUser.value)),
            { permission_ids: selectedIds },
            {
                onStart: () => setIsSaving(true),
                onFinish: () => setIsSaving(false),
                onSuccess: () => {
                    toast.success('Saved changes.');
                },
            },
        );
    };

    return (
        <div className="w-full">
            <div className="grid grid-cols-2 gap-4">
                <ComboBox
                    items={users}
                    value={selectedUser}
                    onValueChange={onChange}
                />
                <div className="flex items-center justify-end">
                    <Button
                        disabled={isSaving || !permissions.length}
                        className="disabled:cursor-not-allowed"
                        onClick={onSave}
                        variant="outline"
                    >
                        {isSaving && <Spinner />}
                        Save changes
                    </Button>
                </div>
            </div>

            {!!permissions.length && (
                <div className="mt-4 space-y-1">
                    <PermissionTree
                        data={permissions}
                        value={selectedIds}
                        onChange={setSelectedIds}
                    />
                </div>
            )}
        </div>
    );
}
