<?php

namespace App\Services\Deductions;

use App\Models\Employee;
use App\Models\PhilHealthContribution;

class PhilHealthContributionService
{
    public function preloadRate(): ?PhilHealthContribution
    {
        return PhilHealthContribution::query()
            ->where('Status', true)
            ->first();
    }

    public function calculate(Employee $employee, ?PhilHealthContribution $rate, ?float $monthlyCompensation = null): float
    {
        if (! $rate) {
            return 0.0;
        }

        $basis = $this->clampToRange($monthlyCompensation ?? $employee->BasicPay, $rate);

        return round($basis * $rate->EmployeeShareRate, 2);
    }

    public function calculateEmployerShare(Employee $employee, ?PhilHealthContribution $rate, ?float $monthlyCompensation = null): float
    {
        if (! $rate) {
            return 0.0;
        }

        $basis = $this->clampToRange($monthlyCompensation ?? $employee->BasicPay, $rate);

        return round($basis * $rate->EmployerShareRate, 2);
    }

    protected function clampToRange(float $monthlyCompensation, PhilHealthContribution $rate): float
    {
        return min(max($monthlyCompensation, $rate->SalaryFloor), $rate->SalaryCeiling);
    }
}
