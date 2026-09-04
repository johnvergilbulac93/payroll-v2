import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePaginationIndexFilters } from '@/hooks/use-pagination-filter';
import UserPermission from '@/pages/access_control/user-permission';
import { index } from '@/routes/access_control';
import type { Option } from '@/types/option';
import type { Permission } from '@/types/permission';
import type { Role } from '@/types/role';
import RolePermission from './role-permission';

export type PermissionGrant = {
    granted: boolean;
};

export type RolePermissionMatrix = Record<
    number,
    Record<number, PermissionGrant>
>;

type Props = {
    users: Option[];
    roles: Role[];
    permissions: Permission[];
    matrix: RolePermissionMatrix;
};
export default function AccessControl({
    users,
    roles,
    permissions,
    matrix,
}: Props) {
    const { updateFilters, isLoading } = usePaginationIndexFilters({
        route: index.url(),
        defaults: { page: 1, search: '', limit: 10 },
    });

    return (
        <div className="p-4">
            <Head title="Access Control" />
            <Heading
                title="Access Control"
                description="Manage roles and their assigned permissions."
            />
            <Tabs defaultValue="role-permission" className="w-full">
                <TabsList variant="line">
                    <TabsTrigger value="role-permission">
                        Role Permission
                    </TabsTrigger>
                    <TabsTrigger value="user-permission">
                        User Permission
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="user-permission">
                    <div className="px-2">
                        <UserPermission users={users} />
                    </div>
                </TabsContent>
                <TabsContent value="role-permission">
                    <RolePermission
                        matrix={matrix}
                        permissions={permissions}
                        roles={roles}
                        onSearch={(value) => updateFilters({ search: value })}
                        isLoading={isLoading}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
AccessControl.layout = {
    breadcrumbs: [
        {
            title: 'Access Control',
            href: index(),
        },
    ],
};
