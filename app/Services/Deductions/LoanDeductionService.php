<?php

namespace App\Services\Deductions;

use App\Models\Employee;
use App\Models\LoanMaster;
use App\Models\PayrollPeriod;
use Illuminate\Support\Collection;
use RuntimeException;

class LoanDeductionService
{
    // Actual codes stored in Frequency.
    protected const FREQUENCY_EVERY_PAYDAY = '00';
    protected const FREQUENCY_FIRST_CUTOFF = '15';
    protected const FREQUENCY_SECOND_CUTOFF = '30';

    /**
     * Total loan deduction for this employee for this period's cutoff,
     * summing every active loan whose Frequency matches the cutoff
     * (CutoffNumber 1 = the 15th, 2 = end of month).
     */
    public function calculate(Employee $employee, PayrollPeriod $period): float
    {
        return round(
            $this->resolveDueLoans($employee, $period)
                ->sum(fn(LoanMaster $loan) => $this->installmentFor($loan)),
            2
        );
    }

    /**
     * Per-loan breakdown for payslip line items.
     *
     * @return array<int, array{loan_id: int, loan_type: string, amount: float}>
     */
    public function breakdown(Employee $employee, PayrollPeriod $period): array
    {

        return $this->resolveDueLoans($employee, $period)
            ->map(fn(LoanMaster $loan) => [
                'loan_id' => $loan->id,
                'loan_type' => $loan->loanType->name ?? 'Loan',
                'amount' => $this->installmentFor($loan),
            ])
            ->values()
            ->all();
    }

    /**
     * Decrements each due loan's running balance. Call this only when the
     * period is actually locked/released — not during a recompute preview,
     * or balances will be deducted twice.
     */
    public function applyDeductions(Employee $employee, PayrollPeriod $period): void
    {
        $this->resolveDueLoans($employee, $period)->each(function (LoanMaster $loan) {
            $loan->decrement('BalanceAmt', $this->installmentFor($loan));
        });
    }

    protected function resolveDueLoans(Employee $employee, PayrollPeriod $period): Collection
    {
        if (!$period->PeriodEnd) {
            throw new RuntimeException(
                "Payroll period {$period->id} has no PeriodEnd."
            );
        }
        $cutoffFrequency = $period->CutoffNumber === 1
            ? self::FREQUENCY_FIRST_CUTOFF
            : self::FREQUENCY_SECOND_CUTOFF;

        return LoanMaster::query()
            ->where('EmpNbr', $employee->EmpNbr)
            ->where('BalanceAmt', '>', 0)
            ->where('StartDate', '<=', $period->PeriodEnd)
            ->whereIn('Frequency', [self::FREQUENCY_EVERY_PAYDAY, $cutoffFrequency])
            ->get();
    }

    protected function installmentFor(LoanMaster $loan): float
    {
        // Never deduct more than what's actually left on the loan.
        return (float) min($loan->DedAmt, $loan->BalanceAmt);
    }
}
