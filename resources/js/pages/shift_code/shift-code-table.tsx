import { IconEdit, IconTrash } from '@tabler/icons-react';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/use-permission';
import type { PaginatedData } from '@/types/paginated';
import type { ShiftCode } from '@/types/shift-code';

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

const columnHelper = createColumnHelper<typeof features, ShiftCode>();

type ShiftCodeProps = {
    data: PaginatedData<ShiftCode>;
    onSelectionChange?: (selectedIds: string[]) => void;
    onSearch?: (value: string) => void;
    onAdd?: () => void;
    onPerPage?: (value: number) => void;
    onEdit?: (record: ShiftCode) => void;
    onDelete?: (value: number) => void;
    initialSearch?: string;
};

export function ShiftCodeTable({
    data,
    onSelectionChange,
    onSearch,
    onAdd,
    onPerPage,
    onEdit,
    onDelete,
    initialSearch,
}: ShiftCodeProps) {
    const { can } = usePermissions();

    const columns = columnHelper.columns([
        columnHelper.accessor('Name', {
            header: 'Name',
        }),
        columnHelper.accessor('Schedule', {
            header: 'Schedule',
        }),
        columnHelper.accessor('TotalHours', {
            header: 'Total Hours',
        }),
        columnHelper.accessor('IsWorkingDay', {
            header: 'Working Day',
            cell: ({ row }) => (
                <Badge variant="outline">
                    {row.original.IsWorkingDay ? 'Yes' : 'No'}
                </Badge>
            ),
        }),
        columnHelper.accessor('IsActive', {
            header: 'Status',
            cell: ({ row }) => (
                <Badge
                    variant="outline"
                    className={row.original.IsActive ? 'text-primary' : undefined}
                >
                    {row.original.IsActive ? 'Active' : 'Inactive'}
                </Badge>
            ),
        }),
        columnHelper.display({
            id: 'actions',
            size: 20,
            cell: ({ row }) => {
                const canEdit = can('shift-code-update');
                const canDelete = can('shift-code-delete');

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
            buttonText="Add Shift"
            onSearch={onSearch}
            onAdd={onAdd}
            onPerPage={onPerPage}
        />
    );
}
