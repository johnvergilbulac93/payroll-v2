<?php

namespace App\Services\Deductions;

use App\Models\Deduction;
use App\Models\Employee;

class PagIbigContributionService
{
    protected const CODE = 'Pag-IBIG';

    public function preloadDeduction(): ?Deduction
    {
        return Deduction::query()
            ->where('Code', self::CODE)
            ->where('Status', true)
            ->first();
    }

    public function calculate(Employee $employee, ?Deduction $deduction): float
    {
        if (! $deduction) {
            return 0.0;
        }

        $value = (float) $deduction->DefaultValue;

        return $deduction->IsHalf ? round($value / 2, 2) : round($value, 2);
    }
}
