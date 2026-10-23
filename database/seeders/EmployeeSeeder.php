<?php

namespace Database\Seeders;

use App\Enums\EmploymentStatus;
use App\Enums\TenuredStatus;
use App\Models\AreaAssignment;
use App\Models\Employee;
use App\Models\EmployeePosition;
use App\Models\Group;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\ToArray;
use Maatwebsite\Excel\Facades\Excel;
use RuntimeException;

class EmployeeSeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('seeders/data/Employee Master for Upload.xlsx');
        $sheets = Excel::toArray(new class implements ToArray
        {
            public function array(array $array): void {}
        }, $path);
        $rows = $sheets[0] ?? [];

        if (! isset($rows[1])) {
            throw new RuntimeException('Unable to read the employee worksheet or find headers on row 2.');
        }

        $headers = array_map(static fn ($value) => trim((string) $value), $rows[1]);
        $lastGroup = null;

        foreach (array_slice($rows, 2, null, true) as $index => $values) {
            $record = [];
            foreach ($headers as $column => $header) {
                if ($header !== '') {
                    $record[$header] = $values[$column] ?? null;
                }
            }

            $employeeNumber = $this->text($record['Employee No.'] ?? null);
            $groupValue = $this->text($record['N/T'] ?? null);
            if ($groupValue !== null) {
                $lastGroup = $groupValue;
            } elseif ($lastGroup !== null) {
                // Some rows leave N/T blank; carry down the last explicit group value.
                $record['N/T'] = $lastGroup;
            } else {
                throw new RuntimeException('Employee '.$employeeNumber.' has no N/T group value and no preceding group to inherit (worksheet row '.($index + 1).').');
            }

            $this->importEmployee($record, $employeeNumber);
        }
    }

    private function importEmployee(array $record, ?string $employeeNumber): void
    {
        DB::transaction(function () use ($record, $employeeNumber): void {
            $group = Group::query()->firstOrCreate(['name' => $this->groupName($record['N/T'] ?? null)]);
            $positionName = $this->text($record['Position'] ?? null) ?? 'Unassigned';
            $position = EmployeePosition::query()
                ->where('name', $positionName)
                ->where('type', $group->id)
                ->first();
            if ($position === null) {
                $position = new EmployeePosition;
                $position->forceFill(['name' => $positionName, 'type' => $group->id])->save();
            }

            $assignmentName = $this->text($record['Assignment'] ?? null) ?? 'Unassigned';
            $assignment = AreaAssignment::query()->firstOrCreate([
                'name' => $assignmentName,
                'type' => $group->id,
            ]);
            $employeeQuery = Employee::query()->withTrashed();
            if ($employeeNumber !== null) {
                $employee = $employeeQuery->firstOrNew(['EmpNbr' => $employeeNumber]);
            } else {
                $employee = $employeeQuery
                    ->whereNull('EmpNbr')
                    ->where('FirstName', $this->nameCase($record['First Name'] ?? null))
                    ->where('MidName', $this->nameCase($record['Middle Name'] ?? null))
                    ->where('LastName', $this->nameCase($record['Last Name'] ?? null))
                    ->first() ?? new Employee;
            }
            $employee->fill([
                'Group' => $group->id,
                'FirstName' => $this->nameCase($record['First Name'] ?? null),
                'MidName' => $this->nameCase($record['Middle Name'] ?? null),
                'LastName' => $this->nameCase($record['Last Name'] ?? null),
                'FullName' => $this->fullName(
                    $record['First Name'] ?? null,
                    $record['Middle Name'] ?? null,
                    $record['Last Name'] ?? null,
                    $record['Jr./Sr./II/etc.'] ?? null,
                ),
                'Suffix' => $this->text($record['Jr./Sr./II/etc.'] ?? null),
                'Address' => $this->text($record['Address'] ?? null),
                'CityProv' => $this->text($record['City/Provice'] ?? null),
                'BirthDate' => $this->date($record['Date of Birth'] ?? null),
                'EmployDate' => $this->date($record['Employment Date'] ?? null),
                'RegularDate' => $this->date($record['Regularization Date'] ?? null),
                'Position' => $position->id,
                'Assignment' => $assignment->id,
                'SalaryGrade' => $this->text($record['Salary Grade'] ?? null),
                'BasicPay' => $this->number($record['Basic Pay'] ?? null),
                'DailyRate' => $this->number($record['Daily Rate'] ?? null),
                'HourlyRate' => $this->number($record['Hourly Rate'] ?? null),
                'MaritalStatus' => $this->text($record['Status'] ?? null),
                'Status' => $this->date($record['Resignation Date'] ?? null) === null,
                'SSSNbr' => $this->text($record['SSS No.'] ?? null),
                'PHICNbr' => $this->text($record['PHIC No.'] ?? null),
                'HDMFNbr' => $this->text($record['HDMF No.'] ?? null),
                'TIN' => $this->text($record['TIN'] ?? null),
                'Degree' => $this->text($record['Degree'] ?? null),
                'AllowReg' => $this->number($record['Allowance Regular'] ?? null),
                'ResignDate' => $this->date($record['Resignation Date'] ?? null),
                'BPIATM' => $this->text($record['BPI ATM Acct No.'] ?? null),
                'BPIEmpCode' => $this->text($record['BPI Employee Code'] ?? null),
                'PIN' => $this->text($record['PIN'] ?? null),
                'PERAAID' => $this->text($record['PERAA ID'] ?? null),
                'BiometricID' => $this->text($record['Biometrics ID'] ?? null),
                'EmploymentStatus' => $this->employmentStatus($record['Employment Status'] ?? null),
                'TenureStatus' => $this->tenureStatus($record['Tenure Status'] ?? null),
                'IsLETPasser' => $this->boolean($record['LET Passer'] ?? null, false),
                'DailyRateDivisor' => $this->number($record['Daily Rate Divisor'] ?? null) ?? 365,
            ]);
            $employee->save();

            if ($employee->trashed()) {
                $employee->restore();
            }
        });
    }

    private function groupName(mixed $value): string
    {
        return match (mb_strtolower(trim((string) $value))) {
            't', 'teaching' => 'Teaching',
            'n', 'nt', 'n/t', 'non-teaching', 'non teaching' => 'Non-Teaching',
            default => throw new RuntimeException('Unknown employee group: '.(string) $value),
        };
    }

    private function text(mixed $value): ?string
    {
        $value = trim((string) ($value ?? ''));

        return $value === '' ? null : $value;
    }

    private function fullName(mixed $firstName, mixed $middleName, mixed $lastName, mixed $suffix): ?string
    {
        $firstName = $this->nameCase($firstName);
        $middleName = $this->nameCase($middleName);
        $lastName = $this->nameCase($lastName);
        $suffix = $this->text($suffix);
        $middleInitial = $middleName !== null ? mb_strtoupper(mb_substr($middleName, 0, 1)).'.' : null;
        $fullName = collect([$firstName, $middleInitial, $lastName, $suffix])->filter()->implode(' ');

        return $fullName !== '' ? $fullName : null;
    }

    private function nameCase(mixed $value): ?string
    {
        $value = $this->text($value);
        if ($value === null) {
            return null;
        }

        return mb_convert_case(mb_strtolower($value), MB_CASE_TITLE, 'UTF-8');
    }

    private function number(mixed $value): ?float
    {
        $value = $this->text($value);

        return $value !== null && is_numeric(str_replace(',', '', $value)) ? (float) str_replace(',', '', $value) : null;
    }

    private function boolean(mixed $value, bool $default): bool
    {
        return match (mb_strtolower(trim((string) ($value ?? '')))) {
            '1', 'true', 'yes', 'y', 'active', 'passed', 'let' => true,
            '0', 'false', 'no', 'n', 'inactive', 'non-let', 'failed' => false,
            default => $default,
        };
    }

    private function date(mixed $value): ?string
    {
        if ($value === null || trim((string) $value) === '') {
            return null;
        }
        if (is_numeric($value)) {
            return Carbon::createFromTimestampUTC(((int) $value - 25569) * 86400)->toDateString();
        }
        foreach (['n/j/y', 'm/d/Y', 'n/j/Y', 'Y-m-d'] as $format) {
            try {
                return Carbon::createFromFormat('!'.$format, trim((string) $value))->toDateString();
            } catch (\Throwable) {
                continue;
            }
        }

        return null;
    }

    private function employmentStatus(mixed $value): ?string
    {
        return match (mb_strtolower(trim((string) $value))) {
            'regular' => EmploymentStatus::Regular->value,
            'probationary' => EmploymentStatus::Probationary->value,
            'contractual' => EmploymentStatus::Contractual->value,
            'consultant' => EmploymentStatus::Consultant->value,
            default => null,
        };
    }

    private function tenureStatus(mixed $value): ?string
    {
        return match (str_replace('-', '_', mb_strtolower(trim((string) $value)))) {
            'tenured' => TenuredStatus::Tenured->value,
            'non_tenured' => TenuredStatus::NonTenured->value,
            default => null,
        };
    }
}
