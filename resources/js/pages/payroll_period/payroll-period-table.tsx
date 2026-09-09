import { IconArrowRight } from '@tabler/icons-react';
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

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { usePermissions } from '@/hooks/use-permission';
import { cn } from '@/lib/utils';
import type { PaginatedData } from '@/types/paginated';
import type { PayrollPeriod } from '@/types/payroll-period';
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

const columnHelper = createColumnHelper<typeof features, PayrollPeriod>();

type PositionProps = {
    data: PaginatedData<PayrollPeriod>;
    initialSearch?: string;
    initialYear?: string;
    initialMonth?: string;
    initialStatus?: string;
    onSelectionChange?: (selectedIds: string[]) => void;
    onSearch?: (value: string) => void;
    onAdd?: () => void;
    onPerPage?: (value: number) => void;
    onEdit?: (record: PayrollPeriod) => void;
    onDelete?: (value: number) => void;
    onYearChange?: (value: string) => void;
    onMonthChange?: (value: string) => void;
    onStatusChange?: (value: string) => void;
};
export function PayrollPeriodTable({
    data,
    onSelectionChange,
    onSearch,
    onAdd,
    onPerPage,
    onEdit,
    onYearChange,
    onMonthChange,
    onStatusChange,
    initialSearch,
    initialYear,
    initialMonth,
    initialStatus,
}: PositionProps) {
    const { can } = usePermissions();
    const columns = columnHelper.columns([
        columnHelper.accessor('Label', {
            header: 'Name',
        }),

        columnHelper.accessor('PayDate', {
            header: 'Group',
        }),
        columnHelper.accessor('Status', {
            header: 'Status',
            cell: ({ row }) => {
                const status = row.original.Status;

                return (
                    <Badge
                        className={cn(
                            'capitalize',
                            status === 'open' &&
                                'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
                            status === 'processing' &&
                                'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
                            status === 'closed' &&
                                'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
                            status === 'released' &&
                                'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
                        )}
                    >
                        {status}
                    </Badge>
                );
            },
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
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        onClick={() => onEdit?.(row.original)}
                                        size="icon-sm"
                                    >
                                        <IconArrowRight />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Go to process period</p>
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
            columns={columns}
            initialSearch={initialSearch}
            initialYear={initialYear}
            initialMonth={initialMonth}
            initialStatus={initialStatus}
            getId={(row) => row.id}
            enableRowSelection
            onRowSelectionChange={onSelectionChange}
            buttonText="Generate Period"
            onSearch={onSearch}
            onAdd={onAdd}
            onPerPage={onPerPage}
            onYearChange={onYearChange}
            onMonthChange={onMonthChange}
            onStatusChange={onStatusChange}
            controlType="payroll-period"
        />
    );
}
