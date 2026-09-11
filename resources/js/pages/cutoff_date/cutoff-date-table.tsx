import { IconEdit, IconTrash } from '@tabler/icons-react';
import {
    columnFilteringFeature,
    columnSizingFeature,
    columnVisibilityFeature,
    createColumnHelper,
    createFilteredRowModel,
    createSortedRowModel,
    rowPaginationFeature,
    rowSelectionFeature,
    rowSortingFeature,
    tableFeatures,
} from '@tanstack/react-table';

import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/use-permission';
import type { CuffOffDate } from '@/types/cutoff-date';
import type { PaginatedData } from '@/types/paginated';

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

const columnHelper = createColumnHelper<typeof features, CuffOffDate>();

type CutoffDateTableProps = {
    data: PaginatedData<CuffOffDate>;
    onSelectionChange?: (selectedIds: string[]) => void;
    onSearch?: (value: string) => void;
    onAdd?: () => void;
    onPerPage?: (value: number) => void;
    onEdit?: (record: CuffOffDate) => void;
    onDelete?: (value: number) => void;
    initialSearch?: string;
};

function formatDay(day: number | undefined): string {
    if (day === undefined || day === null) {
        return '—';
    }

    const lastTwoDigits = day % 100;
    const suffix =
        lastTwoDigits >= 11 && lastTwoDigits <= 13
            ? 'th'
            : day % 10 === 1
              ? 'st'
              : day % 10 === 2
                ? 'nd'
                : day % 10 === 3
                  ? 'rd'
                  : 'th';

    return `${day}${suffix}`;
}

export function CutoffDateTable({
    data,
    onSelectionChange,
    onSearch,
    onAdd,
    onPerPage,
    onEdit,
    onDelete,
    initialSearch,
}: CutoffDateTableProps) {
    const { can } = usePermissions();

    const columns = columnHelper.columns([
        columnHelper.accessor('Name', {
            header: 'Name',
        }),
        columnHelper.display({
            id: 'cutoff1',
            header: 'Cut-off 1',
            cell: ({ row }) =>
                `${formatDay(row.original.Cutoff1StartDay)} → ${formatDay(row.original.Cutoff1EndDay)}`,
        }),
        columnHelper.display({
            id: 'cutoff2',
            header: 'Cut-off 2',
            cell: ({ row }) =>
                `${formatDay(row.original.Cutoff2StartDay)} → ${formatDay(row.original.Cutoff2EndDay)}`,
        }),
        columnHelper.accessor('IsActive', {
            header: 'Status',
            cell: ({ row }) => (
                <Badge variant={row.original.IsActive ? 'default' : 'secondary'}>
                    {row.original.IsActive ? 'Active' : 'Inactive'}
                </Badge>
            ),
        }),
        columnHelper.display({
            id: 'actions',
            size: 20,
            cell: ({ row }) => {
                const canEdit = can('cutoff-dates-update');
                const canDelete = can('cutoff-dates-delete');

                if (!canEdit && !canDelete) {
                    return null;
                }

                return (
                    <div className="flex w-full justify-end gap-0.5">
                        {canEdit && (
                            <Button
                                onClick={() => onEdit?.(row.original)}
                                size="icon-sm"
                                aria-label="Edit cut-off date"
                            >
                                <IconEdit />
                            </Button>
                        )}
                        {canDelete && (
                            <Button
                                onClick={() => onDelete?.(Number(row.original.id))}
                                variant="destructive"
                                size="icon-sm"
                                aria-label="Delete cut-off date"
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
            buttonText="Add Cut-off Date"
            onSearch={onSearch}
            onAdd={onAdd}
            onPerPage={onPerPage}
        />
    );
}
