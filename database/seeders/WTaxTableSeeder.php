<?php

namespace Database\Seeders;

use App\Models\WTaxTable;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class WTaxTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $brackets = [
            ['BracketOrder' => 1, 'MinIncome' => 0,        'MaxIncome' => 20833,   'BaseTax' => 0,         'ExcessBase' => 0,      'Rate' => 0.00],
            ['BracketOrder' => 2, 'MinIncome' => 20833.01, 'MaxIncome' => 33332,   'BaseTax' => 0,         'ExcessBase' => 20833,  'Rate' => 0.15],
            ['BracketOrder' => 3, 'MinIncome' => 33333,    'MaxIncome' => 66666,   'BaseTax' => 1875.00,   'ExcessBase' => 33333,  'Rate' => 0.20],
            ['BracketOrder' => 4, 'MinIncome' => 66667,    'MaxIncome' => 166666,  'BaseTax' => 8541.80,   'ExcessBase' => 66667,  'Rate' => 0.25],
            ['BracketOrder' => 5, 'MinIncome' => 166667,   'MaxIncome' => 666666,  'BaseTax' => 33541.80,  'ExcessBase' => 166667, 'Rate' => 0.30],
            ['BracketOrder' => 6, 'MinIncome' => 666667,   'MaxIncome' => null,    'BaseTax' => 183541.80, 'ExcessBase' => 666667, 'Rate' => 0.35],
        ];

        foreach ($brackets as $bracket) {
            WTaxTable::updateOrCreate(
                ['BracketOrder' => $bracket['BracketOrder'], 'EffectiveYear' => 2026],
                $bracket
            );
        }
    }
}
