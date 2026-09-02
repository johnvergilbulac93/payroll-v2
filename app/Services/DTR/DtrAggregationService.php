<?php

namespace App\Services\DTR;

use App\Models\DTRRecord;
use App\Models\PayrollPeriod;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class DtrAggregationService
{
    public function summarizeByPeriod(PayrollPeriod $period): Collection
    {
        return DTRRecord::query()
            ->select([
                'EmpID',
                DB::raw('SUM(DaysWorked) as total_days_worked'),
                DB::raw('SUM(RenderedHours) as total_rendered_hours'),
                DB::raw('SUM(OvertimeHours) as total_overtime_hours'),
                DB::raw('SUM(LateMinutes) as total_late_minutes'),
                DB::raw('SUM(UndertimeMinutes) as total_undertime_minutes'),
            ])
            ->whereBetween('DTRDate', [
                $period->PeriodStart,
                $period->PeriodEnd,
            ])
            ->groupBy('EmpID')
            ->get()
            ->keyBy('EmpID');
    }
}
