<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DeductionTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $deductionTypes = [
            ['name' => 'SSS', 'frequency' => '15'],
            ['name' => 'SSS loan', 'frequency' => '15'],
            ['name' => 'Philhealth', 'frequency' => '15'],
            ['name' => 'Pag-IBIG (HDMF)', 'frequency' => '30'],
            ['name' => 'Pag-IBIG loan', 'frequency' => '00'],
            ['name' => 'PERAA Premium', 'frequency' => '30'],
            ['name' => 'PERAA Loan', 'frequency' => '00'],
            ['name' => 'Withholding tax', 'frequency' => '00'],
        ];

        foreach ($deductionTypes as $deductionType) {
            DB::table('deduction_types')->updateOrInsert(
                ['name' => $deductionType['name']],
                $deductionType + [
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            );
        }
    }
}
