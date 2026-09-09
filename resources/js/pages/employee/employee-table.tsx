import {
    IconCalendarTime,
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
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useInitials } from '@/hooks/use-initials';
import { usePermissions } from '@/hooks/use-permission';
import type { Employee } from '@/types/employee';
import type { PaginatedData } from '@/types/paginated';
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

const columnHelper = createColumnHelper<typeof features, Employee>();

type EmployeeTableProps = {
    data: PaginatedData<Employee>;
    onSelectionChange?: (selectedIds: string[]) => void;
    onSearch?: (value: string) => void;
    onAdd?: () => void;
    onPerPage?: (value: number) => void;
    onEdit?: (employee: Employee) => void;
    onDelete?: (value: number) => void;
    initialSearch?: string
};
export function EmployeeTable({
    data,
    onSelectionChange,
    onSearch,
    onAdd,
    onPerPage,
    onEdit,
    onDelete,
    initialSearch
}: EmployeeTableProps) {
    const { can } = usePermissions();
    const getInitials = useInitials();
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

        columnHelper.accessor('FullName', {
            header: 'Name',
            cell: ({ row }) => (
                <div className="w-full">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                            <AvatarImage
                                src={row.original.ImageUrl ?? undefined}
                                alt={row.original.FullName}
                            />
                            <AvatarFallback className="rounded-lg bg-muted-foreground text-primary-foreground">
                                {getInitials(row.original.FullName)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="gap-.5 flex flex-col">
                            <span>{row.original.FullName}</span>
                            <span className="text-muted-foreground">
                                {row.original.EmpNbr}
                            </span>
                        </div>
                    </div>
                </div>
            ),
        }),
        columnHelper.accessor('PositionName', { header: 'Position' }),
        columnHelper.accessor('GroupName', { header: 'Group' }),

        columnHelper.display({
            id: 'IsActive',
            header: 'Status',
            size: 20,
            cell: ({ row }) => (
                <Badge
                    variant="outline"
                    className="px-1.5 text-muted-foreground"
                >
                    {row.original.Status ? (
                        <IconCircleCheckFilled className="fill-primary dark:fill-white" />
                    ) : (
                        <IconCircleXFilled />
                    )}
                    {row.original.Status ? 'Active' : 'Inactive'}
                </Badge>
            ),
        }),

        columnHelper.display({
            id: 'actions',
            size: 20,
            cell: ({ row }) => {
                const canEdit = can('employee-update');
                const canDelete = can('employee-delete');

                if (!canEdit && !canDelete) {
                    return null;
                }

                return (
                    <div className="flex w-full justify-end gap-0.5">
                        {canEdit && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={() => onEdit?.(row.original)}
                                        size="icon-sm"
                                    >
                                        <IconEdit />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Edit User</p>
                                </TooltipContent>
                            </Tooltip>
                        )}

                        {canDelete && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={() =>
                                            onDelete?.(row.original.id)
                                        }
                                        variant="destructive"
                                        size="icon-sm"
                                    >
                                        <IconTrash />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Delete User</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                );
            },
        }),
    ]);

    return (
        <DataTable
            data={data}
            initialSearch={initialSearch}
            columns={columns}
            getId={(row) => row.id}
            enableRowSelection
            onRowSelectionChange={onSelectionChange}
            buttonText="Add Employee"
            permissionKey="employee-create"
            onSearch={onSearch}
            onAdd={onAdd}
            onPerPage={onPerPage}
        />
    );
}
