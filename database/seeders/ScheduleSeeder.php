<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\EmployeeSchedule;
use App\Models\Group;
use App\Models\ShiftCode;
use Illuminate\Database\Seeder;
use Maatwebsite\Excel\Concerns\ToArray;
use Maatwebsite\Excel\Facades\Excel;
use RuntimeException;

class ScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('seeders/data/Employee Schedules.xlsx');
        $sheets = Excel::toArray(new class implements ToArray
        {
            public function array(array $array): void {}
        }, $path);
        $rows = $sheets[0] ?? [];

        if ($rows === []) {
            throw new RuntimeException('Unable to read the schedule worksheet.');
        }

        $headerIndex = null;
        foreach ($rows as $index => $row) {
            if (collect($row)->contains(static fn ($value) => trim((string) $value) !== '')) {
                $headerIndex = $index;
                break;
            }
        }

        if ($headerIndex === null) {
            throw new RuntimeException('The schedule worksheet does not contain a header row.');
        }

        $headers = array_map(static fn ($value) => trim((string) $value), $rows[$headerIndex]);
        $imported = 0;
        $missingEmployees = [];
        $groups = Group::query()->get(['id', 'name']);
        $groupIds = [
            'T' => $groups->firstWhere('name', 'Teaching')?->id,
            'N' => $groups->firstWhere('name', 'Non-Teaching')?->id,
        ];

        foreach (array_slice($rows, $headerIndex + 1, null, true) as $index => $values) {
            $record = [];
            foreach ($headers as $column => $header) {
                if ($header !== '') {
                    $record[$header] = $values[$column] ?? null;
                }
            }

            $employeeNumber = trim((string) ($record['Employee No.'] ?? ''));
            $scheduleName = trim((string) ($record['Schedule'] ?? ''));

            if ($employeeNumber === '' || $scheduleName === '') {
                continue;
            }

            $employee = Employee::query()->where('EmpNbr', $employeeNumber)->first();
            if ($employee === null) {
                $missingEmployees[] = $employeeNumber;

                continue;
            }

            $groupCode = mb_strtoupper(trim((string) ($record['N/T'] ?? '')));
            if (array_key_exists($groupCode, $groupIds)) {
                if ($groupIds[$groupCode] === null) {
                    throw new RuntimeException("Group '{$groupCode}' maps to a missing group. Run GroupSeeder before ScheduleSeeder.");
                }
                if ((int) $employee->Group !== (int) $groupIds[$groupCode]) {
                    $employee->Group = $groupIds[$groupCode];
                    $employee->save();
                }
            }

            $shiftName = $this->shiftName($scheduleName);
            $workingShiftId = ShiftCode::query()->where('Name', $shiftName)->value('id');
            if ($workingShiftId === null) {
                throw new RuntimeException('Required shift code is missing. Run ShiftSeeder before ScheduleSeeder.');
            }

            // Seed the employee's assigned shift as their default schedule.
            // Per-date schedules can override this default for specific dates.
            EmployeeSchedule::updateOrCreate(
                [
                    'EmpID' => $employee->id,
                    'ScheduleType' => 'default',
                ],
                [
                    'ShiftCodeID' => $workingShiftId,
                    'EffectiveFrom' => null,
                    'EffectiveTo' => null,
                    'Remarks' => null,
                    'IsActive' => true,
                ],
            );

            /*
            // Previous weekly-template seeding retained for reference.
            // Carbon/PHP weekday numbering: Sunday = 0, Monday = 1, ..., Saturday = 6.
            // Sunday is the only rest day; all other days use the employee's assigned shift.
            foreach ([0, 1, 2, 3, 4, 5, 6] as $dayOfWeek) {
                $shiftCodeId = $dayOfWeek === 0 ? $restDayShiftId : $workingShiftId;

                $scheduleKey = ['EmpID' => $employee->id, 'DayOfWeek' => $dayOfWeek];
                $scheduleValues = [
                    'ShiftCodeID' => $shiftCodeId,
                    'EffectiveFrom' => null,
                    'EffectiveTo' => null,
                    'IsActive' => true,
                    'updated_at' => now(),
                ];

                $existingSchedule = DB::table('employee_schedule_templates')->where($scheduleKey)->exists();
                if ($existingSchedule) {
                    DB::table('employee_schedule_templates')->where($scheduleKey)->update($scheduleValues);
                } else {
                    DB::table('employee_schedule_templates')->insert($scheduleKey + $scheduleValues + ['created_at' => now()]);
                }
            }
            */

            $imported++;
        }

        if ($missingEmployees !== []) {
            $this->command?->warn('Schedule rows skipped because employee numbers were not found: '.implode(', ', $missingEmployees));
        }

        $this->command?->info("Schedule templates seeded for {$imported} employees.");
    }

    private function shiftName(string $scheduleName): string
    {
        return match (mb_strtolower(preg_replace('/\s+/', ' ', trim($scheduleName)))) {
            '8:00 - 5:00', '8:00am - 5:00pm', 'regular shift (8:00am - 5:00pm)' => 'Regular Shift (8:00am - 5:00pm)',
            '7:20 - 4:30', '7:20am - 4:30pm' => 'Regular Shift (7:20am - 4:30pm)',
            '7:25 - 4:30', '7:25am - 4:30pm' => 'Regular Shift (7:25am - 4:30pm)',
            '7:00 - 4:00', '7:00am - 4:00pm' => 'Regular Shift (7:00am - 4:00pm)',
            default => throw new RuntimeException("Unknown schedule '{$scheduleName}' in Employee Schedules.xlsx."),
        };
    }
}
