<?php

namespace App\Services\Deductions;

use App\Models\WTaxTable;
use Illuminate\Support\Collection;

class WithholdingTaxService
{
    public function preloadBrackets(): Collection
    {
        return WTaxTable::query()->orderBy('BracketOrder')->get();
    }

    public function calculate(float $taxableIncome, Collection $brackets): float
    {
        $taxableIncome = max($taxableIncome, 0);

        $bracket = $this->resolveBracket($brackets, $taxableIncome);

        if (! $bracket) {
            return 0.0;
        }

        $tax = $bracket->BaseTax + (($taxableIncome - $bracket->ExcessBase) * $bracket->Rate);

        return round(max($tax, 0), 2);
    }

    protected function resolveBracket(Collection $brackets, float $taxableIncome): ?WTaxTable
    {
        return $brackets->first(
            fn(WTaxTable $b) => $b->MinIncome <= $taxableIncome
                && ($b->MaxIncome === null || $b->MaxIncome >= $taxableIncome)
        );
    }
}
