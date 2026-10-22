<?php

namespace App\Services\DTR;

use App\Models\PayrollPeriod;
use Illuminate\Support\Facades\DB;

class DtrLockService
{
    /**
     * Create a new class instance.
     */
    public function __construct(protected DtrViewerService $dtrViewerService) {}
    public function validate(PayrollPeriod $period): array
    {
        $stats = $this->dtrViewerService->statusCounts($period);

        $processed = (int) ($stats['processed'] ?? 0);
        $pending = (int) ($stats['pending'] ?? 0);
        $flagged = (int) ($stats['flagged'] ?? 0);
        $noEntry = (int) ($stats['no_entry'] ?? 0);

        return [
            'total' => $processed + $pending + $flagged + $noEntry,
            'processed' => $processed,
            'pending' => $pending,
            'flagged' => $flagged,
            'no_entry' => $noEntry,
            'ready_to_lock' => $processed > 0 && $pending === 0 && $flagged === 0,
        ];
    }

    public function lock(PayrollPeriod $period): void
    {
        DB::transaction(function () use ($period) {
            $validation = $this->validate($period);

            if (! $validation['ready_to_lock']) {
                $issues = [];
                if ($validation['processed'] === 0) {
                    $issues[] = 'no processed DTR records were found';
                }
                if ($validation['pending'] > 0) {
                    $issues[] = "{$validation['pending']} employee(s) with punches still have pending DTR records";
                }
                if ($validation['flagged'] > 0) {
                    $issues[] = "{$validation['flagged']} employee(s) have flagged DTR records";
                }

                throw new \RuntimeException(
                    'Cannot lock DTR: ' . implode('; ', $issues) . '. Process or review the period first.'
                );
            }

            DB::table('dtr_records')
                ->where('PayrollPeriodID', $period->id)
                ->where('PayrollStatus', 'pending')
                ->update(['PayrollStatus' => 'locked']);
        });
    }
    public function processed(PayrollPeriod $period): void
    {
        DB::transaction(function () use ($period) {
            DB::table('dtr_records')
                ->where('PayrollPeriodID', $period->id)
                ->where('PayrollStatus', 'locked')
                ->update(['PayrollStatus' => 'processed']);
        });
    }
    public function paid(PayrollPeriod $period): void
    {
        DB::transaction(function () use ($period) {
            DB::table('dtr_records')
                ->where('PayrollPeriodID', $period->id)
                ->where('PayrollStatus', 'processed')
                ->update(['PayrollStatus' => 'paid']);
        });
    }
}
