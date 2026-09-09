<?php

namespace App\Services\DTR;

use App\Models\DTRRecord;
use App\Models\Employee;
use App\Models\PayrollPeriod;
use App\Models\ShiftCode;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DtrProcessorService
{
    public function __construct(
        protected ScheduleResolverService $scheduleResolver
    ) {}
    protected int $clusterGapSeconds = 300;
    public function processPayrollPeriod(PayrollPeriod $period, ?int $employeeId = null): void
    {
        if ($period->Status === 'closed') {
            throw new \RuntimeException("Cannot process DTR — payroll period is closed.");
        }

        $this->processForEmployees(
            Carbon::parse($period->PeriodStart),
            Carbon::parse($period->PeriodEnd),
            $employeeId,
            $period->id
        );
    }
    public function processEmployeeForPeriod(int|Employee $employee, PayrollPeriod $period): void
    {
        if ($period->Status === 'closed') {
            throw new \RuntimeException("Cannot process DTR — payroll period #{$period->id} is closed.");
        }

        $employeeId = $employee instanceof Employee ? $employee->id : $employee;

        $this->processChunk(
            collect([$employeeId]),
            Carbon::parse($period->PeriodStart),
            Carbon::parse($period->PeriodEnd),
            $period->id
        );
    }
    public function processEmployee(int|Employee $employee, Carbon $startDate, Carbon $endDate): void
    {
        $employeeId = $employee instanceof Employee ? $employee->id : $employee;

        $this->processChunk(collect([$employeeId]), $startDate, $endDate);
    }
    protected function processForEmployees(Carbon $startDate, Carbon $endDate, ?int $employeeId = null, ?int $periodId = null): void
    {
        $employeeIds = $employeeId
            ? collect([$employeeId])
            : DB::table('employees')->where('Status', 1)->whereNull('deleted_at')->pluck('id');

        $employeeIds->chunk(100)->each(function ($chunk) use ($startDate, $endDate, $periodId) {
            $this->processChunk($chunk, $startDate, $endDate, $periodId);
        });
    }
    protected function processChunk(Collection $employeeIds, Carbon $startDate, Carbon $endDate, ?int $periodId = null): void
    {
        $lockedKeys = DTRRecord::query()
            ->whereIn('EmpID', $employeeIds)
            ->whereBetween('DTRDate', [$startDate, $endDate])
            ->where('PayrollStatus', '!=', 'pending')
            ->get(['EmpID', 'DTRDate'])
            ->map(fn($r) => $r->EmpID . '|' . $r->DTRDate)
            ->flip();

        $rawPunches = $this->fetchGroupedPunches($startDate, $endDate, $employeeIds);

        if ($rawPunches->isEmpty()) {
            throw new \RuntimeException(sprintf(
                "No biometric punch data found for employee(s) between %s and %s.",
                $startDate->toDateString(),
                $endDate->toDateString()
            ));
        }

        $groupedPunches = $this->fetchGroupedPunches($startDate, $endDate, $employeeIds)
            ->reject(fn($row) => isset($lockedKeys[$row->employee_id . '|' . $row->dtr_date]));

        // $groupedPunches = $this->fetchGroupedPunches($startDate, $endDate, $employeeIds);
        $ctx = $this->scheduleResolver->preload($employeeIds, $startDate, $endDate);

        $records = [];

        foreach ($groupedPunches as $row) {
            $date = Carbon::parse($row->dtr_date);
            $shiftCode = $this->scheduleResolver->resolveFor((int) $row->employee_id, $date, $ctx);

            if (!$shiftCode) {
                $records[] = $this->buildNoScheduleRecord($row, $periodId);
                continue;
            }

            if ($row->punch_count == 1) {
                $records[] = $this->buildSinglePunchRecord(Carbon::parse($row->time_in), $row, $shiftCode, $periodId);
                continue;
            }

            $records[] = $this->buildDtrRecord(
                employeeId: $row->employee_id,
                date: $row->dtr_date,
                in: Carbon::parse($row->time_in),
                out: Carbon::parse($row->time_out),
                punchCount: (int) $row->punch_count,
                shiftCode: $shiftCode,
                periodId: $periodId
            );
        }

        if (!empty($records)) {
            collect($records)
                ->chunk(500)
                ->each(function ($chunk) {
                    DTRRecord::upsert(
                        $chunk->toArray(),
                        ['EmpID', 'DTRDate'],
                        ['ShiftCodeID', 'IN', 'OUT', 'LateMinutes', 'UndertimeMinutes', 'RenderedHours', 'OvertimeHours', 'DaysWorked', 'Remarks', 'PayrollPeriodID']
                    );
                });
        }
    }

    protected function buildNoScheduleRecord(object $row, ?int $periodId = null): array
    {
        return [
            'EmpID' => $row->employee_id,
            'DTRDate' => $row->dtr_date,
            'ShiftCodeID' => null,
            'IN' => Carbon::parse($row->time_in),
            'OUT' => $row->punch_count > 1 ? Carbon::parse($row->time_out) : null,
            'LateMinutes' => 0,
            'UndertimeMinutes' => 0,
            'RenderedHours' => 0.0,
            'OvertimeHours' => 0.0,
            'DaysWorked' => 0.0,
            'Remarks' => 'No active schedule assigned — flagged for review',
            'PayrollPeriodID' => $periodId
        ];
    }
    protected function fetchGroupedPunches(Carbon $startDate, Carbon $endDate, Collection $employeeIds): Collection
    {
        $placeholders = implode(',', array_fill(0, $employeeIds->count(), '?'));

        $sql = "
        WITH punches AS (
            SELECT
                employee_id,
                punch_time,
                CAST(punch_time AS DATE) AS dtr_date,
                ROW_NUMBER() OVER (
                    PARTITION BY employee_id, CAST(punch_time AS DATE)
                    ORDER BY punch_time
                ) AS rn
            FROM biometric_logs
            WHERE employee_id IN ($placeholders)
            AND punch_time BETWEEN ? AND ?
        ),
        punches_gap AS (
            SELECT
                p.employee_id,
                p.punch_time,
                p.dtr_date,
                p.rn,
                DATEDIFF(SECOND, prev.punch_time, p.punch_time) AS gap_seconds
            FROM punches p
            LEFT JOIN punches prev
                ON prev.employee_id = p.employee_id
            AND prev.dtr_date = p.dtr_date
            AND prev.rn = p.rn - 1
        ),
        clustered_punches AS (
            SELECT
                pg.employee_id,
                pg.punch_time,
                pg.dtr_date,
                pg.rn,
                (
                    SELECT SUM(CASE WHEN pg2.gap_seconds IS NULL OR pg2.gap_seconds > ? THEN 1 ELSE 0 END)
                    FROM punches_gap pg2
                    WHERE pg2.employee_id = pg.employee_id
                    AND pg2.dtr_date = pg.dtr_date
                    AND pg2.rn <= pg.rn
                ) AS cluster_id
            FROM punches_gap pg
        ),
        first_cluster AS (
            SELECT employee_id, dtr_date, MIN(cluster_id) AS first_cluster_id
            FROM clustered_punches
            GROUP BY employee_id, dtr_date
        )
        SELECT
            c.employee_id,
            c.dtr_date,
            MAX(CASE WHEN c.cluster_id = fc.first_cluster_id THEN c.punch_time END) AS time_in,
            MAX(c.punch_time) AS time_out,
            COUNT(*) AS punch_count
        FROM clustered_punches c
        JOIN first_cluster fc
        ON fc.employee_id = c.employee_id AND fc.dtr_date = c.dtr_date
        GROUP BY c.employee_id, c.dtr_date
        ";

        $bindings = array_merge(
            $employeeIds->all(),
            [$startDate->copy()->startOfDay(), $endDate->copy()->endOfDay()],
            [$this->clusterGapSeconds]
        );

        return collect(DB::select($sql, $bindings));
    }

    // protected function fetchGroupedPunches(Carbon $startDate, Carbon $endDate, Collection $employeeIds): Collection
    // {
    //     $placeholders = implode(',', array_fill(0, $employeeIds->count(), '?'));

    //     $sql = "
    //     WITH punches AS (
    //         SELECT
    //             employee_id,
    //             punch_time,
    //             CAST(punch_time AS DATE) AS dtr_date,
    //             DATEDIFF(SECOND,
    //                 LAG(punch_time) OVER (
    //                     PARTITION BY employee_id, CAST(punch_time AS DATE)
    //                     ORDER BY punch_time
    //                 ),
    //                 punch_time
    //             ) AS gap_seconds
    //         FROM biometric_logs
    //         WHERE employee_id IN ($placeholders)
    //           AND punch_time BETWEEN ? AND ?
    //     ),
    //     clustered_punches AS (
    //         SELECT *,
    //             SUM(CASE WHEN gap_seconds IS NULL OR gap_seconds > ? THEN 1 ELSE 0 END)
    //                 OVER (PARTITION BY employee_id, dtr_date ORDER BY punch_time ROWS UNBOUNDED PRECEDING) AS cluster_id
    //         FROM punches
    //     ),
    //     first_cluster AS (
    //         SELECT employee_id, dtr_date, MIN(cluster_id) AS first_cluster_id
    //         FROM clustered_punches
    //         GROUP BY employee_id, dtr_date
    //     )
    //     SELECT
    //         c.employee_id,
    //         c.dtr_date,
    //         MAX(CASE WHEN c.cluster_id = fc.first_cluster_id THEN c.punch_time END) AS time_in,
    //         MAX(c.punch_time) AS time_out,
    //         COUNT(*) AS punch_count
    //     FROM clustered_punches c
    //     JOIN first_cluster fc
    //       ON fc.employee_id = c.employee_id AND fc.dtr_date = c.dtr_date
    //     GROUP BY c.employee_id, c.dtr_date
    // ";

    //     $bindings = array_merge(
    //         $employeeIds->all(),
    //         [$startDate->copy()->startOfDay(), $endDate->copy()->endOfDay()],
    //         [$this->clusterGapSeconds]
    //     );

    //     return collect(DB::select($sql, $bindings));
    // }

    protected function buildSinglePunchRecord(Carbon $punchTime, object $row, ShiftCode $shiftCode, int $periodId): array
    {

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
            'RenderedHours' => (float) $renderedHours,
            'OvertimeHours' => (float) $overtimeHours,
            'DaysWorked' => (float) $daysWorked,
            'Remarks' => $remark,
            'PayrollPeriodID' => $periodId,
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

    protected function buildDtrRecord(int $employeeId, string $date, Carbon $in, Carbon $out, int $punchCount, ShiftCode $shiftCode, ?int $periodId): array
    {
        [
            $lateMinutes,
            $undertimeMinutes,
            $renderedHours,
            $overtimeHours,
            $daysWorked
        ] = $this->computeHours($in, $out, $shiftCode);

        $remark = (!$shiftCode->TimeIn || !$shiftCode->TimeOut)
            ? "Punch recorded on {$date} for shift '{$shiftCode->Name}' — no active schedule assigned, flagged for review"
            : null;

        return [
            'EmpID' => $employeeId,
            'DTRDate' => $date,
            'ShiftCodeID' => $shiftCode?->id,
            'IN' => $in,
            'OUT' => $out,
            'LateMinutes' => $lateMinutes,
            'UndertimeMinutes' => $undertimeMinutes,
            'RenderedHours' => (float) $renderedHours,
            'OvertimeHours' => (float) $overtimeHours,
            'DaysWorked' => (float) $daysWorked,
            'Remarks' => $remark,
            'PayrollPeriodID' => $periodId,
        ];
    }


    protected function computeHours(?Carbon $in, ?Carbon $out, ShiftCode $shiftCode): array
    {
        if (!$in || !$out || !$shiftCode) {
            return [0, 0, 0.0, 0.0, 0.0];
        }

        if (!$shiftCode->TimeIn || !$shiftCode->TimeOut) {
            return [0, 0, 0.0, 0.0, 0.0];
        }
        $expectedStart = $in->copy()->setTimeFromTimeString($shiftCode->TimeIn->format('H:i'));
        $expectedEnd = $in->copy()->setTimeFromTimeString($shiftCode->TimeOut->format('H:i'));

        $breakMinutes = $shiftCode->BreakMinutes ?? 0;
        $shiftMinutes = (int) round($shiftCode->TotalHours * 60);
        $isHalfDay = $shiftCode->TotalHours <= 4;

        // Late — unchanged, based on raw punches.
        $lateMinutes = (int) max(0, floor(($in->getTimestamp() - $expectedStart->getTimestamp()) / 60));
        // Undertime: shortfall vs. scheduled end time, rounded UP to the
        // nearest half hour. E.g. 1 minute short → 0.5, 2hr11min short → 2.5.

        // $undertimeMinutesRaw = (int) max(0, round(($expectedEnd->getTimestamp() - $out->getTimestamp()) / 60));
        // $undertimeHours = ceil($undertimeMinutesRaw / 30) * 0.5;

        $undertimeMinutes = (int) max(0, round(($expectedEnd->getTimestamp() - $out->getTimestamp()) / 60));

        // --- Rendered hours: only count time actually inside the shift window ---
        // Clamp punches to the scheduled boundaries before measuring duration.
        $effectiveIn = $in->greaterThan($expectedStart) ? $in : $expectedStart;
        $effectiveOut = $out->lessThan($expectedEnd) ? $out : $expectedEnd;

        $scheduledGrossMinutes = $out->greaterThan($in)
            ? (int) round(($out->getTimestamp() - $in->getTimestamp()) / 60)
            : 0;

        $renderedMinutes = max(0, $scheduledGrossMinutes - $breakMinutes);

        // --- Overtime: only actual time worked past the scheduled end ---
        $postShiftMinutes = $out->greaterThan($expectedEnd)
            ? (int) round(($out->getTimestamp() - $expectedEnd->getTimestamp()) / 60)
            : 0;

        if ($isHalfDay) {
            // Half-day shift: cap at scheduled hours, no OT.
            $renderedMinutes = min($renderedMinutes, $shiftMinutes);
            $overtimeMinutes = 0;
        } else {
            $overtimeMinutes = $postShiftMinutes;
            $renderedMinutes = min($renderedMinutes, $shiftMinutes);
        }

        $renderedHours = $this->floorToHalfHour($renderedMinutes);
        $overtimeHours = $this->floorToHalfHour($overtimeMinutes);

        $daysWorked = $shiftCode->TotalHours > 0
            ? round($renderedHours / $shiftCode->TotalHours, 4)
            : 0.0;

        return [$lateMinutes, $undertimeMinutes, $renderedHours, $overtimeHours, $daysWorked];
    }

    protected function floorToHalfHour(int $minutes): float
    {
        return floor($minutes / 30) * 0.5;
    }
}
