import type { InertiaLinkProps } from '@inertiajs/react';
import {
    IconArchive,
    IconCalendar,
    IconCalendarClock,
    IconCalendarDollar,
    IconCalendarPlus,
    IconCalendarUser,
    IconCircleMinus,
    IconCirclePlus,
    IconClipboardList,
    IconFileUpload,
    IconHome,
    IconLockCheck,
    IconRefresh,
    IconReport,
    IconUser,
    IconUserKey,
    IconUsers,
} from '@tabler/icons-react';
import type { LucideIcon } from 'lucide-react';
import type { ComponentType } from 'react';
import { index as accessControlIndex } from '@/routes/access_control';
import { index as cutoffDateIndex } from '@/routes/cutoff';
import { index as processDtrIndex } from '@/routes/dtr';
import { index as employeeIndex } from '@/routes/employee';
import { index as employeeScheduleIndex } from '@/routes/employee_schedule';
import { index as loanIndex } from '@/routes/loan';
import { index as payrollPeriodIndex } from '@/routes/payroll_period';
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
        Items: [{ Label: 'Dashboard', Url: '#', Icon: IconHome }],
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
                Permission: 'shift-code-view',
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
                Permission: 'cutoff-scheme-view',
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
            // {
            //     Label: 'Archives',
            //     Url: '#',
            //     Icon: IconArchive,
            //     Permission: 'archives-view',
            // },
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
