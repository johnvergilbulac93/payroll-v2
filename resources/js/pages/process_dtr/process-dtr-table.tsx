import { IconEye, IconRefresh } from '@tabler/icons-react';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import type { PaginatedData } from '@/types/paginated';
import type { EmployeeDtrPeriod } from '@/types/payroll-period';

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

const columnHelper = createColumnHelper<typeof features, EmployeeDtrPeriod>();

type ProcessDtrProps = {
    data: PaginatedData<EmployeeDtrPeriod>;
    onSelectionChange?: (selectedIds: string[]) => void;
    onSearch?: (value: string) => void;
    onAdd?: () => void;
    onPerPage?: (value: number) => void;
    onEdit?: (record: EmployeeDtrPeriod) => void;
    onProcess?: (record: EmployeeDtrPeriod) => void;
    onDelete?: (value: number) => void;
    processMode: string;
};
export function ProcessDtrTable({
    data,
    onSelectionChange,
    onSearch,
    onAdd,
    onPerPage,
    onEdit,
    onProcess,
    processMode,
}: ProcessDtrProps) {
    const getInitials = useInitials();

    const columns = columnHelper.columns([
        columnHelper.accessor('FullName', {
            header: 'Employee name',
            cell: ({ row }) => (
                <div className="w-full">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                            <AvatarImage
                                src={row.original.Image ?? undefined}
                                alt={row.original.FullName}
                            />
                            <AvatarFallback className="rounded-lg bg-muted-foreground text-primary-foreground">
                                {getInitials(row.original.FullName)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="gap-.5 flex flex-col">
                            <span>{row.original.FullName}</span>
                            <span className="text-muted-foreground">
                                {row.original.EmpNbr}
                            </span>
                        </div>
                    </div>
                </div>
            ),
        }),
        columnHelper.accessor('GroupName', {
            header: 'Group',
        }),
        columnHelper.display({
            id: 'Status',
            cell: ({ row }) => {
                const employee = row.original;

                return employee.Remarks ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Badge
                                variant="outline"
                                className={cn(
                                    'capitalize',
                                    employee.Status === 'flagged' &&
                                        'bg-amber-600 text-primary-foreground',
                                    employee.Status === 'processed' &&
                                        'bg-primary text-primary-foreground',
                                    employee.Status === 'closed' &&
                                        'bg-destructive text-destructive-foreground',
                                )}
                            >
                                {employee.Status}
                            </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{employee.Remarks}</p>
                        </TooltipContent>
                    </Tooltip>
                ) : (
                    <Badge
                        variant="outline"
                        className={cn(
                            'capitalize',
                            employee.Status === 'flagged' &&
                                'bg-amber-600 text-primary-foreground',
                            employee.Status === 'processed' &&
                                'bg-emerald-600 text-primary-foreground',
                            employee.Status === 'pending' &&
                                'bg-red-500 text-primary-foreground',
                        )}
                    >
                        {employee.Status}
                    </Badge>
                );
            },
        }),
        columnHelper.display({
            id: 'actions',
            size: 20,
            cell: ({ row }) => {
                const dtrRecords = row.original.DTRRecords ?? [];

                return (
                    <div className="flex w-full justify-end gap-0.5">
                        {dtrRecords.length > 0 && (
                            <Button
                                variant="outline"
                                onClick={() => onEdit?.(row.original)}
                                size="icon-sm"
                            >
                                <IconEye />
                            </Button>
                        )}
                        {processMode === 'per-employee' && (
                            <Button
                                onClick={() => onProcess?.(row.original)}
                                size="icon-sm"
                            >
                                <IconRefresh />
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
            buttonText="Add Position"
            onSearch={onSearch}
            onAdd={onAdd}
            onPerPage={onPerPage}
            controlType="process-dtr"
        />
    );
}
