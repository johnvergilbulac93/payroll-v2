<?php

namespace Database\Seeders;

use App\Models\CutOffDate;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CutOffDateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        CutOffDate::create([
            'Name' => 'Salary Period 15-30',
            'Cutoff1StartDay' => 26,
            'Cutoff1EndDay' => 10,
            'Cutoff2StartDay' => 11,
            'Cutoff2EndDay' => 25,
            'IsActive' => 1
        ]);
    }
}
