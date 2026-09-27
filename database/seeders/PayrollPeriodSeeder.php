<?php

namespace Database\Seeders;

use App\Models\CutOffDate;
use App\Models\PayrollPeriod;
use Illuminate\Database\Seeder;

class PayrollPeriodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $cutoffDate = CutOffDate::query()
            ->where('IsActive', true)
            ->firstOrFail();

        PayrollPeriod::generateForYear(2026, $cutoffDate);
    }
}
