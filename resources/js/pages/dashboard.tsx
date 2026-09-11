import { Head, router } from '@inertiajs/react';
import {
    IconCalendarCheck,
    IconCircleCheck,
    IconCirclePlus,
    IconEdit,
    IconHistory,
    IconTrash,
    IconCurrencyPeso,
    IconUsers,
} from '@tabler/icons-react';
import { useState } from 'react';
import { BarChart } from '@/components/bar-chart';
import { DashboardCard } from '@/components/dashboard-card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { dashboard } from '@/routes';
import { index as employeeIndex } from '@/routes/employee';
import { index as loanIndex } from '@/routes/loan';
import { index as periodIndex } from '@/routes/payroll_period';
import { index as userIndex } from '@/routes/user';

type ActivityValue = Record<string, unknown> | string | null;

type RecentActivity = {
    id: number;
    event: string | null;
    description: string;
    subject: string | null;
    subject_id: number | string | null;
    causer: string;
    created_at: string | null;
    changes: ActivityValue;
    properties: ActivityValue;
};

type Props = {
    loans: number;
    employees: number;
    users: number;
    periods: number;
    payrollOverview: { month: string; payroll: number }[];
    recentActivities: RecentActivity[];
};
function ActivityIcon({ event }: { event: string | null }) {
    if (event === 'created') {
return <IconCirclePlus size={18} />;
}

    if (event === 'updated') {
return <IconEdit size={18} />;
}

    if (event === 'deleted' || event === 'forceDeleted') {
return <IconTrash size={18} />;
}

    if (event === 'restored') {
return <IconCircleCheck size={18} />;
}

    return <IconHistory size={18} />;
}

export default function Dashboard({
    loans,
    employees,
    users,
    periods,
    payrollOverview,
    recentActivities,
}: Props) {
    const [selectedActivity, setSelectedActivity] =
        useState<RecentActivity | null>(null);

    const formatValue = (value: unknown) => {
        if (value === null || value === undefined || value === '') {
            return '—';
        }

        if (typeof value === 'object') {
            return JSON.stringify(value, null, 2);
        }

        return String(value);
    };

    return (
        <div className="p-3 sm:p-4">
            <Head title="Dashboard" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
                <DashboardCard
                    icon={IconUsers}
                    label="Employees"
                    value={employees}
                    onClick={() => router.visit(employeeIndex.url())}
                />
                <DashboardCard
                    icon={IconCurrencyPeso}
                    label="Active Loan"
                    value={loans}
                    onClick={() => router.visit(loanIndex.url())}
                />
                <DashboardCard
                    icon={IconCalendarCheck}
                    label="Active Period"
                    value={periods}
                    onClick={() => router.visit(periodIndex.url())}
                />
                <DashboardCard
                    icon={IconUsers}
                    label="Active User"
                    value={users}
                    onClick={() => router.visit(userIndex.url())}
                />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-5">
                <div className="rounded-xl border bg-card p-4 shadow-sm sm:p-6 xl:col-span-3">
                    <div className="mb-16">
                        <h2 className="text-base font-semibold">
                            Payroll Overview
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Payroll records for the current year.
                        </p>
                    </div>
                        <BarChart
                            data={payrollOverview}
                            dataKey="payroll"
                            categoryKey="month"
                            label="Payroll"
                        />
                </div>

                <div className="rounded-xl border bg-card shadow-sm xl:col-span-2">
                    <div className="border-b p-4 sm:p-6">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-base font-semibold">
                                    Recent Activity
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Latest system activity.
                                </p>
                            </div>
                            <IconHistory className="size-5 text-muted-foreground" />
                        </div>
                    </div>

                    <div className="max-h-100 divide-y overflow-y-auto overscroll-contain">
                        {recentActivities.length > 0 ? (
                            recentActivities.map((activity) => (
                                <button
                                    key={activity.id}
                                    type="button"
                                    onClick={() =>
                                        setSelectedActivity(activity)
                                    }
                                    className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted/50"
                                >
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <ActivityIcon event={activity.event} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium">
                                            {activity.causer}{' '}
                                            <span className="font-normal text-muted-foreground">
                                                {activity.event ??
                                                    activity.description}
                                            </span>{' '}
                                            {activity.subject && (
                                                <span>{activity.subject}</span>
                                            )}
                                        </p>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            {activity.created_at ?? 'Just now'}
                                        </p>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="p-6 text-center text-sm text-muted-foreground">
                                No recent activity.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Dialog
                open={selectedActivity !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedActivity(null);
                    }
                }}
            >
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
                    {selectedActivity && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Activity Details</DialogTitle>
                                <DialogDescription>
                                    Exact details recorded for this activity.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 text-sm">
                                <div className="grid grid-cols-2 gap-4 rounded-lg border p-4 sm:grid-cols-4">
                                    <div>
                                        <p className="text-muted-foreground">
                                            User
                                        </p>
                                        <p className="font-medium">
                                            {selectedActivity.causer}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">
                                            Action
                                        </p>
                                        <p className="font-medium">
                                            {selectedActivity.event ?? '—'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">
                                            Record
                                        </p>
                                        <p className="font-medium">
                                            {selectedActivity.subject ?? '—'}
                                            {selectedActivity.subject_id !==
                                            null
                                                ? ` #${selectedActivity.subject_id}`
                                                : ''}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">
                                            When
                                        </p>
                                        <p className="font-medium">
                                            {selectedActivity.created_at ?? '—'}
                                        </p>
                                    </div>
                                </div>

                                {selectedActivity.changes && (
                                    <div>
                                        <h3 className="mb-2 font-medium">
                                            Changes
                                        </h3>
                                        <pre className="max-h-64 overflow-auto rounded-lg border bg-muted/40 p-4 text-xs whitespace-pre-wrap">
                                            {formatValue(
                                                selectedActivity.changes,
                                            )}
                                        </pre>
                                    </div>
                                )}

                                {selectedActivity.properties && (
                                    <div>
                                        <h3 className="mb-2 font-medium">
                                            Properties
                                        </h3>
                                        <pre className="max-h-64 overflow-auto rounded-lg border bg-muted/40 p-4 text-xs whitespace-pre-wrap">
                                            {formatValue(
                                                selectedActivity.properties,
                                            )}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
