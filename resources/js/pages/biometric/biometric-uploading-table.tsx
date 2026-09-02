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
import { cn } from '@/lib/utils';
import type { BiometricUploading } from '@/types/biometric-uploading';
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

const columnHelper = createColumnHelper<typeof features, BiometricUploading>();

type UploadingTableProps = {
    data: PaginatedData<BiometricUploading>;
    onSelectionChange?: (selectedIds: string[]) => void;
    onSearch?: (value: string) => void;
    onAdd?: () => void;
    onPerPage?: (value: number) => void;
    onEdit?: (file: BiometricUploading) => void;
    onDelete?: (value: number) => void;
};
export function BiometricUploadingTable({
    data,
    onSelectionChange,
    onSearch,
    onAdd,
    onPerPage,
    onEdit,
    onDelete,
}: UploadingTableProps) {
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

        columnHelper.accessor('FileName', {
            header: 'File name',
        }),
        columnHelper.accessor('TotalRows', {
            header: 'Total rows',
        }),
        columnHelper.accessor('ImportedRows', {
            header: 'Imported rows',
        }),
        columnHelper.accessor('SkippedRows', {
            header: 'Skipped rows',
        }),
        columnHelper.accessor('FailedRows', {
            header: 'Failed rows',
        }),
        columnHelper.accessor('Status', {
            header: 'Status',
            size: 20,
            cell: ({ row }) => {
                const status = row.getValue('Status') as string;

                const variants: Record<string, string> = {
                    completed: 'bg-primary',
                    failed: 'bg-destructive',
                };

                const colorClass =
                    variants[status?.toLowerCase()] ?? 'bg-gray-400';

                return (
                    <Badge className={cn('capitalize', colorClass)}>
                        {status}
                    </Badge>
                );
            },
        }),

        columnHelper.display({
            id: 'actions',
            size: 20,
            cell: ({ row }) => {
                const canEdit = can('biometric-uploading-update');
                const canDelete = can('biometric-uploading-delete');

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
            data={data}
            columns={columns}
            getId={(row) => row.id}
            enableRowSelection
            onRowSelectionChange={onSelectionChange}
            buttonText="Upload"
            onSearch={onSearch}
            onAdd={onAdd}
            onPerPage={onPerPage}
            permissionKey="biometric-uploading-create"
        />
    );
}
