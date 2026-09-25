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
import type { DeductionType } from '@/types/maintenance';
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

const columnHelper = createColumnHelper<typeof features, DeductionType>();

type Props = {
    data: PaginatedData<DeductionType>;
    initialSearch?: string;
    onSearch?: (value: string) => void;
    onAdd?: () => void;
    onPerPage?: (value: number) => void;
    onEdit?: (record: DeductionType) => void;
    onDelete?: (id: number) => void;
};

const frequencyLabels: Record<string, string> = {
    '00': 'Every Payday',
    '15': 'Every 15th',
    '30': 'End of Month',
};

export function DeductionTypeTable({
    data,
    initialSearch,
    onSearch,
    onAdd,
    onPerPage,
    onEdit,
    onDelete,
}: Props) {
    const { can } = usePermissions();

    const columns = columnHelper.columns([
        columnHelper.accessor('name', { header: 'Name' }),
        columnHelper.accessor('frequency', {
            header: 'Frequency',
            cell: ({ row }) =>
                frequencyLabels[row.original.frequency] ?? row.original.frequency,
        }),
        columnHelper.display({
            id: 'actions',
            size: 20,
            cell: ({ row }) => {
                const allowed = can('maintenance-view');

                if (!allowed) {
                    return null;
                }

                return (
                    <div className="flex w-full justify-end gap-0.5">
                        <Button
                            onClick={() => onEdit?.(row.original)}
                            size="icon-sm"
                        >
                            <IconEdit />
                        </Button>
                        <Button
                            onClick={() => onDelete?.(row.original.id)}
                            variant="destructive"
                            size="icon-sm"
                        >
                            <IconTrash />
                        </Button>
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
            buttonText="Add Deduction Type"
            onSearch={onSearch}
            onAdd={onAdd}
            onPerPage={onPerPage}
        />
    );
}
