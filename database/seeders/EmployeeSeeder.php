<?php

namespace Database\Seeders;

use App\Models\AreaAssignment;
use App\Models\Employee;
use App\Models\EmployeePosition;
use App\Models\Group;
use App\Models\ScheduleTemplate;
use App\Models\ShiftCode;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class EmployeeSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's employees.
     */
    public function run(): void
    {
        $teaching = Group::where('name', 'Teaching')->firstOrFail();
        $nonTeaching = Group::where('name', 'Non-Teaching')->firstOrFail();

        $employees = [
            [
                'BiometricID' => '64',
                'FirstName' => 'Vergel',
                'MidName' => 'Velasco',
                'LastName' => 'Abalos',
                'Suffix' => null,
                'Position' => 'SAC',
                'Assignment' => 'TLE-JHS',
            ],
            [
                'BiometricID' => '120',
                'FirstName' => 'Jamilah',
                'MidName' => 'Guballo',
                'LastName' => 'Bello',
                'Suffix' => null,
                'Position' => 'Teacher',
                'Assignment' => 'MAPEH',
            ],
            [
                'BiometricID' => '134',
                'FirstName' => 'Ernesto',
                'MidName' => 'Ramos',
                'LastName' => 'Montemor',
                'Suffix' => 'III',
                'Position' => 'Teacher',
                'Assignment' => 'Mathematics',
            ],
            [
                'BiometricID' => '174',
                'FirstName' => 'Catherine',
                'MidName' => 'Pama',
                'LastName' => 'Soriano',
                'Suffix' => null,
                'Position' => 'Teacher',
                'Assignment' => 'Araling Panlipunan',
            ],
            [
                'BiometricID' => '188',
                'FirstName' => 'Jhudiel Valerie',
                'MidName' => 'Salvador',
                'LastName' => 'Fabro',
                'Suffix' => null,
                'Position' => 'Teacher',
                'Assignment' => 'Science',
            ],
            [
                'BiometricID' => '96',
                'FirstName' => 'Ruperto',
                'MidName' => 'Arguelles',
                'LastName' => 'Agustin',
                'Suffix' => 'Jr',
                'Position' => 'Carpenter',
                'Assignment' => 'Carpentry',
                'Group' => 'Non-Teaching',
            ],
            [
                'BiometricID' => '17',
                'FirstName' => 'Romalyn',
                'MidName' => 'Gabelo',
                'LastName' => 'Mesa',
                'Suffix' => null,
                'Position' => 'Cook',
                'Assignment' => 'Small Kitchen',
                'Group' => 'Non-Teaching',
            ],
            [
                'BiometricID' => '9',
                'FirstName' => 'Marvin',
                'MidName' => 'Erolyn',
                'LastName' => 'Marabillon',
                'Suffix' => null,
                'Position' => 'Maintenance Staff',
                'Assignment' => 'Maintenance',
                'Group' => 'Non-Teaching',
            ],
            [
                'BiometricID' => '154',
                'FirstName' => 'Aljun',
                'MidName' => 'Bersamina',
                'LastName' => 'Evangelista',
                'Suffix' => null,
                'Position' => 'Baker',
                'Assignment' => 'Bakery',
                'Group' => 'Non-Teaching',
            ],
            [
                'BiometricID' => '20',
                'FirstName' => 'Rosemarie',
                'MidName' => 'Casurao',
                'LastName' => 'Rosagaso',
                'Suffix' => null,
                'Position' => 'Laundry Staff',
                'Assignment' => 'Laundry',
                'Group' => 'Non-Teaching',
            ],
        ];

        $mondayShift = ShiftCode::where('Name', 'Regular Shift (7:20am - 4:30pm)')->firstOrFail();
        $weekdayShift = ShiftCode::where('Name', 'Regular Shift (7:25am - 4:30pm)')->firstOrFail();
        $eightToFiveShift = ShiftCode::where('Name', 'Regular Shift (8:00am - 5:00pm)')->firstOrFail();
        $sevenToFourShift = ShiftCode::where('Name', 'Regular Shift (7:00am - 4:00pm)')->firstOrFail();
        $restDayShift = ShiftCode::where('Name', 'Rest Day')->firstOrFail();

        foreach ($employees as $data) {
            $group = ($data['Group'] ?? 'Teaching') === 'Non-Teaching'
                ? $nonTeaching
                : $teaching;

            $position = EmployeePosition::where('name', $data['Position'])
                ->where('type', $group->id)
                ->firstOrFail();

            $assignment = AreaAssignment::where('name', $data['Assignment'])
                ->where('type', $group->id)
                ->firstOrFail();

            $employee = Employee::updateOrCreate(
                ['BiometricID' => $data['BiometricID']],
                [
                    'EmpNbr' => $data['BiometricID'],
                    'Group' => $group->id,
                    'FirstName' => $data['FirstName'],
                    'MidName' => $data['MidName'],
                    'LastName' => $data['LastName'],
                    'Suffix' => $data['Suffix'],
                    'FullName' => collect([
                        $data['FirstName'],
                        $data['MidName'] ? mb_strtoupper(mb_substr($data['MidName'], 0, 1)) . '.' : null,
                        $data['LastName'],
                        $data['Suffix'] ? rtrim($data['Suffix'], '.') : null,
                    ])->filter()->implode(' '),
                    'Position' => $position->id,
                    'Assignment' => $assignment->id,
                    'Status' => true,
                ],
            );

            // Teaching: Monday = 7:20 AM - 4:30 PM; Tuesday-Friday = 7:25 AM - 4:30 PM.
            // Non-Teaching: Monday-Friday = employee-specific regular shift.
            foreach (range(1, 5) as $dayOfWeek) {
                $shiftCodeId = match ($data['BiometricID']) {
                    '96', '17', '9', '154' => $eightToFiveShift->id,
                    '20' => $sevenToFourShift->id,
                    default => $dayOfWeek === 1 ? $mondayShift->id : $weekdayShift->id,
                };

                ScheduleTemplate::updateOrCreate(
                    [
                        'EmpID' => $employee->id,
                        'DayOfWeek' => $dayOfWeek,
                    ],
                    [
                        'ShiftCodeID' => $shiftCodeId,
                        'EffectiveFrom' => null,
                        'EffectiveTo' => null,
                    ],
                );
            }

            // Saturday = 6 and Sunday = 0: explicit Rest Day for every employee.
            foreach ([6, 0] as $dayOfWeek) {
                ScheduleTemplate::updateOrCreate(
                    [
                        'EmpID' => $employee->id,
                        'DayOfWeek' => $dayOfWeek,
                    ],
                    [
                        'ShiftCodeID' => $restDayShift->id,
                        'EffectiveFrom' => null,
                        'EffectiveTo' => null,
                    ],
                );
            }
        }
    }
}
