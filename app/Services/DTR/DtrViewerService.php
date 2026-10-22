<?php

namespace App\Services\DTR;

use App\Models\PayrollPeriod;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class DtrViewerService
{
    public function employees(
        PayrollPeriod $period,
        ?string $search = null,
        ?int $limit = null,
        ?int $groupId = null,
        ?string $status = null
    ) {
        $periodLabel = Carbon::parse($period->PeriodStart)->format('M j')
            . ' – ' .
            Carbon::parse($period->PeriodEnd)->format('M j, Y');

        $paginated = DB::table('employees')
            ->where('employees.Status', 1)
            ->whereNull('employees.deleted_at')
            ->when($status === 'no_entry', function ($query) use ($period) {
                $query->whereNotExists(function ($subquery) use ($period) {
                    $subquery->selectRaw('1')
                        ->from('dtr_records as status_dtr')
                        ->whereColumn('status_dtr.EmpID', 'employees.id')
                        ->whereBetween('status_dtr.DTRDate', [$period->PeriodStart, $period->PeriodEnd]);
                })->whereNotExists(function ($subquery) use ($period) {
                    $subquery->selectRaw('1')
                        ->from('biometric_logs as status_logs')
                        ->whereColumn('status_logs.employee_id', 'employees.id')
                        ->whereBetween('status_logs.punch_time', [
                            Carbon::parse($period->PeriodStart)->startOfDay(),
                            Carbon::parse($period->PeriodEnd)->endOfDay(),
                        ]);
                });
            })
            ->when($status === 'flagged', function ($query) use ($period) {
                $query->whereExists(function ($subquery) use ($period) {
                    $subquery->selectRaw('1')
                        ->from('dtr_records as status_dtr')
                        ->whereColumn('status_dtr.EmpID', 'employees.id')
                        ->whereBetween('status_dtr.DTRDate', [$period->PeriodStart, $period->PeriodEnd])
                        ->whereRaw("NULLIF(LTRIM(RTRIM(status_dtr.Remarks)), '') IS NOT NULL");
                });
            })
            ->when($status === 'processed', function ($query) use ($period) {
                $query->whereExists(function ($subquery) use ($period) {
                    $subquery->selectRaw('1')
                        ->from('dtr_records as status_dtr')
                        ->whereColumn('status_dtr.EmpID', 'employees.id')
                        ->whereBetween('status_dtr.DTRDate', [$period->PeriodStart, $period->PeriodEnd]);
                })->whereNotExists(function ($subquery) use ($period) {
                    $subquery->selectRaw('1')
                        ->from('dtr_records as status_dtr')
                        ->whereColumn('status_dtr.EmpID', 'employees.id')
                        ->whereBetween('status_dtr.DTRDate', [$period->PeriodStart, $period->PeriodEnd])
                        ->whereRaw("NULLIF(LTRIM(RTRIM(status_dtr.Remarks)), '') IS NOT NULL");
                });
            })
            ->leftJoin('groups', 'groups.id', '=', 'employees.Group')
            ->leftJoin('dtr_records', function ($join) use ($period) {
                $join->on('dtr_records.EmpID', '=', 'employees.id')
                    ->whereBetween('dtr_records.DTRDate', [
                        $period->PeriodStart,
                        $period->PeriodEnd,
                    ]);
            })
            ->when($search, function ($query) use ($search) {
                $query->where('employees.FullName', 'like', "%{$search}%");
            })
            ->when($groupId, function ($query, $groupId) {
                $query->where('employees.Group', $groupId);
            })
            ->select(
                'employees.id',
                'employees.FullName',
                'employees.Image',
                'employees.EmpNbr',
                'employees.LastName',
                'groups.name as GroupName',
                DB::raw("'" . $periodLabel . "' as period"),
                DB::raw('MAX(dtr_records.Remarks) as last_remarks'),
                DB::raw('MAX(dtr_records.updated_at) as last_processed_at'),
                DB::raw('COUNT(dtr_records.EmpID) as record_count'),
                DB::raw("SUM(CASE WHEN NULLIF(LTRIM(RTRIM(dtr_records.Remarks)), '') IS NOT NULL THEN 1 ELSE 0 END) as flagged_record_count"),
            )
            ->selectRaw("CASE
                WHEN COUNT(dtr_records.id) = 0 AND NOT EXISTS (
                    SELECT 1 FROM biometric_logs status_logs
                    WHERE status_logs.employee_id = employees.id
                        AND status_logs.punch_time BETWEEN ? AND ?
                ) THEN 'no_entry'
                WHEN SUM(CASE WHEN NULLIF(LTRIM(RTRIM(dtr_records.Remarks)), '') IS NOT NULL THEN 1 ELSE 0 END) > 0 THEN 'flagged'
                WHEN COUNT(dtr_records.id) = 0 THEN 'pending'
                ELSE 'processed'
            END as status", [
                Carbon::parse($period->PeriodStart)->startOfDay(),
                Carbon::parse($period->PeriodEnd)->endOfDay(),
            ])
            ->groupBy(
                'employees.id',
                'employees.FullName',
                'employees.Image',
                'employees.EmpNbr',
                'employees.LastName',
                'groups.name'
            )
            ->when(in_array($status, ['no_entry', 'flagged', 'pending', 'processed'], true), function ($query) use ($status, $period) {
                $query->havingRaw("CASE
                    WHEN COUNT(dtr_records.id) = 0 AND NOT EXISTS (
                        SELECT 1 FROM biometric_logs status_logs
                        WHERE status_logs.employee_id = employees.id
                            AND status_logs.punch_time BETWEEN ? AND ?
                    ) THEN 'no_entry'
                    WHEN SUM(CASE WHEN NULLIF(LTRIM(RTRIM(dtr_records.Remarks)), '') IS NOT NULL THEN 1 ELSE 0 END) > 0 THEN 'flagged'
                    WHEN COUNT(dtr_records.id) = 0 THEN 'pending'
                    ELSE 'processed'
                END = ?", [
                    Carbon::parse($period->PeriodStart)->startOfDay(),
                    Carbon::parse($period->PeriodEnd)->endOfDay(),
                    $status,
                ]);
            })
            ->orderBy('employees.LastName')
            ->paginate($limit ?: 10)
            ->onEachSide(1)
            ->withQueryString();

        return $paginated;
        // dd($paginated->toArray());
    }

    public function printingDtrEmployee(
        PayrollPeriod $period,
        int $empId,
        ?int $groupId = null,
    ): Collection {

        return DB::table('employees')
            ->where('employees.Status', 1)
            ->where('employees.id', $empId)
            ->whereNull('employees.deleted_at')
            ->leftJoin('groups', 'groups.id', '=', 'employees.Group')
            ->leftJoin('dtr_records', function ($join) use ($period) {
                $join->on('dtr_records.EmpID', '=', 'employees.id')
                    ->whereBetween('dtr_records.DTRDate', [
                        $period->PeriodStart,
                        $period->PeriodEnd,
                    ]);
            })
            // ->when($search, function ($query) use ($search) {
            //     $query->where('employees.FullName', 'like', "%{$search}%");
            // })
            ->when($groupId, function ($query, $groupId) {
                $query->where('employees.Group', $groupId);
            })
            ->select(
                'employees.id',
                'employees.FullName',
                'employees.EmpNbr',
                'employees.LastName',
                'employees.Group',
                'groups.name as GroupName',
            )
            ->groupBy(
                'employees.id',
                'employees.FullName',
                'employees.EmpNbr',
                'employees.LastName',
                'employees.Group',
                'groups.name'
            )
            ->orderBy('employees.LastName')
            ->get();
    }
    public function printingDtrAllEmployee(
        PayrollPeriod $period,
        ?int $groupId = null,
    ): Collection {

        return DB::table('employees')
            ->where('employees.Status', 1)
            ->whereNull('employees.deleted_at')
            ->leftJoin('groups', 'groups.id', '=', 'employees.Group')
            ->leftJoin('dtr_records', function ($join) use ($period) {
                $join->on('dtr_records.EmpID', '=', 'employees.id')
                    ->whereBetween('dtr_records.DTRDate', [
                        $period->PeriodStart,
                        $period->PeriodEnd,
                    ]);
            })
            // ->when($search, function ($query) use ($search) {
            //     $query->where('employees.FullName', 'like', "%{$search}%");
            // })
            ->when($groupId, function ($query, $groupId) {
                $query->where('employees.Group', $groupId);
            })
            ->select(
                'employees.id',
                'employees.FullName',
                'employees.EmpNbr',
                'employees.LastName',
                'employees.Group',
                'groups.name as GroupName',
            )
            ->groupBy(
                'employees.id',
                'employees.FullName',
                'employees.EmpNbr',
                'employees.LastName',
                'employees.Group',
                'groups.name'
            )
            ->orderBy('employees.LastName')
            ->get();
    }
    public function attachDtrRecords(
        LengthAwarePaginator|Collection $employees,
        PayrollPeriod $period
    ): void {
        $items = $employees instanceof LengthAwarePaginator
            ? $employees->getCollection()
            : $employees;

        $empIds = $items->pluck('id');

        $dtrRecords = $this->build($empIds, $period);

        $items->transform(function ($employee) use ($dtrRecords) {
            $employee->dtr_records = $dtrRecords
                ->get($employee->id, collect())
                ->values();
            return $employee;
        });
    }

    public function build(Collection $empIds, PayrollPeriod $period): Collection
    {
        $dates = collect(CarbonPeriod::create(
            $period->PeriodStart,
            $period->PeriodEnd
        ));
        $biometricLogs = DB::table('biometric_logs')
            ->whereIn('employee_id', $empIds)
            ->whereBetween('punch_time', [
                Carbon::parse($period->PeriodStart)->startOfDay(),
                Carbon::parse($period->PeriodEnd)->endOfDay(),
            ])
            ->orderBy('punch_time')
            ->get()
            ->groupBy([
                'employee_id',
                fn($log) => Carbon::parse($log->punch_time)->toDateString(),
            ]);
        // NEW: schedule templates covering this period
        $schedules = DB::table('employee_schedule_templates')
            ->join('shift_codes', 'shift_codes.id', '=', 'employee_schedule_templates.ShiftCodeID')
            ->whereIn('employee_schedule_templates.EmpID', $empIds)
            // ->where('employee_schedule_templates.EffectiveFrom', '<=', $period->PeriodEnd)
            // ->where(function ($q) use ($period) {
            //     $q->whereNull('employee_schedule_templates.EffectiveTo')
            //         ->orWhere('employee_schedule_templates.EffectiveTo', '>=', $period->PeriodStart);
            // })
            ->select(
                'employee_schedule_templates.EmpID',
                'employee_schedule_templates.DayOfWeek',
                'employee_schedule_templates.EffectiveFrom',
                'employee_schedule_templates.EffectiveTo',
                'shift_codes.Name as ShiftName',
                'shift_codes.IsWorkingDay'
            )
            ->get()
            ->groupBy('EmpID');

        $perDateOverrides = DB::table('employee_schedules')
            ->leftJoin('shift_codes', 'shift_codes.id', '=', 'employee_schedules.ShiftCodeID')
            ->whereIn('employee_schedules.EmpID', $empIds)
            ->where('employee_schedules.ScheduleType', 'per_date')
            ->where('employee_schedules.IsActive', true)
            ->whereBetween('employee_schedules.EffectiveFrom', [$period->PeriodStart, $period->PeriodEnd])
            ->select(
                'employee_schedules.EmpID',
                'employee_schedules.EffectiveFrom as Date',
                'shift_codes.Name as ShiftName',
                'shift_codes.IsWorkingDay'
            )
            ->get()
            ->groupBy('EmpID');

        return DB::table('dtr_records')
            ->whereIn('EmpID', $empIds)
            ->whereBetween('DTRDate', [$period->PeriodStart, $period->PeriodEnd])
            ->orderBy('DTRDate')
            ->get()
            ->groupBy('EmpID')
            ->map(function ($records, $empId) use ($dates, $biometricLogs, $schedules, $perDateOverrides) {
                return $this->buildEmployeeDtr(
                    $records,
                    $dates,
                    $biometricLogs->get($empId, collect()),
                    $schedules->get($empId, collect()),
                    $perDateOverrides->get($empId, collect())
                );
            });
    }
    public function employeeAttendance(
        PayrollPeriod $period,
        int $empId
    ): array {
        $employee = DB::table('employees')
            ->where('employees.Status', 1)
            ->where('employees.id', $empId)
            ->whereNull('employees.deleted_at')
            ->leftJoin('areas', 'areas.id', '=', 'employees.Assignment')
            ->leftJoin('groups as assignment_groups', 'assignment_groups.id', '=', 'areas.type')
            ->select(
                'employees.id',
                'employees.FullName',
                'employees.EmpNbr',
                'areas.name as Assignment',
                'assignment_groups.name as Department'
            )
            ->first();

        abort_unless($employee, 404);

        $dtrRecords = $this->build(collect([$empId]), $period)
            ->get($empId, collect())
            ->values();

        $payrollSummary = DB::table('payroll_summaries')
            ->where('EmpID', $empId)
            ->where('PayrollPeriodID', $period->id)
            ->first();

        return [
            'employee' => $employee,
            'period' => [
                'id' => $period->id,
                'Label' => Carbon::parse($period->PeriodStart)->format('M j')
                    . ' – ' . Carbon::parse($period->PeriodEnd)->format('M j, Y'),
                'PeriodStart' => $period->PeriodStart,
                'PeriodEnd' => $period->PeriodEnd,
                'PayDate' => $period->PayDate,
            ],
            'dtrRecords' => $dtrRecords,
            'payrollSummary' => $payrollSummary,
        ];
    }

    public function statusCounts(PayrollPeriod $period): array
    {
        $employeeStatuses = DB::table('employees')
            ->where('employees.Status', 1)
            ->whereNull('employees.deleted_at')
            ->leftJoin('dtr_records', function ($join) use ($period) {
                $join->on('dtr_records.EmpID', '=', 'employees.id')
                    ->whereBetween('dtr_records.DTRDate', [$period->PeriodStart, $period->PeriodEnd]);
            })
            ->select('employees.id')
            ->selectRaw("CASE
                WHEN COUNT(dtr_records.id) = 0 AND NOT EXISTS (
                    SELECT 1 FROM biometric_logs status_logs
                    WHERE status_logs.employee_id = employees.id
                        AND status_logs.punch_time BETWEEN ? AND ?
                ) THEN 'no_entry'
                WHEN SUM(CASE WHEN NULLIF(LTRIM(RTRIM(dtr_records.Remarks)), '') IS NOT NULL THEN 1 ELSE 0 END) > 0 THEN 'flagged'
                WHEN COUNT(dtr_records.id) = 0 THEN 'pending'
                ELSE 'processed'
            END as status", [
                Carbon::parse($period->PeriodStart)->startOfDay(),
                Carbon::parse($period->PeriodEnd)->endOfDay(),
            ])
            ->groupBy('employees.id');

        $counts = DB::query()
            ->fromSub($employeeStatuses, 'employee_statuses')
            ->selectRaw("SUM(CASE WHEN status = 'flagged' THEN 1 ELSE 0 END) as flagged")
            ->selectRaw("SUM(CASE WHEN status = 'no_entry' THEN 1 ELSE 0 END) as no_entry")
            ->selectRaw("SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending")
            ->selectRaw("SUM(CASE WHEN status = 'processed' THEN 1 ELSE 0 END) as processed")
            ->first();

        return [
            'flagged' => (int) ($counts->flagged ?? 0),
            'no_entry' => (int) ($counts->no_entry ?? 0),
            'pending' => (int) ($counts->pending ?? 0),
            'processed' => (int) ($counts->processed ?? 0),
        ];
    }

    public function summary(PayrollPeriod $period): array
    {
        // Do not report No Entry before DTR processing has generated records for this period.
        $hasProcessedDtr = DB::table('dtr_records')
            ->whereBetween('DTRDate', [$period->PeriodStart, $period->PeriodEnd])
            ->exists();

        $grouped = DB::table('employees')
            ->where('employees.Status', 1)
            ->whereNull('employees.deleted_at')
            ->leftJoin('dtr_records', function ($join) use ($period) {
                $join->on('dtr_records.EmpID', '=', 'employees.id')
                    ->whereBetween('dtr_records.DTRDate', [
                        $period->PeriodStart,
                        $period->PeriodEnd,
                    ]);
            })
            ->select(
                'employees.id',
                DB::raw('COUNT(dtr_records.EmpID) as record_count'),
                DB::raw('MAX(dtr_records.Remarks) as last_remarks')
            )
            ->selectRaw("CASE
                WHEN COUNT(dtr_records.EmpID) = 0 AND NOT EXISTS (
                    SELECT 1 FROM biometric_logs status_logs
                    WHERE status_logs.employee_id = employees.id
                        AND status_logs.punch_time BETWEEN ? AND ?
                ) THEN 'no_entry'
                WHEN COUNT(dtr_records.EmpID) = 0 THEN 'pending'
                WHEN SUM(CASE WHEN NULLIF(LTRIM(RTRIM(dtr_records.Remarks)), '') IS NOT NULL THEN 1 ELSE 0 END) > 0 THEN 'flagged'
                ELSE 'processed'
            END as dtr_status", [
                Carbon::parse($period->PeriodStart)->startOfDay(),
                Carbon::parse($period->PeriodEnd)->endOfDay(),
            ])
            ->groupBy('employees.id');

        $counts = DB::query()
            ->fromSub($grouped, 'g')
            ->selectRaw('COUNT(*) as total')
            ->selectRaw("SUM(CASE WHEN dtr_status = 'processed' THEN 1 ELSE 0 END) as processed")
            ->selectRaw("SUM(CASE WHEN dtr_status = 'pending' THEN 1 ELSE 0 END) as pending")
            ->selectRaw("SUM(CASE WHEN dtr_status = 'flagged' THEN 1 ELSE 0 END) as flagged")
            ->selectRaw("SUM(CASE WHEN dtr_status = 'no_entry' THEN 1 ELSE 0 END) as no_entry")
            ->first();

        return [
            ['label' => 'Employees', 'value' => (int) $counts->total],
            ['label' => 'Processed', 'value' => (int) $counts->processed],
            ['label' => 'Pending', 'value' => (int) $counts->pending + (!$hasProcessedDtr ? (int) $counts->no_entry : 0)],
            ['label' => 'Flagged', 'value' => (int) $counts->flagged],
            ['label' => 'No Entry', 'value' => $hasProcessedDtr ? (int) $counts->no_entry : 0],
        ];
    }
    protected function buildEmployeeDtr(
        Collection $records,
        Collection $dates,
        Collection $biometricLogs,
        Collection $schedules,
        Collection $perDateOverrides
    ): Collection {
        $indexed = $records->keyBy(
            fn($record) => Carbon::parse($record->DTRDate)->toDateString()
        );

        $overridesByDate = $perDateOverrides->keyBy(
            fn($o) => Carbon::parse($o->Date)->toDateString()
        );

        $dtr = $dates->map(function (Carbon $date) use ($indexed, $biometricLogs, $schedules, $overridesByDate) {

            $record = $indexed->get($date->toDateString());

            $logs = $biometricLogs
                ->get($date->toDateString(), collect())
                ->map(fn($log) => [
                    'PunchTime' => Carbon::parse($log->punch_time)->format('h:i:s A'),
                    'VerifyMode' => $log->verify_mode,
                    'IOState' => $log->io_state,
                ])
                ->values();
            $schedule = $overridesByDate->get($date->toDateString())
                ?? $this->resolveSchedule($schedules, $date);

            return [
                'id' => $record?->id,
                'DTRDate' => $date->format('M d, Y'),
                'Day' => $date->format('D'),
                'IN' => $this->time($record?->IN),
                'OUT' => $this->time($record?->OUT),
                'HW' => $this->decimal($record?->RenderedHours),
                'OT' => $this->decimal($record?->OvertimeHours),
                'DW' => $this->decimal($record?->DaysWorked),
                'LATE' => $this->decimal($record?->LateMinutes),
                'UT' => $this->decimal($record?->UndertimeMinutes),

                'Remarks' => $record?->Remarks,

                // Attach biometric logs for this date
                'Punches' => $logs,
                // NEW
                'ShiftName' => $schedule?->ShiftName,
                'IsDayOff' => $schedule ? ! (bool) $schedule->IsWorkingDay : null,
            ];
        });


        $dtr->push([
            'DTRDate' => 'TOTAL',
            'Day' => '',
            'IN' => '',
            'OUT' => '',
            'HW' => '',
            'OT' => "{$this->decimal($records->sum('OvertimeHours'))} hr(s)",
            'DW' =>  "{$this->decimal($records->sum('DaysWorked'))} days",
            'LATE' => "",
            'UT' => '',
            'Remarks' => '',
            'Punches' => collect(),
            'ShiftName' => '',
            'IsDayOff' => null,
        ]);

        return $dtr;
    }
    protected function resolveSchedule(Collection $schedules, Carbon $date): ?object
    {
        return $schedules
            ->filter(fn($s) => (int) $s->DayOfWeek === $date->dayOfWeek)
            ->filter(function ($s) use ($date) {
                $from = $s->EffectiveFrom ? Carbon::parse($s->EffectiveFrom) : null;
                $to = $s->EffectiveTo ? Carbon::parse($s->EffectiveTo) : null;

                return (! $from || $date->gte($from)) && (! $to || $date->lte($to));
            })
            ->sortByDesc('EffectiveFrom')
            ->first();
    }
    protected function time(string|\DateTimeInterface|null $value): ?string
    {
        return $value
            ? Carbon::parse($value)->format('g:i A')
            : null;
    }

    protected function decimal(int|float|string|null $value): int|float
    {
        $value = (float) ($value ?? 0);

        return fmod($value, 1) == 0
            ? (int) $value
            : $value;
    }

}
