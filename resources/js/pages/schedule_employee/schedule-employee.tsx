import { Head, router } from '@inertiajs/react';
import ComboBox from '@/components/combo-box';
import Heading from '@/components/heading';
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
    const selectedEmployee: Option | null = employee
        ? { value: String(employee.id), label: employee.FullName }
        : null;

    const onChange = (value: Option | null) => {
        if (value) {
            router.get(
                index.url(),
                { emp_id: value.value },
                {
                    preserveState: true,
                    preserveScroll: true,
                    only: ['employee', 'templates', 'perDateSchedules'],
                },
            );
        }
    };

    return (
        <div className="p-4">
            <Head title="Employee Schedule" />
            <Heading
                title="Employee Schedule"
                description="Assign and manage employee schedules."
            />
            <div className="space-y-4">
                <ComboBox
                    items={employees}
                    value={selectedEmployee}
                    onValueChange={onChange}
                    resultEmpty="No employee found."
                    placeholder="Select a employee"
                />
            </div>
            <div>
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
            </div>
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
