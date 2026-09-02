import { Head, useForm } from '@inertiajs/react';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import Heading from '@/components/heading';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

import { cn } from '@/lib/utils';
import type { Employee } from '@/types/employee';
import type { ScheduleTemplate } from '@/types/schedule-template';
import { DAYS_OF_WEEK } from '@/types/schedule-template';

import type { ShiftCode } from '@/types/shift-code';
import { Button } from '@/components/ui/button';

type Props = {
    employee: Employee;
    templates: ScheduleTemplate[];
    shiftCodes: ShiftCode[];
};

const DAY_LABEL_MAP: Record<number, string> = Object.fromEntries(
    DAYS_OF_WEEK.map((day) => [day.value, day.label]),
);

export default function EmployeeSchedule({
    employee,
    templates,
    shiftCodes,
}: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [title, setTitle] = useState('');

    const empId = Number(employee?.id);

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            id: 0,
            EmpID: 0,
            DayOfWeek: 0,
            ShiftCodeID: '',
            EffectiveFrom: '',
            EffectiveTo: '',
        });
    const templateGrid = useMemo(() => {
        const grid: Record<number, Record<number, ScheduleTemplate>> = {};
        const today = new Date().toISOString().slice(0, 10);

        for (const t of templates) {
            const isActive = t.EffectiveTo === null || t.EffectiveTo >= today;

            if (!isActive) {
                continue;
            }

            grid[t.EmpID] ??= {};
            grid[t.EmpID][t.DayOfWeek] = t;
        }

        return grid;
    }, [templates]);

    const openCell = (employeeId: number, dayOfWeek: number) => {
        const existing = templateGrid[employeeId]?.[dayOfWeek] ?? null;

        if (existing) {
            setData('id', existing.id);
            setData('EmpID', employeeId);
            setData('DayOfWeek', dayOfWeek);
            setShowConfirmDialog(true);
        } else {
            clearErrors();
            reset();
            setData('EmpID', employeeId);
            setData('DayOfWeek', dayOfWeek);
            setTitle(`Assign shift - ${DAY_LABEL_MAP[dayOfWeek]}`);
            setDialogOpen(true);
        }
    };

    return (
        <div className="p-4">
            <Head title="Employee Schedule" />
            <Heading
                title={employee.FullName ?? 'Employee Schedule'}
                description="Manage selected employee schedules"
            />
            <div className="space-y-4">
                <div className="overflow-hidden rounded-lg border">
                    <Table>
                        <TableHeader className="sticky top-0 z-10 bg-muted">
                            <TableRow>
                                {DAYS_OF_WEEK.map((day) => (
                                    <TableHead
                                        key={day.value}
                                        className="w-27.5 text-center"
                                    >
                                        {day.label}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody className="**:data-[slot=table-cell]:first:w-8">
                            <TableRow>
                                {DAYS_OF_WEEK.map((day) => {
                                    const cell =
                                        templateGrid[empId]?.[day.value];

                                    return (
                                        <TableCell
                                            key={day.value}
                                            className="p-2 text-center"
                                        >
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            'group flex h-20 w-full items-center justify-center rounded-md border',
                                                            cell
                                                                ? cell
                                                                      .shift_code
                                                                      ?.IsWorkingDay
                                                                    ? 'border-transparent bg-primary/90 text-primary-foreground hover:bg-primary'
                                                                    : 'border-transparent bg-secondary text-foreground'
                                                                : 'border-dashed hover:border-border hover:bg-muted/50',
                                                        )}
                                                        onClick={() =>
                                                            openCell(
                                                                empId,
                                                                day.value,
                                                            )
                                                        }
                                                    >
                                                        {cell ? (
                                                            <IconTrash className="h-4 w-4" />
                                                        ) : (
                                                            <IconPlus className="h-4 w-4 text-muted-foreground" />
                                                        )}
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    {cell?.shift_code?.Name ??
                                                        'Not set'}
                                                </TooltipContent>
                                            </Tooltip>
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>

        </div>
    );
}
EmployeeSchedule.layout = {
    breadcrumbs: [
        {
            title: 'Employee Schedule',
            href: '#',
        },
    ],
};
