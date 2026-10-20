<?php

namespace App\Services\Deductions;

use App\Models\Employee;
use App\Models\GovernmentMandated;

class PagIbigContributionService
{
    protected const CODE = 'Pag-IBIG';

    public function preloadDeduction(): ?GovernmentMandated
    {
        return GovernmentMandated::query()
            ->where('Code', self::CODE)
            ->where('Status', true)
            ->first();
    }

    public function calculate(Employee $employee, ?GovernmentMandated $deduction): float
    {
        if (! $deduction) {
            return 0.0;
        }

        return round((float) $deduction->DefaultValue, 2);
    }
}
