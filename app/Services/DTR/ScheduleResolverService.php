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
            ->where(function ($query) use ($startDate, $endDate) {
                $query
                    ->where('ScheduleType', 'default')
                    ->orWhere(function ($query) use ($startDate, $endDate) {
                        $query->where('ScheduleType', 'per_date')
                            ->whereBetween('EffectiveFrom', [$startDate->toDateString(), $endDate->toDateString()]);
                    });

                // Date-range schedule query is intentionally disabled.
                // ->orWhere(function ($query) use ($startDate, $endDate) {
                //     $query->where('ScheduleType', 'date_range')
                //         ->where('EffectiveFrom', '<=', $endDate->toDateString())
                //         ->where('EffectiveTo', '>=', $startDate->toDateString());
                // });
            })
            ->orderByDesc('EffectiveFrom')
            ->get()
            ->groupBy('EmpID');

        // Weekly template schedules are disabled; only default and per-date schedules are used.
        // $templates = DB::table('employee_schedule_templates')
        //     ->whereIn('EmpID', $employeeIds)
        //     ->get()
        //     ->groupBy('EmpID');
        $templates = collect();

        $shiftCodes = ShiftCode::where('IsActive', true)->get()->keyBy('id');

        return new ScheduleContext($templates, $shiftCodes, $schedules);
    }

    public function resolveFor(int $employeeId, Carbon $date, ScheduleContext $ctx): ?ShiftCode
    {
        $dateStr = $date->toDateString();

        // 1. Per-date override
        $rows = $ctx->schedules->get($employeeId, collect());

        $perDate = $rows->first(fn($s) => $s->ScheduleType === 'per_date' && $s->EffectiveFrom === $dateStr);
        if ($perDate) {
            return $perDate->ShiftCodeID ? $ctx->shiftCodes->get($perDate->ShiftCodeID) : null;
        }

        // 2. Default schedule applies to employees with a configured default shift.
        $default = $rows->first(fn($s) => $s->ScheduleType === 'default');
        if ($default) {
            // Sunday is a rest day by default. An explicit per-date schedule above
            // takes precedence, allowing an employee to be scheduled on a Sunday.
            if ($date->isSunday()) {
                return $ctx->shiftCodes->first(
                    fn ($shift) => mb_strtolower(trim($shift->Name)) === 'rest day'
                );
            }

            return $default->ShiftCodeID ? $ctx->shiftCodes->get($default->ShiftCodeID) : null;
        }

        // Weekly template fallback is intentionally disabled.
        // $dayOfWeek = $date->dayOfWeek; // Carbon: 0 = Sunday ... 6 = Saturday
        // $templateRows = $ctx->templatesByEmployee->get($employeeId, collect());
        //
        // $template = $templateRows->first(
        //     fn($t) => (int) $t->DayOfWeek === $dayOfWeek
        // );
        //
        // return $template ? $ctx->shiftCodes->get($template->ShiftCodeID) : null;

        return null;
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
