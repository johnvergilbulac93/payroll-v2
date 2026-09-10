import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import SearchableSelect from '@/components/searchable-select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DailySchedule } from '@/pages/schedule_employee/daily-schedule';
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
};

export default function ScheduleEmployeePage({
    employees,
    employee,
    templates,
    shiftCodes,
    perDateSchedules,
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
                    only: ['employee', 'templates', 'perDateSchedules'],
                },
            );
        }
    };

    return (
        <div className="space-y-4 p-4">
            <Head title="Employee Schedule" />
            <Heading
                title="Employee Schedule"
                description="Assign and manage employee schedules."
            />
            <SearchableSelect
                id="loan.EmpNbr"
                items={employees}
                value={selected ?? ''}
                onValueChange={(value) => onChangeEmployee(value ?? '')}
                tabIndex={1}
            />
            <>
                {employee && (
                    <Tabs defaultValue="daily-shift" className="w-full">
                        <TabsList>
                            <TabsTrigger value="daily-shift">
                                Daily shift schedule
                            </TabsTrigger>
                            <TabsTrigger value="per-date">
                                Per date schedule
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="daily-shift">
                            <DailySchedule
                                employee={employee}
                                templates={templates ?? []}
                                shiftCodes={shiftCodes}
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
                )}
            </>
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
