<?php

namespace App\Services\DTR;

use App\Models\BiometricLog;
use App\Models\DTRRecord;
use App\Models\Employee;
use App\Models\PayrollPeriod;
use App\Models\ShiftCode;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class DtrProcessorService2
{

    public function processPayrollPeriod(PayrollPeriod $period, ?int $employeeId = null): void
    {
        if ($period->Status === 'closed') {
            throw new \RuntimeException("Cannot process DTR — payroll period #{$period->id} is closed.");
        }

        $this->processForEmployees(
            Carbon::parse($period->PeriodStart),
            Carbon::parse($period->PeriodEnd),
            $employeeId
        );
    }


    // protected function processForEmployees(Carbon $startDate, Carbon $endDate, ?int $employeeId = null): void
    // {
    //     $groupedPunches = $this->fetchGroupedPunches($startDate, $endDate, $employeeId);
    //     $shiftCode = ShiftCode::find(1);

    //     foreach ($groupedPunches as $row) {
    //         if ($row->punch_count === 1) {
    //             $singlePunch = BiometricLog::where('employee_id', $row->employee_id)
    //                 ->whereDate('punch_time', $row->dtr_date)
    //                 ->first();

    //             $this->processSinglePunchDay($singlePunch, $row, $shiftCode);
    //             continue;
    //         }

    //         $this->upsertDtrRecord(
    //             employeeId: $row->employee_id,
    //             date: $row->dtr_date,
    //             in: Carbon::parse($row->time_in),
    //             out: Carbon::parse($row->time_out),
    //             punchCount: $row->punch_count,
    //             shiftCode: $shiftCode
    //         );
    //     }
    // }
    // protected function processForEmployees(Carbon $startDate, Carbon $endDate, ?int $employeeId = null): void
    // {

    //     $groupedPunches = $this->fetchGroupedPunches(
    //         $startDate,
    //         $endDate,
    //         $employeeId
    //     );

    //     $shiftCode = ShiftCode::find(1);

    //     $singlePunchLogs = BiometricLog::whereIn(
    //         'id',
    //         $groupedPunches
    //             ->where('punch_count', 1)
    //             ->pluck('biometric_log_id')
    //     )->get()->keyBy('id');

    //     $records = [];

    //     foreach ($groupedPunches as $row) {

    //         if ($row->punch_count == 1) {

    //             $singlePunch = $singlePunchLogs->get($row->biometric_log_id);

    //             if (!$singlePunch) {
    //                 continue;
    //             }

    //             $records[] = $this->buildSinglePunchRecord(
    //                 $singlePunch,
    //                 $row,
    //                 $shiftCode
    //             );

    //             continue;
    //         }

    //         $records[] = $this->buildDtrRecord(
    //             employeeId: $row->employee_id,
    //             date: $row->dtr_date,
    //             in: Carbon::parse($row->time_in),
    //             out: Carbon::parse($row->time_out),
    //             punchCount: $row->punch_count,
    //             shiftCode: $shiftCode
    //         );
    //     }

    //     if (!empty($records)) {

    //         DTRRecord::upsert(
    //             $records,
    //             ['EmpID', 'DTRDate'],
    //             [
    //                 'ShiftCodeID',
    //                 'IN',
    //                 'OUT',
    //                 'LateMinutes',
    //                 'UndertimeMinutes',
    //                 'RenderedHours',
    //                 'OvertimeHours',
    //                 'DaysWorked',
    //                 'Remarks',
    //             ]
    //         );
    //     }
    // }
    protected function processForEmployees(
        Carbon $startDate,
        Carbon $endDate,
        ?int $employeeId = null
    ): void {

        $groupedPunches = $this->fetchGroupedPunches(
            $startDate,
            $endDate,
            $employeeId
        );

        $shiftCode = ShiftCode::find(1);

        $records = [];

        foreach ($groupedPunches as $row) {

            if ($row->punch_count == 1) {

                $records[] = $this->buildSinglePunchRecord(
                    Carbon::parse($row->time_in),
                    $row,
                    $shiftCode
                );

                continue;
            }

            $records[] = $this->buildDtrRecord(
                employeeId: $row->employee_id,
                date: $row->dtr_date,
                in: Carbon::parse($row->time_in),
                out: Carbon::parse($row->time_out),
                punchCount: (int) $row->punch_count,
                shiftCode: $shiftCode
            );
        }

        if (!empty($records)) {

            collect($records)
                ->chunk(500)
                ->each(function ($chunk) {

                    DTRRecord::upsert(
                        $chunk->toArray(),
                        ['EmpID', 'DTRDate'],
                        [
                            'ShiftCodeID',
                            'IN',
                            'OUT',
                            'LateMinutes',
                            'UndertimeMinutes',
                            'RenderedHours',
                            'OvertimeHours',
                            'DaysWorked',
                            'Remarks',
                        ]
                    );
                });
        }
    }

    // protected function fetchGroupedPunches(Carbon $startDate, Carbon $endDate, ?int $employeeId = null): Collection
    // {
    //     return DB::table('biometric_logs')
    //         ->selectRaw('
    //             employee_id,
    //             CAST(punch_time AS DATE) AS dtr_date,
    //             MIN(punch_time) AS time_in,
    //             MAX(punch_time) AS time_out,
    //             COUNT(*) AS punch_count
    //         ')
    //         ->whereNotNull('employee_id')
    //         ->when($employeeId, fn($query) => $query->where('employee_id', $employeeId))
    //         ->whereBetween('punch_time', [$startDate->startOfDay(), $endDate->endOfDay()])
    //         ->groupBy('employee_id', DB::raw('CAST(punch_time AS DATE)'))
    //         ->get();
    // }
    protected function fetchGroupedPunches(
        Carbon $startDate,
        Carbon $endDate,
        ?int $employeeId = null
    ): Collection {
        return DB::table('biometric_logs')
            ->selectRaw("
            employee_id,
            CAST(punch_time AS DATE) AS dtr_date,
            MIN(punch_time) AS time_in,
            MAX(punch_time) AS time_out,
            COUNT(*) AS punch_count
        ")
            ->whereNotNull('employee_id')
            ->when($employeeId, fn($q) => $q->where('employee_id', $employeeId))
            ->whereBetween('punch_time', [
                $startDate->copy()->startOfDay(),
                $endDate->copy()->endOfDay()
            ])
            ->groupBy(
                'employee_id',
                DB::raw('CAST(punch_time AS DATE)')
            )
            ->get();
    }
    // protected function fetchGroupedPunches(Carbon $startDate, Carbon $endDate, ?int $employeeId = null): Collection
    // {
    //     return DB::table('biometric_logs')
    //         ->selectRaw("
    //         employee_id,
    //         CAST(punch_time AS DATE) AS dtr_date,
    //         MIN(id) AS biometric_log_id,
    //         MIN(punch_time) AS time_in,
    //         MAX(punch_time) AS time_out,
    //         COUNT(*) AS punch_count
    //     ")
    //         ->whereNotNull('employee_id')
    //         ->when($employeeId, fn($q) => $q->where('employee_id', $employeeId))
    //         ->whereBetween('punch_time', [
    //             $startDate->copy()->startOfDay(),
    //             $endDate->copy()->endOfDay()
    //         ])
    //         ->groupBy(
    //             'employee_id',
    //             DB::raw('CAST(punch_time AS DATE)')
    //         )
    //         ->get();
    // }

    // protected function processSinglePunchDay(BiometricLog $punch, object $row, ShiftCode $shiftCode): void
    // {
    //     // $employee = Employee::find($row->employee_id);
    //     // $shiftCode = $employee?->shiftCode;

    //     [$in, $out, $remark] = $this->resolveSinglePunch($punch->punch_time, $shiftCode);

    //     [$lateMinutes, $undertimeMinutes, $renderedHours, $overtimeHours, $daysWorked] =
    //         $this->computeHours($in, $out, $shiftCode);

    //     DTRRecord::updateOrCreate(
    //         [
    //             'EmpID' => $row->employee_id,
    //             'DTRDate' => $row->dtr_date,
    //         ],
    //         [
    //             'ShiftCodeID' => $shiftCode?->id,
    //             'IN' => $in,
    //             'OUT' => $out,
    //             'LateMinutes' => $lateMinutes,
    //             'UndertimeMinutes' => $undertimeMinutes,
    //             'RenderedHours' => $renderedHours,
    //             'OvertimeHours' => $overtimeHours,
    //             'DaysWorked' => $daysWorked,
    //             'Remarks' => $remark,
    //         ]
    //     );
    // }
    // protected function buildSinglePunchRecord(BiometricLog $punch, object $row, ShiftCode $shiftCode): array
    // {
    //     [$in, $out, $remark] = $this->resolveSinglePunch(
    //         $punch->punch_time,
    //         $shiftCode
    //     );

    //     [
    //         $lateMinutes,
    //         $undertimeMinutes,
    //         $renderedHours,
    //         $overtimeHours,
    //         $daysWorked
    //     ] = $this->computeHours($in, $out, $shiftCode);

    //     return [
    //         'EmpID' => $row->employee_id,
    //         'DTRDate' => $row->dtr_date,
    //         'ShiftCodeID' => $shiftCode?->id,
    //         'IN' => $in,
    //         'OUT' => $out,
    //         'LateMinutes' => $lateMinutes,
    //         'UndertimeMinutes' => $undertimeMinutes,
    //         'RenderedHours' => $renderedHours,
    //         'OvertimeHours' => $overtimeHours,
    //         'DaysWorked' => $daysWorked,
    //         'Remarks' => $remark,
    //     ];
    // }
    protected function buildSinglePunchRecord(
        Carbon $punchTime,
        object $row,
        ShiftCode $shiftCode
    ): array {

        [$in, $out, $remark] = $this->resolveSinglePunch(
            $punchTime,
            $shiftCode
        );

        [
            $lateMinutes,
            $undertimeMinutes,
            $renderedHours,
            $overtimeHours,
            $daysWorked
        ] = $this->computeHours($in, $out, $shiftCode);

        return [
            'EmpID' => $row->employee_id,
            'DTRDate' => $row->dtr_date,
            'ShiftCodeID' => $shiftCode?->id,
            'IN' => $in,
            'OUT' => $out,
            'LateMinutes' => $lateMinutes,
            'UndertimeMinutes' => $undertimeMinutes,
            'RenderedHours' => $renderedHours,
            'OvertimeHours' => $overtimeHours,
            'DaysWorked' => $daysWorked,
            'Remarks' => $remark,
        ];
    }
    protected function resolveSinglePunch(Carbon $punchTime, ShiftCode $shiftCode): array
    {
        if (!$shiftCode) {
            return [$punchTime, null, 'Single punch, no shift to compare — flagged for review'];
        }

        $expectedStart = $punchTime->copy()->setTimeFromTimeString($shiftCode->TimeIn->format('H:i'));
        $expectedEnd = $punchTime->copy()->setTimeFromTimeString($shiftCode->TimeOut->format('H:i'));

        $diffToStart = abs($punchTime->diffInMinutes($expectedStart));
        $diffToEnd = abs($punchTime->diffInMinutes($expectedEnd));

        if ($diffToStart <= $diffToEnd) {
            return [$punchTime, null, 'Single punch, assumed IN (missing OUT) — flagged for review'];
        }

        return [null, $punchTime, 'Single punch, assumed OUT (missing IN) — flagged for review'];
    }

    // protected function upsertDtrRecord(int $employeeId, string $date, Carbon $in, Carbon $out, int $punchCount, ShiftCode $shiftCode): void
    // {
    //     // $employee = Employee::find($employeeId);
    //     // $shiftCode = $employee?->shiftCode;

    //     [$lateMinutes, $undertimeMinutes, $renderedHours, $overtimeHours, $daysWorked] =
    //         $this->computeHours($in, $out, $shiftCode);

    //     $remarks = $punchCount > 2
    //         ? "{$punchCount} punches detected, extras ignored (kept first/last)"
    //         : null;

    //     DtrRecord::updateOrCreate(
    //         [
    //             'EmpID' => $employeeId,
    //             'DTRDate' => $date,
    //         ],
    //         [
    //             'ShiftCodeID' => $shiftCode?->id,
    //             'IN' => $in,
    //             'OUT' => $out,
    //             'LateMinutes' => $lateMinutes,
    //             'UndertimeMinutes' => $undertimeMinutes,
    //             'RenderedHours' => $renderedHours,
    //             'OvertimeHours' => $overtimeHours,
    //             'DaysWorked' => $daysWorked,
    //             'Remarks' => $remarks,
    //         ]
    //     );
    // }
    protected function buildDtrRecord(int $employeeId, string $date, Carbon $in, Carbon $out, int $punchCount, ShiftCode $shiftCode): array
    {

        [
            $lateMinutes,
            $undertimeMinutes,
            $renderedHours,
            $overtimeHours,
            $daysWorked
        ] = $this->computeHours($in, $out, $shiftCode);

        $remarks = $punchCount > 2
            ? "{$punchCount} punches detected, extras ignored (kept first/last)"
            : null;

        return [
            'EmpID' => $employeeId,
            'DTRDate' => $date,
            'ShiftCodeID' => $shiftCode?->id,
            'IN' => $in,
            'OUT' => $out,
            'LateMinutes' => $lateMinutes,
            'UndertimeMinutes' => $undertimeMinutes,
            'RenderedHours' => $renderedHours,
            'OvertimeHours' => $overtimeHours,
            'DaysWorked' => $daysWorked,
            'Remarks' => $remarks,
        ];
    }

    protected function computeHours(?Carbon $in, ?Carbon $out, ShiftCode $shiftCode): array
    {
        if (!$in || !$out || !$shiftCode) {
            return [0, 0, 0, 0, 0];
        }

        $expectedStart = $in->copy()->setTimeFromTimeString($shiftCode->TimeIn->format('H:i'));
        $expectedEnd = $in->copy()->setTimeFromTimeString($shiftCode->TimeOut->format('H:i'));
        $breakMinutes = $shiftCode->BreakMinutes ?? 60;

        $lateMinutes = (int) max(0, round(($in->getTimestamp() - $expectedStart->getTimestamp()) / 60));
        $undertimeMinutes = (int) max(0, round(($expectedEnd->getTimestamp() - $out->getTimestamp()) / 60));

        $grossMinutes = (int) round(($out->getTimestamp() - $in->getTimestamp()) / 60);
        $renderedMinutes = max(0, $grossMinutes - $breakMinutes);
        $renderedHours = $this->floorToHalfHour($renderedMinutes);

        $shiftMinutes = (int) round($shiftCode->total_hours * 60);
        $overtimeMinutes = max(0, $renderedMinutes - $shiftMinutes);
        $overtimeHours = $this->floorToHalfHour($overtimeMinutes);

        $daysWorked = $shiftCode->total_hours > 0
            ? round($renderedHours / $shiftCode->total_hours, 4)
            : 0.0;

        return [$lateMinutes, $undertimeMinutes, $renderedHours, $overtimeHours, $daysWorked];
    }

    protected function floorToHalfHour(int $minutes): float
    {
        return floor($minutes / 30) * 0.5;
    }
}
