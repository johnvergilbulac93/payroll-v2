<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\ShiftCode;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use SimpleXMLElement;
use ZipArchive;

class ScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('seeders/data/Employee Schedules.xlsx');
        $zip = new ZipArchive;

        if ($zip->open($path) !== true) {
            throw new RuntimeException("Unable to open schedule workbook: {$path}");
        }

        try {
            $strings = $this->sharedStrings($zip);
            $xml = $zip->getFromName('xl/worksheets/sheet1.xml');
            $sheet = $xml === false ? false : simplexml_load_string($xml);

            if (! $sheet instanceof SimpleXMLElement) {
                throw new RuntimeException('Unable to read the schedule worksheet.');
            }

            $sheet->registerXPathNamespace('x', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main');
            $headers = [];
            $headerRow = null;
            $imported = 0;
            $missingEmployees = [];

            foreach ($sheet->xpath('//x:sheetData/x:row') ?: [] as $row) {
                $rowNumber = (int) $row['r'];
                $values = $this->rowValues($row, $strings);

                if ($headers === []) {
                    foreach ($values as $column => $value) {
                        if (trim((string) $value) !== '') {
                            $headers[$column] = trim((string) $value);
                        }
                    }
                    $headerRow = $rowNumber;
                    continue;
                }

                if ($rowNumber <= $headerRow) {
                    continue;
                }

                $record = [];
                foreach ($headers as $column => $header) {
                    $record[$header] = $values[$column] ?? null;
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

                $shiftName = $this->shiftName($scheduleName);
                $workingShiftId = ShiftCode::query()->where('Name', $shiftName)->value('id');
                $restDayShiftId = ShiftCode::query()->where('Name', 'Rest Day')->value('id');

                if ($workingShiftId === null || $restDayShiftId === null) {
                    throw new RuntimeException('Required shift codes are missing. Run ShiftSeeder before ScheduleSeeder.');
                }

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

                $imported++;
            }

            if ($missingEmployees !== []) {
                $this->command?->warn('Schedule rows skipped because employee numbers were not found: '.implode(', ', $missingEmployees));
            }

            $this->command?->info("Schedule templates seeded for {$imported} employees.");
        } finally {
            $zip->close();
        }
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

    private function sharedStrings(ZipArchive $zip): array
    {
        $xml = $zip->getFromName('xl/sharedStrings.xml');
        if ($xml === false) {
            return [];
        }

        $root = simplexml_load_string($xml);
        if (! $root instanceof SimpleXMLElement) {
            return [];
        }

        $root->registerXPathNamespace('x', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main');
        $result = [];
        foreach ($root->xpath('//x:si') ?: [] as $item) {
            $item->registerXPathNamespace('x', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main');
            $value = '';
            foreach ($item->xpath('.//x:t') ?: [] as $part) {
                $value .= (string) $part;
            }
            $result[] = $value;
        }

        return $result;
    }

    private function rowValues(SimpleXMLElement $row, array $strings): array
    {
        $row->registerXPathNamespace('x', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main');
        $result = [];

        foreach ($row->xpath('./x:c') ?: [] as $cell) {
            preg_match('/^[A-Z]+/', (string) $cell['r'], $match);
            $column = $match[0] ?? '';
            $value = isset($cell->v) ? (string) $cell->v : null;

            if ((string) $cell['t'] === 's' && $value !== null) {
                $value = $strings[(int) $value] ?? null;
            } elseif ((string) $cell['t'] === 'inlineStr') {
                $value = (string) ($cell->is->t ?? '');
            }

            if ($column !== '') {
                $result[$column] = $value;
            }
        }

        return $result;
    }
}
