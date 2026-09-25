import { IconDownload, IconEdit } from '@tabler/icons-react';
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
import type { GovernmentMandated } from '@/types/maintenance';
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

const columnHelper = createColumnHelper<typeof features, GovernmentMandated>();

type Props = {
    data: PaginatedData<GovernmentMandated>;
    initialSearch?: string;
    onSearch?: (value: string) => void;
    onAdd?: () => void;
    onPerPage?: (value: number) => void;
    onEdit?: (record: GovernmentMandated) => void;
};

export function GovernmentMandatedTable({
    data,
    initialSearch,
    onSearch,
    onAdd,
    onPerPage,
    onEdit,
}: Props) {
    const { can } = usePermissions();

    const columns = columnHelper.columns([
        columnHelper.accessor('Code', { header: 'Code' }),
        columnHelper.accessor('Description', { header: 'Description' }),
        columnHelper.accessor('ValueType', { header: 'Value Type' }),
        columnHelper.accessor('DefaultValue', {
            header: 'Default Value',
            cell: ({ row }) => {
                const value = row.original.DefaultValue;

                return value === 0 || value === '0' ? '' : value;
            },
        }),
        columnHelper.accessor('Status', {
            header: 'Status',
            cell: ({ row }) => (row.original.Status ? 'Active' : 'Inactive'),
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
                        {(row.original.ValueType?.trim().toLowerCase() === 'table-based' ||
                            row.original.ValueType?.trim().toLowerCase() === 'percentage') &&
                            row.original.File && (
                            <Button
                                asChild
                                variant="outline"
                                size="icon-sm"
                                title="Download"
                            >
                                <a
                                    href={`/maintenance/government_mandated/${row.original.id}/download`}
                                    download
                                >
                                    <IconDownload />
                                </a>
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
            onSearch={onSearch}
            onAdd={onAdd}
            onPerPage={onPerPage}
            buttonText="Add Government Mandated"
            permissionKey="permission-here"
        />
    );
}
