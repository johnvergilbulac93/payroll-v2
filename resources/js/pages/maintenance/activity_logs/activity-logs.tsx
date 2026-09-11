import { Head } from '@inertiajs/react';
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
import Heading from '@/components/heading';
import { usePaginationIndexFilters } from '@/hooks/use-pagination-filter';
import { index } from '@/routes/maintenance/activity_logs';
import type { ActivityLog } from '@/types/activity-log';
import type { PaginatedData } from '@/types/paginated';

type Props = {
    activities: PaginatedData<ActivityLog>;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const features = tableFeatures({
    columnFilteringFeature,
    columnSizingFeature,
    columnVisibilityFeature,
    rowPaginationFeature,
    rowSelectionFeature,
    rowSortingFeature,
    filteredRowModel: createFilteredRowModel(),
    sortedRowModel: createSortedRowModel(),
});

const columnHelper = createColumnHelper<typeof features, ActivityLog>();

export default function ActivityLogsPage({ activities }: Props) {
    const { filters, updateFilters } = usePaginationIndexFilters({
        route: index.url(),
        defaults: { page: 1, search: '', limit: 10 },
    });

    const columns = columnHelper.columns([
        columnHelper.accessor('date', {
            header: 'Date & Time',
            size: 150,
            cell: ({ row }) => (
                <span className="whitespace-nowrap">
                    {row.original.date ?? '—'}
                </span>
            ),
        }),
        columnHelper.accessor('user', {
            header: 'User',
            size: 140,
        }),
        columnHelper.accessor('event', {
            header: 'Action',
            size: 110,
            cell: ({ row }) => (
                <span className="font-medium capitalize">
                    {row.original.event.replaceAll('_', ' ')}
                </span>
            ),
        }),
        columnHelper.accessor('module', {
            header: 'Module',
            size: 140,
            cell: ({ row }) => (
                <span className="capitalize">
                    {row.original.module.replaceAll('-', ' ')}
                </span>
            ),
        }),
        columnHelper.accessor('description', {
            header: 'Description',
            size: 280,
            cell: ({ row }) => (
                <span
                    className="block max-w-[280px] truncate"
                    title={row.original.description}
                >
                    {row.original.description}
                </span>
            ),
        }),
        columnHelper.accessor('subject', {
            header: 'Record',
            size: 180,
            cell: ({ row }) => (
                <span
                    className="block max-w-[180px] truncate"
                    title={row.original.subject ?? undefined}
                >
                    {row.original.subject ?? '—'}
                </span>
            ),
        }),
    ]);

    return (
        <div className="w-full min-w-0 max-w-full space-y-4 p-4">
            <Head title="Activity Logs" />
            <Heading
                variant="small"
                title="Activity Logs"
                description="Review user and system activity recorded by the application."
            />

            <DataTable
                initialSearch={filters.search}
                data={activities}
                columns={columns}
                getId={(row) => row.id}
                enableRowSelection={false}
                onSearch={(value) => updateFilters({ search: value, page: 1 })}
                onPerPage={(value) => updateFilters({ limit: value, page: 1 })}
                emptyMessage="No activity logs found."
                controlType='process-dtr'
            />
        </div>
    );
}

ActivityLogsPage.layout = {
    breadcrumbs: [
        {
            title: 'Activity Logs',
            href: '#',
        },
    ],
};
