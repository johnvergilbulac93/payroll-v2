<?php

namespace Database\Seeders;

use App\Models\ShiftCode;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ShiftSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $shifts = [
            [
                'Name' => 'Regular Shift (8:00am - 5:00pm)',
                'TimeIn' => '08:00:00',
                'TimeOut' => '17:00:00',
                'BreakMinutes' => 60,
                'GracePeriodMinutes' => 0,
                'CrossesMidNight' => false,
                'IsWorkingDay' => true,
                'TotalHours' => 8.00,
            ],
            [
                'Name' => 'Rest Day',
                'TimeIn' => null,
                'TimeOut' => null,
                'BreakMinutes' => 0,
                'GracePeriodMinutes' => 0,
                'CrossesMidNight' => false,
                'IsWorkingDay' => false,
                'TotalHours' => 0,
            ],
        ];

        foreach ($shifts as $shift) {
            ShiftCode::updateOrCreate(['Name' => $shift['Name']], $shift);
        }
    }
}
