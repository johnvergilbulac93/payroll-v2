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
        ?int $groupId = null
    ) {
        $periodLabel = Carbon::parse($period->PeriodStart)->format('M j')
            . ' – ' .
            Carbon::parse($period->PeriodEnd)->format('M j, Y');

        $paginated = DB::table('employees')
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
                DB::raw("
                    CASE
                        WHEN COUNT(dtr_records.EmpID) = 0 THEN 'pending'
                        WHEN MAX(dtr_records.Remarks) IS NULL THEN 'processed'
                        ELSE 'flagged'
                    END as status
                ")
            )
            ->groupBy(
                'employees.id',
                'employees.FullName',
                'employees.Image',
                'employees.EmpNbr',
                'employees.LastName',
                'groups.name'
            )
            // ->havingRaw("
            //     CASE
            //         WHEN COUNT(dtr_records.EmpID) = 0 THEN 'pending'
            //         WHEN MAX(dtr_records.Remarks) IS NULL THEN 'processed'
            //         ELSE 'flagged'
            //     END != 'processed'
            // ")
            ->orderBy('employees.LastName')
            ->paginate($limit ?: 10)
            ->onEachSide(1)
            ->withQueryString();

        return $paginated;
        // dd($paginated->toArray());
    }
    public function attachDtrRecords(
        LengthAwarePaginator $employees,
        PayrollPeriod $period
    ): void {
        $empIds = collect($employees->items())->pluck('id');

        $dtrRecords = $this->build($empIds, $period);

        $employees->getCollection()->transform(function ($employee) use ($dtrRecords) {

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
    public function summary(PayrollPeriod $period): array
    {
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
            ->groupBy('employees.id');

        $counts = DB::query()
            ->fromSub($grouped, 'g')
            ->selectRaw('COUNT(*) as total')
            ->selectRaw('SUM(CASE WHEN record_count > 0 AND last_remarks IS NULL THEN 1 ELSE 0 END) as processed')
            ->selectRaw('SUM(CASE WHEN record_count > 0 AND last_remarks IS NOT NULL THEN 1 ELSE 0 END) as flagged')
            ->selectRaw('SUM(CASE WHEN record_count = 0 THEN 1 ELSE 0 END) as pending')
            ->first();

        return [
            ['label' => 'Employees', 'value' => (int) $counts->total],
            ['label' => 'Processed', 'value' => (int) $counts->processed],
            ['label' => 'Flagged', 'value' => (int) $counts->flagged],
            ['label' => 'Pending', 'value' => (int) $counts->pending],
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
