import type { InertiaLinkProps } from '@inertiajs/react';
import {
    IconCalendarClock,
    IconCalendarDollar,
    IconCalendarPlus,
    IconCalendarUser,
    IconClipboardList,
    IconFileUpload,
    IconHome,
    IconLockCheck,
    IconRefresh,
    IconReport,
    IconSettings,
    IconUser,
    IconUserKey,
    IconUsers,
} from '@tabler/icons-react';
import type { LucideIcon } from 'lucide-react';
import type { ComponentType } from 'react';
import { dashboard } from '@/routes';
import { index as accessControlIndex } from '@/routes/access_control';
import { index as cutoffDateIndex } from '@/routes/cutoff';
import { index as processDtrIndex } from '@/routes/dtr';
import { index as employeeIndex } from '@/routes/employee';
import { index as employeeScheduleIndex } from '@/routes/employee_schedule';
import { index as loanIndex } from '@/routes/loan';
import { index as loanTypeIndex } from '@/routes/maintenance/loan_type';
import { index as payrollPeriodIndex } from '@/routes/payroll_period';
import { generateDtr, generatePaySlip } from '@/routes/report';
import { index as roleIndex } from '@/routes/role';
import { index as shiftIndex } from '@/routes/shift';
import { index as uploadingIndex } from '@/routes/uploading';
import { index as userIndex } from '@/routes/user';

interface NavChild {
    Label: string;
    Url: NonNullable<InertiaLinkProps['href']>;
    Permission?: string;
}

export interface SubNavItem {
    title: string;
    tooltip?: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon;
    isActive?: boolean;
    Permission?: string;
}

export interface NavItem {
    Label: string;
    Icon: ComponentType<{ className?: string; size?: number | string }>;
    Url: NonNullable<InertiaLinkProps['href']>;
    Permission?: string;
    Children?: NavChild[];
}

export interface NavGroup {
    Label?: string; // omit for an unlabeled group like "Dashboard"
    Items: NavItem[];
}

export const navItems: NavGroup[] = [
    {
        Items: [{ Label: 'Dashboard', Url: dashboard.url(), Icon: IconHome }],
    },
    {
        Label: 'MAIN',
        Items: [
            {
                Label: 'Employee',
                Url: employeeIndex.url(),
                Icon: IconUsers,
                Permission: 'employee-view',
            },
            {
                Label: 'Loan',
                Url: loanIndex.url(),
                Icon: IconClipboardList,
                Permission: 'loan-view',
            },
            {
                Label: 'Biometric Uploading',
                Url: uploadingIndex.url(),
                Icon: IconFileUpload,
                Permission: 'biometric-uploading-view',
            },
            {
                Label: 'Process DTR',
                Url: processDtrIndex.url(),
                Icon: IconRefresh,
                Permission: 'process-dtr-view',
            },
            {
                Label: 'Payroll Periods',
                Url: payrollPeriodIndex.url(),
                Icon: IconCalendarDollar,
                Permission: 'payroll-periods-view',
            },
            {
                Label: 'Employee Shift Schedule',
                Url: employeeScheduleIndex.url(),
                Icon: IconCalendarUser,
                Permission: 'employee-shift-schedule-view',
            },
            {
                Label: 'Shift Code',
                Url: shiftIndex.url(),
                Icon: IconCalendarClock,
                Permission: 'shift-code-view',
            },
            {
                Label: 'Cutoff Dates',
                Url: cutoffDateIndex.url(),
                Icon: IconCalendarPlus,
                Permission: 'cutoff-dates-view',
            },
            // {
            //     Label: 'Reports',
            //     Url: '#',
            //     Icon: IconReport,
            //     Permission: 'reports-view',
            // },
        ],
    },
    {
        Label: 'REPORTS',
        Items: [
            {
                Label: 'Generate Payslip',
                Url: generatePaySlip.url(),
                Icon: IconReport,
                Permission: 'generate-payslip-view',
            },
            {
                Label: 'Generate Dtr',
                Url: generateDtr.url(),
                Icon: IconReport,
                Permission: 'generate-dtr-view',
            },
        ],
    },
    {
        Label: 'SETTINGS',
        Items: [
            {
                Label: 'Users',
                Url: userIndex.url(),
                Icon: IconUser,
                Permission: 'users-view',
            },
            {
                Label: 'Roles',
                Url: roleIndex.url(),
                Icon: IconUserKey,
                Permission: 'roles-view',
            },
            {
                Label: 'Access Control',
                Url: accessControlIndex.url(),
                Icon: IconLockCheck,
                Permission: 'access-control-view',
            },
            {
                Label: 'Maintenance',
                Url: loanTypeIndex.url(),
                Icon: IconSettings,
                Permission: 'maintenance-view',
            },
            // {
            //     Label: 'Deductions',
            //     Url: '#',
            //     Icon: IconCircleMinus,
            //     Permission: 'deductions-view',
            // },
            // {
            //     Label: 'Holidays',
            //     Url: '#',
            //     Icon: IconCalendar,
            //     Permission: 'holidays-view',
            // },
        ],
    },
];
