import {
    IconCircleCheckFilled,
    IconCircleXFilled,
    IconEdit,
    IconTrash,
} from '@tabler/icons-react';
import {
    columnFilteringFeature,
    columnVisibilityFeature,
    createColumnHelper,
    createFilteredRowModel,
    createSortedRowModel,
    rowPaginationFeature,
    rowSelectionFeature,
    rowSortingFeature,
    tableFeatures,
    columnSizingFeature,
} from '@tanstack/react-table';

import { DataTable } from '@/components/data-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { useInitials } from '@/hooks/use-initials';
import { usePermissions } from '@/hooks/use-permission';
import type { PaginatedData } from '@/types/paginated';
import type { User } from '@/types/user';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const features = tableFeatures({
    columnSizingFeature,
    columnFilteringFeature,
    columnVisibilityFeature,
    rowPaginationFeature,
    rowSelectionFeature,
    rowSortingFeature,
    filteredRowModel: createFilteredRowModel(),
    sortedRowModel: createSortedRowModel(),
});

const columnHelper = createColumnHelper<typeof features, User>();

type UsersTableProps = {
    data: PaginatedData<User>;
    onSelectionChange?: (selectedIds: string[]) => void;
    onSearch?: (value: string) => void;
    onAdd?: () => void;
    onPerPage?: (value: number) => void;
    onEdit?: (user: User) => void;
    onDelete?: (value: number) => void;
    initialSearch?: string;
};
export function UsersTable({
    data,
    onSelectionChange,
    onSearch,
    onAdd,
    onPerPage,
    onEdit,
    onDelete,
    initialSearch,
}: UsersTableProps) {
    const getInitials = useInitials();
    const { can } = usePermissions();
    const columns = columnHelper.columns([
        // columnHelper.display({
        //     id: 'select',
        //     header: ({ table }) => (
        //         <Checkbox
        //             checked={
        //                 table.getIsAllPageRowsSelected() ||
        //                 (table.getIsSomePageRowsSelected() && 'indeterminate')
        //             }
        //             onCheckedChange={(value) =>
        //                 table.toggleAllPageRowsSelected(!!value)
        //             }
        //             aria-label="Select all"
        //         />
        //     ),
        //     cell: ({ row }) => (
        //         <Checkbox
        //             checked={row.getIsSelected()}
        //             onCheckedChange={(value) => row.toggleSelected(!!value)}
        //             aria-label="Select row"
        //         />
        //     ),
        //     enableSorting: false,
        //     enableHiding: false,
        // }),

        columnHelper.accessor('description', {
            header: 'User',
            cell: ({ row }) => (
                <div className="w-full">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                            <AvatarImage
                                src={row.original.avatar}
                                alt={row.original.name}
                            />

                            <AvatarFallback className="rounded-lg bg-muted-foreground text-primary-foreground">
                                {getInitials(row.original.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="gap-.5 flex flex-col">
                            <span>{row.original.name}</span>
                            <span className="text-muted-foreground">
                                {row.original.username}
                            </span>
                        </div>
                    </div>
                </div>
            ),
        }),
        columnHelper.display({
            id: 'IsActive',
            header: 'Status',
            size: 20,
            cell: ({ row }) => (
                <Badge
                    variant="outline"
                    className="px-1.5 text-muted-foreground"
                >
                    {row.original.IsActive ? (
                        <IconCircleCheckFilled className="fill-primary dark:fill-white" />
                    ) : (
                        <IconCircleXFilled />
                    )}
                    {row.original.IsActive ? 'Active' : 'Inactive'}
                </Badge>
            ),
        }),

        columnHelper.display({
            id: 'actions',
            size: 20,
            cell: ({ row }) => {
                const canEdit = can('users-update');
                const canDelete = can('users-delete');

                if (!canEdit && !canDelete) {
                    return null;
                }

                return (
                    <div className="flex w-full justify-end gap-0.5">
                        {canEdit && (
                            <Button
                                onClick={() => onEdit?.(row.original)}
                                size="icon-sm"
                            >
                                <IconEdit />
                            </Button>
                        )}
                        {canDelete && (
                            <Button
                                onClick={() => onDelete?.(row.original.id)}
                                variant="destructive"
                                size="icon-sm"
                            >
                                <IconTrash />
                            </Button>
                        )}
                    </div>
                );
            },
        }),
    ]);

    return (
        <DataTable
            initialSearch={initialSearch}
            data={data}
            columns={columns}
            getId={(row) => row.id}
            enableRowSelection
            onRowSelectionChange={onSelectionChange}
            buttonText="Add User"
            onSearch={onSearch}
            onAdd={onAdd}
            onPerPage={onPerPage}
            permissionKey="users-create"
        />
    );
}
