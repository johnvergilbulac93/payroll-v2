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
        $stats = collect($this->dtrViewerService->summary($period))
            ->pluck('value', 'label');

        $flagged = (int) $stats->get('Flagged', 0);

        return [
            'total' => (int) $stats->get('Employees', 0),
            'processed' => (int) $stats->get('Processed', 0),
            'flagged' => $flagged,
            'no_entry' => (int) $stats->get('No Entry', 0),
            'ready_to_lock' => $flagged === 0,
        ];
    }

    public function lock(PayrollPeriod $period): void
    {
        DB::transaction(function () use ($period) {
            $validation = $this->validate($period);

            if (! $validation['ready_to_lock']) {
                throw new \RuntimeException(
                    "Cannot lock DTR while {$validation['flagged']} flagged employee record(s) remain. Review and reprocess them first."
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
