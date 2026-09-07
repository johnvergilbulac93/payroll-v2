<?php

namespace Database\Seeders;

use App\Models\PhilHealthContribution;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PhilHealthContributionSeeder extends Seeder
{
    private const YEAR = 2025; // premium rate frozen at 5% for 2024-2025 under the UHC Act

    private const PREMIUM_RATE = 0.05;       // 5% total premium
    private const EMPLOYEE_SHARE_RATE = 0.025; // 2.5% employee share
    private const EMPLOYER_SHARE_RATE = 0.025; // 2.5% employer share

    private const SALARY_FLOOR = 10000.00;
    private const SALARY_CEILING = 100000.00;

    public function run(): void
    {
        PhilHealthContribution::updateOrCreate(
            ['EffectiveYear' => self::YEAR],
            [
                'PremiumRate' => self::PREMIUM_RATE,
                'EmployeeShareRate' => self::EMPLOYEE_SHARE_RATE,
                'EmployerShareRate' => self::EMPLOYER_SHARE_RATE,
                'SalaryFloor' => self::SALARY_FLOOR,
                'SalaryCeiling' => self::SALARY_CEILING,
                'Status' => true,
            ]
        );
    }
}
