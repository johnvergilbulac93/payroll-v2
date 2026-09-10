<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

#[Fillable(['EmpID', 'PayrollPeriodID', 'BasicPay', 'OvertimePay', 'LateDeduction', 'UndertimeDeduction', 'TotalAllowances', 'PerfectAttendanceIncentive', 'AbsenceDeduction', 'RetroAdjSIA', 'RetroAdjBP', 'SSSContribution', 'PhilHealthContribution', 'PagIbigContribution', 'WithholdingTax', 'HMOPremium', 'TotalLoanDeductions', 'TaxableIncome', 'GrossPay', 'NetPay'])]
#[Table('payroll_computations')]
class PayrollComputation extends Model
{

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'EmpID');
    }
    public function period(): BelongsTo
    {
        return $this->belongsTo(PayrollPeriod::class, 'PayrollPeriodID');
    }

    public function scopeFilter(Builder $query, array $filters): Builder
    {
        return $query
            ->when($filters['search'] ?? null, function (Builder $query, string $search) {
                $query->whereHas('employee', function (Builder $query) use ($search) {
                    $query->where('FullName', 'like', "%{$search}%");
                });
            })
            ->when($filters['group_id'] ?? null, function (Builder $query, int $groupId) {
                $query->whereHas('employee', function (Builder $query) use ($groupId) {
                    $query->where('Group', $groupId);
                });
            })
            ->when($filters['period'] ?? null, function (Builder $query, int $periodId) {
                $query->where('PayrollPeriodID', $periodId);
            });
    }
}
