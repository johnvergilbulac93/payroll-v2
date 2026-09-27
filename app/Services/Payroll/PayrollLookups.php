<?php

namespace App\Services\Payroll;

use App\Models\GovernmentMandated;
use App\Models\PhilHealthContribution;
use Illuminate\Support\Collection;

/**
 * Bundles every preloaded, employee-independent payroll lookup so it can
 * be fetched once per computePayroll() run and reused across the whole
 * employee loop instead of re-querying per employee.
 */
class PayrollLookups
{
    public function __construct(
        public readonly Collection $sssBrackets,
        public readonly ?PhilHealthContribution $philHealthRate,
        public readonly ?GovernmentMandated $pagIbigDeduction,
        public readonly Collection $withholdingTaxBrackets,
        public readonly array $deductionFrequencies,
        public array $holidayPreload,
    ) {}
}
