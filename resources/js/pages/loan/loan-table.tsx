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
import type { Loan } from '@/types/loan';
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

const columnHelper = createColumnHelper<typeof features, Loan>();

type LoanTableProps = {
    data: PaginatedData<Loan>;
    onSelectionChange?: (selectedIds: string[]) => void;
    onSearch?: (value: string) => void;
    onAdd?: () => void;
    onPerPage?: (value: number) => void;
    onEdit?: (loan: Loan) => void;
    onDelete?: (value: number) => void;
    initialSearch?: string;
};
export function LoanTable({
    data,
    onSelectionChange,
    onSearch,
    onAdd,
    onPerPage,
    onEdit,
    onDelete,
    initialSearch,
}: LoanTableProps) {
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
        columnHelper.display({
            header: 'Employee',
            cell: ({ row }) => (
                <div className="w-full">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                            <AvatarImage
                                src={row.original.ImageUrl}
                                alt={row.original.EmployeeName}
                            />

                            <AvatarFallback className="rounded-lg bg-muted-foreground text-primary-foreground">
                                {getInitials(row.original.EmployeeName)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="gap-.5 flex flex-col">
                            <span>{row.original.EmployeeName}</span>
                            <span className="text-muted-foreground">
                                {row.original.EmpNbr}
                            </span>
                        </div>
                    </div>
                </div>
            ),
        }),
        columnHelper.accessor('LoanType', {
            header: 'Type',
        }),
        columnHelper.accessor('StartDateLabel', {
            header: 'Start deduction',
        }),
        columnHelper.accessor('OrigBal', {
            header: 'Balance',
            cell: (info) => {
                const value = info.getValue();

                return new Intl.NumberFormat('en-PH', {
                    style: 'currency',
                    currency: 'PHP',
                }).format(Number(value));
            },
        }),

        columnHelper.display({
            id: 'actions',
            size: 20,
            cell: ({ row }) => {
                const canEdit = can('loan-update');
                const canDelete = can('loan-delete');

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
            initialSearch={initialSearch}
            columns={columns}
            getId={(row) => row.id}
            enableRowSelection
            onRowSelectionChange={onSelectionChange}
            buttonText="New loan"
            onSearch={onSearch}
            onAdd={onAdd}
            onPerPage={onPerPage}
            permissionKey="loan-create"
        />
    );
}
