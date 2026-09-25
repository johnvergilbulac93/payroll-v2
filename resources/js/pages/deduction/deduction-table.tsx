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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useInitials } from '@/hooks/use-initials';
import { usePermissions } from '@/hooks/use-permission';
import type { Deduction } from '@/types/deduction';
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

const columnHelper = createColumnHelper<typeof features, Deduction>();

type Props = {
    data: PaginatedData<Deduction>;
    initialSearch?: string;
    onSearch?: (value: string) => void;
    onAdd?: () => void;
    onPerPage?: (value: number) => void;
    onEdit?: (record: Deduction) => void;
    onDelete?: (id: number) => void;
};

const money = (value: number) =>
    new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(Number(value));

export function DeductionTable({
    data,
    initialSearch,
    onSearch,
    onAdd,
    onPerPage,
    onEdit,
    onDelete,
}: Props) {
    const { can } = usePermissions();
    const getInitials = useInitials();

    const columns = columnHelper.columns([
        columnHelper.display({
            header: 'Employee',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                        <AvatarImage src={row.original.ImageUrl} alt={row.original.EmployeeName} />
                        <AvatarFallback className="rounded-lg bg-muted-foreground text-primary-foreground">
                            {getInitials(row.original.EmployeeName)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span>{row.original.EmployeeName}</span>
                        <span className="text-muted-foreground">{row.original.EmpNbr}</span>
                    </div>
                </div>
            ),
        }),
        columnHelper.accessor('DeductionType', { header: 'Type' }),
        columnHelper.accessor('StartDateLabel', { header: 'Start deduction' }),
        columnHelper.accessor('OrigBal', {
            header: 'Original balance',
            cell: ({ getValue }) => money(getValue()),
        }),
        columnHelper.accessor('DedAmt', {
            header: 'Deduction amount',
            cell: ({ getValue }) => money(getValue()),
        }),
        columnHelper.accessor('BalanceAmt', {
            header: 'Balance',
            cell: ({ getValue }) => money(getValue()),
        }),
        columnHelper.display({
            id: 'actions',
            size: 20,
            cell: ({ row }) => {
                const canEdit = can('deductions-update');
                const canDelete = can('deductions-delete');

                if (!canEdit && !canDelete) return null;

                return (
                    <div className="flex w-full justify-end gap-0.5">
                        {canEdit && (
                            <Button onClick={() => onEdit?.(row.original)} size="icon-sm">
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
            initialSearch={initialSearch}
            columns={columns}
            getId={(row) => row.id}
            enableRowSelection
            buttonText="New deduction"
            onSearch={onSearch}
            onAdd={onAdd}
            onPerPage={onPerPage}
            permissionKey="deductions-create"
        />
    );
}
