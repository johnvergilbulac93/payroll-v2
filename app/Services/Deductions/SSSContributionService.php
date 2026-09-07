<?php

namespace App\Services\Deductions;

use App\Models\Employee;
use App\Models\SSSContributionBracket;
use Illuminate\Support\Collection;

class SssContributionService
{
    public function preloadBrackets(): Collection
    {
        return SSSContributionBracket::query()->get();
    }

    public function calculate(Employee $employee, Collection $brackets, ?float $monthlyCompensation = null): float
    {
        $bracket = $this->resolveBracket($brackets, $monthlyCompensation ?? $employee->BasicPay);

        return $bracket ? (float) $bracket->EmployeeTotal : 0.0;
    }

    public function calculateEmployerShare(Employee $employee, Collection $brackets, ?float $monthlyCompensation = null): float
    {
        $bracket = $this->resolveBracket($brackets, $monthlyCompensation ?? $employee->BasicPay);

        return $bracket ? (float) $bracket->EmployerTotal : 0.0;
    }

    protected function resolveBracket(Collection $brackets, float $monthlyCompensation): ?SSSContributionBracket
    {
        $monthlyCompensation = max($monthlyCompensation, 0);

        return $brackets->first(
            fn(SSSContributionBracket $b) => $b->CompensationFrom <= $monthlyCompensation
                && ($b->CompensationTo === null || $b->CompensationTo >= $monthlyCompensation)
        );
    }
}
