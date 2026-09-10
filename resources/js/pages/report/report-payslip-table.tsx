import { IconEye, IconPrinter } from '@tabler/icons-react';
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
import type { PaginatedData } from '@/types/paginated';
import type { Payslip } from '@/types/payslip';

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

const columnHelper = createColumnHelper<typeof features, Payslip>();

type ReportPayslipProps = {
    data: PaginatedData<Payslip>;
    onSelectionChange?: (selectedIds: string[]) => void;
    onSearch?: (value: string) => void;
    onAdd?: () => void;
    onPerPage?: (value: number) => void;
    onEdit?: (record: Payslip) => void;
    onPrint?: (record: Payslip) => void;
    initialSearch?: string;
    processMode?: string;
};
export function ReportEmployeePayslipTable({
    data,
    onSelectionChange,
    onSearch,
    onAdd,
    onPerPage,
    onPrint,
    initialSearch,
    processMode,
}: ReportPayslipProps) {
    const getInitials = useInitials();
    const { can } = usePermissions();
    const columns = columnHelper.columns([
        columnHelper.accessor('FullName', {
            header: 'Name',
            cell: ({ row }) => (
                <div className="w-full">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                            <AvatarImage
                                src={row.original.Image}
                                alt={row.original.FullName}
                            />

                            <AvatarFallback className="rounded-lg bg-muted-foreground text-primary-foreground">
                                {getInitials(row.original.FullName)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="gap-.5 flex flex-col">
                            <span>{row.original.FullName}</span>
                            <span className="text-muted-foreground">
                                {row.original.GroupName}
                            </span>
                        </div>
                    </div>
                </div>
            ),
        }),
        columnHelper.accessor('PayDate', {
            header: 'Pay Date',
        }),
        columnHelper.accessor('Cutoff', {
            header: 'Period Start/End',
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
                    <>
                        {processMode === 'per-employee' && (
                            <Button
                                onClick={() => onPrint?.(row.original)}
                                size="icon-sm"
                            >
                                <IconPrinter />
                            </Button>
                        )}
                    </>
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
            controlType="process-dtr"
        />
    );
}
