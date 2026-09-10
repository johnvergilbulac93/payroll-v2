import { Head, router } from '@inertiajs/react';
import {
    IconCalendarCheck,
    IconCurrencyPeso,
    IconUsers,
} from '@tabler/icons-react';
import { DashboardCard } from '@/components/dashboard-card';
import { dashboard } from '@/routes';
import { index as employeeIndex } from '@/routes/employee';
import { index as loanIndex } from '@/routes/loan';
import { index as periodIndex } from '@/routes/payroll_period';
import { index as userIndex } from '@/routes/user';

type Props = {
    loans: number;
    employees: number;
    users: number;
    periods: number;
};
export default function Dashboard({ loans, employees, users, periods }: Props) {
    return (
        <div className="p-4">
            <Head title="Dashboard" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
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
