<?php

namespace App\Services\Holiday;

use App\Enums\HolidayType;
use App\Models\DtrRecord;
use App\Models\Employee;
use App\Models\Holiday;
use App\Models\PayrollPeriod;
use Illuminate\Support\Collection;

class HolidayPayService
{
    // Full-day-pay-style holiday pay: computed independently of BasicPay
    // and added on top, regardless of monthly/daily pay scheme.
    protected const HOLIDAY_REGULAR_WORKED_RATE = 2.0;             // 200% if worked
    protected const HOLIDAY_REGULAR_UNWORKED_RATE = 1.0;           // 100% regardless of attendance
    protected const HOLIDAY_SPECIAL_NON_WORKING_WORKED_RATE = 1.3; // 130% if worked
    protected const HOLIDAY_SPECIAL_NON_WORKING_UNWORKED_RATE = 0.0; // no work, no pay
    protected const HOLIDAY_SPECIAL_WORKING_WORKED_RATE = 1.0;     // no premium
    protected const HOLIDAY_SPECIAL_WORKING_UNWORKED_RATE = 0.0;

    /**
     * Preload every holiday inside the period, plus every DTR record on
     * those dates for every employee, in two queries total. Call this
     * once before looping employees, then pass the result into
     * computeForEmployee() per employee.
     *
     * @return array{holidays: Collection, dtrByEmpAndDate: Collection}
     */
    public function preload(PayrollPeriod $period): array
    {
        $holidays = Holiday::whereBetween('Date', [$period->PeriodStart, $period->PeriodEnd])->get();

        $dtrByEmpAndDate = collect();

        if ($holidays->isNotEmpty()) {
            $dtrByEmpAndDate = DtrRecord::whereIn('DTRDate', $holidays->pluck('Date'))
                ->get()
                ->groupBy('EmpID')
                ->map(fn(Collection $records) => $records->keyBy(
                    fn(DtrRecord $r) => $r->DTRDate->toDateString()
                ));
        }

        return [
            'holidays' => $holidays,
            'dtrByEmpAndDate' => $dtrByEmpAndDate,
        ];
    }

    /**
     * Compute total holiday pay for one employee for the period, using
     * data already fetched via preload() -- no queries run in here.
     *
     * @param array{holidays: Collection, dtrByEmpAndDate: Collection} $preloaded
     */
    public function computeForEmployee(Employee $employee, float $dailyRate, array $preloaded): float
    {
        $holidays = $preloaded['holidays'];

        if ($holidays->isEmpty()) {
            return 0.0;
        }

        $employeeDtr = $preloaded['dtrByEmpAndDate']->get($employee->id, collect());

        $total = 0.0;

        foreach ($holidays as $holiday) {
            $dtr = $employeeDtr->get($holiday->Date->toDateString());
            $worked = $dtr && $dtr->RenderedHours > 0;

            $rate = match ($holiday->HolidayType) {
                HolidayType::Regular => $worked
                    ? self::HOLIDAY_REGULAR_WORKED_RATE
                    : self::HOLIDAY_REGULAR_UNWORKED_RATE,
                HolidayType::SpecialNonWorking => $worked
                    ? self::HOLIDAY_SPECIAL_NON_WORKING_WORKED_RATE
                    : self::HOLIDAY_SPECIAL_NON_WORKING_UNWORKED_RATE,
                HolidayType::SpecialWorking => $worked
                    ? self::HOLIDAY_SPECIAL_WORKING_WORKED_RATE
                    : self::HOLIDAY_SPECIAL_WORKING_UNWORKED_RATE,
            };

            $total += $dailyRate * $rate;
        }

        return round($total, 2);
    }
}
