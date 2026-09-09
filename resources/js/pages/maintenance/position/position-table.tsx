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
import { Button } from '@/components/ui/button';

import { usePermissions } from '@/hooks/use-permission';
import type { Maintenance } from '@/types/maintenance';
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

const columnHelper = createColumnHelper<typeof features, Maintenance>();

type PositionProps = {
    data: PaginatedData<Maintenance>;
    onSelectionChange?: (selectedIds: string[]) => void;
    onSearch?: (value: string) => void;
    onAdd?: () => void;
    onPerPage?: (value: number) => void;
    onEdit?: (record: Maintenance) => void;
    onDelete?: (value: number) => void;
    initialSearch?: string;
};
export function PositionTable({
    data,
    onSelectionChange,
    onSearch,
    onAdd,
    onPerPage,
    onEdit,
    onDelete,
    initialSearch,
}: PositionProps) {
    const { can } = usePermissions();
    const columns = columnHelper.columns([
        columnHelper.accessor('name', {
            header: 'Name',
        }),
        columnHelper.accessor('type_name', {
            header: 'Group',
        }),
        columnHelper.display({
            id: 'actions',
            size: 20,
            cell: ({ row }) => {
                const canEdit = can('roles-update');
                const canDelete = can('roles-delete');

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
            buttonText="Add Position"
            onSearch={onSearch}
            onAdd={onAdd}
            onPerPage={onPerPage}
        />
    );
}
