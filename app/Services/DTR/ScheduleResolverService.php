<?php

namespace App\Services\DTR;

use App\Models\ShiftCode;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ScheduleResolverService
{
    public function preload(Collection $employeeIds, Carbon $startDate, Carbon $endDate): ScheduleContext
    {
        $schedules = DB::table('employee_schedules')
            ->whereIn('EmpID', $employeeIds)
            ->where('IsActive', true)
            ->where('ScheduleType', 'per_date')
            ->whereBetween('EffectiveFrom', [$startDate->toDateString(), $endDate->toDateString()])
            ->get()
            ->groupBy('EmpID');

        $templates = DB::table('employee_schedule_templates')
            ->whereIn('EmpID', $employeeIds)
            ->get()
            ->groupBy('EmpID');

        $shiftCodes = ShiftCode::where('IsActive', true)->get()->keyBy('id');

        return new ScheduleContext($templates, $shiftCodes, $schedules);
    }

    public function resolveFor(int $employeeId, Carbon $date, ScheduleContext $ctx): ?ShiftCode
    {
        $dateStr = $date->toDateString();

        // Future: 1. per_date override
        $rows = $ctx->schedules->get($employeeId, collect());

        $perDate = $rows->first(fn($s) => $s->ScheduleType === 'per_date' && $s->EffectiveFrom === $dateStr);
        if ($perDate) {
            return $perDate->ShiftCodeID ? $ctx->shiftCodes->get($perDate->ShiftCodeID) : null;
        }

        // Future: 2. date_range override
        // $dateRange = $rows->first(
        //     fn($s) => $s->ScheduleType === 'date_range'
        //         && $s->EffectiveFrom <= $dateStr
        //         && $s->EffectiveTo >= $dateStr
        // );
        // if ($dateRange) {
        //     return $dateRange->ShiftCodeID ? $ctx->shiftCodes->get($dateRange->ShiftCodeID) : null;
        // }

        // Future: 3. default open-ended override
        // $default = $rows->first(
        //     fn($s) => $s->ScheduleType === 'default'
        //         && $s->EffectiveFrom <= $dateStr
        //         && (!$s->EffectiveTo || $s->EffectiveTo >= $dateStr)
        // );
        // if ($default) {
        //     return $default->ShiftCodeID ? $ctx->shiftCodes->get($default->ShiftCodeID) : null;
        // }

        // 4. weekly template — currently the only source of truth
        $dayOfWeek = $date->dayOfWeek; // Carbon: 0 = Sunday ... 6 = Saturday
        $templateRows = $ctx->templatesByEmployee->get($employeeId, collect());

        $template = $templateRows->first(
            fn($t) => (int) $t->DayOfWeek === $dayOfWeek
        );

        return $template ? $ctx->shiftCodes->get($template->ShiftCodeID) : null;
    }
    /**
     * Counts scheduled work days for an employee within a date range —
     * any date that resolves to a non-null ShiftCode counts as a work day.
     * Add this method inside ScheduleResolverService, alongside resolveFor().
     */
    public function countWorkDaysInPeriod(int $employeeId, Carbon $startDate, Carbon $endDate): int
    {
        $ctx = $this->preload(collect([$employeeId]), $startDate, $endDate);

        $count = 0;
        $cursor = $startDate->copy();

        while ($cursor->lte($endDate)) {
            $shiftCode = $this->resolveFor($employeeId, $cursor, $ctx);

            if ($shiftCode && (bool) $shiftCode->IsWorkingDay) {
                $count++;
            }

            $cursor->addDay();
        }

        return $count;
    }

    public function countAbsences(
        int $employeeId,
        Carbon $startDate,
        Carbon $endDate,
        Collection $records
    ): float {
        $ctx = $this->preload(collect([$employeeId]), $startDate, $endDate);
        $recordsByDate = $records->keyBy(
            fn ($record) => Carbon::parse(data_get($record, 'DTRDate'))->toDateString()
        );

        $absences = 0.0;
        $cursor = $startDate->copy();

        while ($cursor->lte($endDate)) {
            $shiftCode = $this->resolveFor($employeeId, $cursor, $ctx);

            if (!$shiftCode || !(bool) $shiftCode->IsWorkingDay) {
                $cursor->addDay();
                continue;
            }

            $record = $recordsByDate->get($cursor->toDateString());
            $daysWorked = (float) data_get($record, 'DaysWorked', 0);

            if ($daysWorked <= 0) {
                $absences += 1;
            } elseif ($daysWorked < 1) {
                $absences += 1 - $daysWorked;
            }

            $cursor->addDay();
        }

        return round($absences, 4);
    }
}
