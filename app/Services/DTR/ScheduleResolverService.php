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
            ->whereNull('deleted_at')
            ->where(function ($q) use ($startDate, $endDate) {
                $q->where('EffectiveFrom', '<=', $endDate)
                    ->where(function ($q2) use ($startDate) {
                        $q2->whereNull('EffectiveTo')->orWhere('EffectiveTo', '>=', $startDate);
                    });
            })
            ->get()
            ->groupBy('EmpID');

        // Weekly recurring templates — same "still active as of this period" filter.
        $templates = DB::table('employee_schedule_templates')
            ->whereIn('EmpID', $employeeIds)
            ->whereNull('deleted_at')
            ->where(function ($q) use ($startDate, $endDate) {
                $q->where('EffectiveFrom', '<=', $endDate)
                    ->where(function ($q2) use ($startDate) {
                        $q2->whereNull('EffectiveTo')->orWhere('EffectiveTo', '>=', $startDate);
                    });
            })
            ->get()
            ->groupBy('EmpID');

        $shiftCodes = ShiftCode::where('IsActive', true)->get()->keyBy('id');

        return new ScheduleContext($schedules, $shiftCodes, $templates);
    }

    public function resolveFor(int $employeeId, Carbon $date, ScheduleContext $ctx): ?ShiftCode
    {
        $rows = $ctx->schedulesByEmployee->get($employeeId, collect());
        $dateStr = $date->toDateString();

        // 1. per_date
        $perDate = $rows->first(fn($s) => $s->ScheduleType === 'per_date' && $s->EffectiveFrom === $dateStr);
        if ($perDate) {
            return $perDate->ShiftCodeID ? $ctx->shiftCodes->get($perDate->ShiftCodeID) : null;
        }

        // 2. date_range
        $dateRange = $rows->first(
            fn($s) => $s->ScheduleType === 'date_range'
                && $s->EffectiveFrom <= $dateStr
                && $s->EffectiveTo >= $dateStr
        );
        if ($dateRange) {
            return $dateRange->ShiftCodeID ? $ctx->shiftCodes->get($dateRange->ShiftCodeID) : null;
        }

        // 3. default (open-ended override on employee_schedules)
        $default = $rows->first(
            fn($s) => $s->ScheduleType === 'default'
                && $s->EffectiveFrom <= $dateStr
                && (!$s->EffectiveTo || $s->EffectiveTo >= $dateStr)
        );
        if ($default) {
            return $default->ShiftCodeID ? $ctx->shiftCodes->get($default->ShiftCodeID) : null;
        }

        // 4. weekly template — fallback when no override exists for this date
        $dayOfWeek = $date->dayOfWeek; // Carbon: 0 = Sunday ... 6 = Saturday
        $templateRows = $ctx->templatesByEmployee->get($employeeId, collect());

        $template = $templateRows->first(
            fn($t) => (int) $t->DayOfWeek === $dayOfWeek
                && $t->EffectiveFrom <= $dateStr
                && (!$t->EffectiveTo || $t->EffectiveTo >= $dateStr)
        );

        return $template ? $ctx->shiftCodes->get($template->ShiftCodeID) : null;
    }
}
