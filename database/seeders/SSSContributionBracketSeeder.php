<?php

namespace Database\Seeders;

use App\Models\SSSContributionBracket;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SSSContributionBracketSeeder extends Seeder
{
    private const YEAR = 2025; // rate schedule effective Jan 2025, still current as of mid-2026
    private const REGULAR_RATE = 0.10; // employer share of Regular SS
    private const REGULAR_RATE_EE = 0.05; // employee share of Regular SS
    private const MPF_RATE = 0.10; // employer share of MPF
    private const MPF_RATE_EE = 0.05; // employee share of MPF
    private const MIN_MSC = 5000.00;
    private const MAX_MSC = 35000.00;
    private const MPF_THRESHOLD = 20000.00; // MSC portion above this goes to MPF instead of Regular SS
    private const EC_THRESHOLD = 15000.00; // MSC at/above this pays the higher EC fee
    private const EC_LOW = 10.00;
    private const EC_HIGH = 30.00;
    private const STEP = 500.00;

    public function run(): void
    {
        SSSContributionBracket::where('EffectiveYear', self::YEAR)->delete();

        $rows = [];
        $msc = self::MIN_MSC;

        while ($msc <= self::MAX_MSC) {
            $isFirst = $msc === self::MIN_MSC;
            $isLast = $msc === self::MAX_MSC;

            $compFrom = $isFirst ? 1.00 : $msc - 250.00;
            $compTo = $isLast ? null : $msc + 249.99;

            $rows[] = $this->buildRow($compFrom, $compTo, $msc);

            $msc += self::STEP;
        }

        SSSContributionBracket::insert($rows);
    }
    private function buildRow(float $compFrom, ?float $compTo, float $msc): array
    {
        $regularBasis = min($msc, self::MPF_THRESHOLD);
        $mpfBasis = max(0, $msc - self::MPF_THRESHOLD);

        $erRegular = round($regularBasis * self::REGULAR_RATE, 2);
        $eeRegular = round($regularBasis * self::REGULAR_RATE_EE, 2);
        $erMpf = round($mpfBasis * self::MPF_RATE, 2);
        $eeMpf = round($mpfBasis * self::MPF_RATE_EE, 2);
        $ec = $msc >= self::EC_THRESHOLD ? self::EC_HIGH : self::EC_LOW;

        $erTotal = $erRegular + $erMpf + $ec;
        $eeTotal = $eeRegular + $eeMpf;

        return [
            'CompensationFrom' => $compFrom,
            'CompensationTo' => $compTo,
            'MonthlySalaryCreditRegularSS' => $regularBasis,
            'MonthlySalaryCreditMpf' => $mpfBasis,
            'MonthlySalaryCreditTotal' => $msc,
            'EmployerRegularSS' => $erRegular,
            'EmployerMpf' => $erMpf,
            'EmployerEc' => $ec,
            'EmployerTotal' => $erTotal,
            'EmployeeRegularSS' => $eeRegular,
            'EmployeeMpf' => $eeMpf,
            'EmployeeTotal' => $eeTotal,
            'GrandTotal' => $erTotal + $eeTotal,
            'EffectiveYear' => self::YEAR,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
