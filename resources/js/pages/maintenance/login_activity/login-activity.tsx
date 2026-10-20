import { Head } from '@inertiajs/react';
import { IconEye } from '@tabler/icons-react';
import {
    columnSizingFeature,
    createColumnHelper,
    createSortedRowModel,
    rowPaginationFeature,
    rowSelectionFeature,
    rowSortingFeature,
    tableFeatures,
} from '@tanstack/react-table';
import { useState } from 'react';
import { DataTable } from '@/components/data-table';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePaginationIndexFilters } from '@/hooks/use-pagination-filter';
import { index } from '@/routes/maintenance/login_activity';
import type { PaginatedData } from '@/types/paginated';

type LoginActivity = {
    id: number;
    date: string | null;
    user: string;
    username: string;
    event: 'login_success' | 'login_failed' | 'logout' | string;
    ip_address: string;
    user_agent: string | null;
    failure_reason: string | null;
    session_id: string | null;
};

type Props = {
    activities: PaginatedData<LoginActivity>;
    filters: { search: string; event: string; limit: number };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const features = tableFeatures({
    columnSizingFeature,
    rowPaginationFeature,
    rowSelectionFeature,
    rowSortingFeature,
    sortedRowModel: createSortedRowModel(),
});

const columnHelper = createColumnHelper<typeof features, LoginActivity>();

const eventLabel: Record<string, string> = {
    login_success: 'Successful login',
    login_failed: 'Failed login',
    logout: 'Logout',
};

export default function LoginActivityPage({ activities }: Props) {
    const [selectedActivity, setSelectedActivity] = useState<LoginActivity | null>(null);
    const { filters, updateFilters } = usePaginationIndexFilters({
        route: index.url(),
        defaults: { page: 1, search: '', event: '', limit: 10 },
    });

    const columns = columnHelper.columns([
        columnHelper.accessor('date', {
            header: 'Date & Time',
            size: 160,
            cell: ({ row }) => <span className="whitespace-nowrap">{row.original.date ?? '—'}</span>,
        }),
        columnHelper.accessor('user', { header: 'User', size: 160 }),
        columnHelper.accessor('username', { header: 'Username', size: 140 }),
        columnHelper.accessor('event', {
            header: 'Activity',
            size: 160,
            cell: ({ row }) => <span className="font-medium">{eventLabel[row.original.event] ?? row.original.event}</span>,
        }),
        columnHelper.accessor('ip_address', { header: 'IP Address', size: 130 }),
        columnHelper.accessor('failure_reason', {
            header: 'Details',
            size: 220,
            cell: ({ row }) => <span title={row.original.failure_reason ?? ''}>{row.original.failure_reason ?? '—'}</span>,
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Actions',
            size: 80,
            cell: ({ row }) => <Button type="button" variant="outline" size="icon-sm" aria-label="View login activity details" title="View details" onClick={() => setSelectedActivity(row.original)}><IconEye className="size-4" /></Button>,
        }),
    ]);

    return (
        <div className="w-full min-w-0 max-w-full space-y-4 p-4">
            <Head title="Login Activity" />
            <Heading
                variant="small"
                title="Login Activity"
                description="Review successful logins, failed login attempts, and logouts by user."
            />
            <div className="flex flex-wrap items-center gap-3">
                <label className="text-sm font-medium" htmlFor="login-activity-event">Activity type</label>
                <select
                    id="login-activity-event"
                    className="h-9 rounded-md border bg-background px-3 text-sm"
                    value={filters.event}
                    onChange={(event) => updateFilters({ event: event.target.value, page: 1 })}
                >
                    <option value="">All activity</option>
                    <option value="login_success">Successful login</option>
                    <option value="login_failed">Failed login</option>
                    <option value="logout">Logout</option>
                </select>
            </div>
            <DataTable
                initialSearch={filters.search}
                data={activities}
                columns={columns}
                getId={(row) => row.id}
                enableRowSelection={false}
                onSearch={(value) => updateFilters({ search: value, page: 1 })}
                onPerPage={(value) => updateFilters({ limit: value, page: 1 })}
                emptyMessage="No login activity found."
                controlType="process-dtr"
            />
            <Dialog open={selectedActivity !== null} onOpenChange={(open) => !open && setSelectedActivity(null)}>
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Login Activity Details</DialogTitle>
                        <DialogDescription>Detailed information for the selected login activity record.</DialogDescription>
                    </DialogHeader>
                    {selectedActivity && <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1"><dt className="text-muted-foreground">Date &amp; Time</dt><dd className="break-words font-medium">{selectedActivity.date ?? '—'}</dd></div>
                        <div className="space-y-1"><dt className="text-muted-foreground">Activity</dt><dd className="font-medium">{eventLabel[selectedActivity.event] ?? selectedActivity.event}</dd></div>
                        <div className="space-y-1"><dt className="text-muted-foreground">User</dt><dd className="break-words font-medium">{selectedActivity.user || '—'}</dd></div>
                        <div className="space-y-1"><dt className="text-muted-foreground">Username</dt><dd className="break-words font-medium">{selectedActivity.username || '—'}</dd></div>
                        <div className="space-y-1"><dt className="text-muted-foreground">IP Address</dt><dd className="break-words font-medium">{selectedActivity.ip_address || '—'}</dd></div>
                        <div className="space-y-1"><dt className="text-muted-foreground">Session ID</dt><dd className="break-all font-medium">{selectedActivity.session_id || '—'}</dd></div>
                        <div className="space-y-1 sm:col-span-2"><dt className="text-muted-foreground">Failure Reason</dt><dd className="break-words font-medium">{selectedActivity.failure_reason || '—'}</dd></div>
                        <div className="space-y-1 sm:col-span-2"><dt className="text-muted-foreground">User Agent</dt><dd className="break-all font-medium">{selectedActivity.user_agent || '—'}</dd></div>
                    </dl>}
                </DialogContent>
            </Dialog>
        </div>
    );
}

LoginActivityPage.layout = {
    breadcrumbs: [{ title: 'Login Activity', href: '#' }],
};
