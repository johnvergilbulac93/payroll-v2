import { Head, router } from '@inertiajs/react';
import { IconCalendarClock, IconCalendarEvent, IconUserCheck } from '@tabler/icons-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import SearchableSelect from '@/components/searchable-select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { DailySchedule } from '@/pages/schedule_employee/daily-schedule';
import { DefaultSchedule } from '@/pages/schedule_employee/default-schedule';
import { PerDateSchedule } from '@/pages/schedule_employee/per-date-schedule';
import { index } from '@/routes/employee_schedule';
import type { Employee } from '@/types/employee';
import type { Option } from '@/types/option';
import type { SchedulePerDate } from '@/types/per-date-schedule';
import type { ScheduleTemplate, ShiftCode } from '@/types/schedule-template';

type Props = {
    employees: Option[];
    employee?: Employee;
    templates?: ScheduleTemplate[];
    shiftCodes: ShiftCode[];
    perDateSchedules: SchedulePerDate[];
    defaultSchedule?: SchedulePerDate | null;
};

export default function ScheduleEmployeePage({
    employees,
    employee,
    templates,
    shiftCodes,
    perDateSchedules,
    defaultSchedule,
}: Props) {


    const [selected, setSelected] = useState<string | null>(
        employee ? String(employee.id) : null,
    );

    const onChangeEmployee = (value: string) => {
        if (value) {
            setSelected(value);
            router.get(
                index.url(),
                { emp_id: value },
                {
                    preserveState: true,
                    preserveScroll: true,
                    only: ['employee', 'templates', 'perDateSchedules', 'defaultSchedule'],
                },
            );
        }
    };

    const scheduleCount = perDateSchedules?.length ?? 0;

    return (
        <div className="space-y-6 p-4 md:p-6">
            <Head title="Employee Schedule" />
            <Heading
                title="Employee Schedule"
                description="Manage an employee’s regular shift and date-specific exceptions in one place."
            />

            <section className="rounded-xl border bg-sidebar p-4 shadow-sm md:p-5">
                <div className="mb-3 flex items-center gap-2">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <IconUserCheck className="size-5" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold">Select employee</h2>
                        <p className="text-xs text-muted-foreground">Choose who you want to manage schedules for.</p>
                    </div>
                </div>
                <SearchableSelect
                    id="schedule.employee"
                    items={employees}
                    value={selected ?? ''}
                    onValueChange={(value) => onChangeEmployee(value ?? '')}
                    tabIndex={1}
                />
                {!employee && (
                    <div className="mt-4 flex items-start gap-3 rounded-lg border border-dashed bg-muted/20 p-4">
                        <IconCalendarEvent className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">Choose an employee to get started</p>
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">You’ll be able to set their default shift and add exceptions for specific dates. Date-specific schedules take priority over the default.</p>
                        </div>
                    </div>
                )}
            </section>

            {employee && (
                <>
                    <section className="flex flex-col gap-3 rounded-xl border bg-sidebar p-4 sm:flex-row sm:items-center sm:justify-between md:p-5">
                        <div className="min-w-0">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Currently managing</p>
                            <h2 className="mt-1 truncate text-lg font-semibold">{employee.FullName}</h2>
                            <p className="mt-1 text-sm text-muted-foreground">Employee #{employee.EmpNbr}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs font-medium">
                                <IconCalendarClock className="size-4 text-primary" /> Default shift
                            </span>
                            <span className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs font-medium">
                                <IconCalendarEvent className="size-4 text-primary" /> {scheduleCount} date {scheduleCount === 1 ? 'exception' : 'exceptions'}
                            </span>
                        </div>
                    </section>

                    <Tabs
                        defaultValue={
                            new URLSearchParams(window.location.search).get(
                                'tab',
                            ) === 'per-date'
                                ? 'per-date'
                                : 'default'
                        }
                        className="w-full"
                    >
                        <TabsList className='bg-sidebar w-full'>
                            <TabsTrigger value="default">
                                Default schedule
                            </TabsTrigger>
                            <TabsTrigger value="per-date">
                                Per date schedule
                            </TabsTrigger>
                        </TabsList>
                        {/* Keep the previous daily-shift schedule UI for future use.
                        <TabsContent value="daily-shift">
                            <DailySchedule
                                employee={employee}
                                templates={templates ?? []}
                                shiftCodes={shiftCodes}
                            />
                        </TabsContent>
                        */}
                        <TabsContent value="default">
                            <DefaultSchedule
                                key={employee.id}
                                empID={employee.id}
                                shiftCodes={shiftCodes}
                                defaultSchedule={defaultSchedule}
                            />
                        </TabsContent>
                        <TabsContent value="per-date">
                            <PerDateSchedule
                                key={employee.id}
                                shiftCodes={shiftCodes}
                                empID={employee.id}
                                perDateSchedules={perDateSchedules ?? []}
                            />
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </div>
    );
}
ScheduleEmployeePage.layout = {
    breadcrumbs: [
        {
            title: 'Employee Schedule',
            href: '#',
        },
    ],
};
