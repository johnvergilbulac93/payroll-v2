<?php

namespace App\Services\DTR;

use App\Models\DtrRecord;
use App\Models\Employee;
use App\Models\PayrollPeriod;
use App\Services\DTR\ScheduleResolverService;
use Carbon\Carbon;

class DtrSummaryService
{
    public function __construct(
        protected ScheduleResolverService $scheduleResolver,
    ) {}

    /**
     * Aggregates dtr_records for an employee within the period into the
     * shape PayrollComputationService::computeForPeriod() expects.
     */
    public function buildFor(Employee $employee, PayrollPeriod $period): array
    {
        $records = DtrRecord::where('EmpID', $employee->id)
            ->where('PayrollPeriodID', $period->id)
            ->get();

        $daysWorked = (float) $records->sum('DaysWorked');

        // Absences = scheduled work days not covered by an actual DTR record.
        $expectedWorkDays = $this->scheduleResolver->countWorkDaysInPeriod(
            $employee->id,
            Carbon::parse($period->PeriodStart),
            Carbon::parse($period->PeriodEnd),
        );
        $absences = max($expectedWorkDays - $daysWorked, 0);

        $lateAfter8am = $records->contains(
            fn(DtrRecord $record) => $record->IN && Carbon::parse($record->IN)->format('H:i') > '08:00'
        );

        return [
            'daysWorked' => $daysWorked,
            'absences' => $absences,
            'lateMinutes' => (int) $records->sum('LateMinutes'),
            'undertimeMinutes' => (int) $records->sum('UndertimeMinutes'),
            'overtimeHours' => (float) $records->sum('OvertimeHours'),
            'lateAfter8am' => $lateAfter8am,
            // Teaching-only figure; wire this to your actual teaching-load
            // source once that exists (not part of dtr_records today).
            'excessLoadUnits' => 0.0,
        ];
    }
}
