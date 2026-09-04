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
                'Name' => 'Regular Shift (7:20am - 4:30pm)',
                'TimeIn' => '07:20:00',
                'TimeOut' => '16:30:00',
                'BreakMinutes' => 70,
                'GracePeriodMinutes' => 0,
                'CrossesMidNight' => false,
                'IsWorkingDay' => true,
                'TotalHours' => 8.00,
            ],
            [
                'Name' => 'Regular Shift (7:25am - 4:30pm)',
                'TimeIn' => '07:25:00',
                'TimeOut' => '16:30:00',
                'BreakMinutes' => 65,
                'GracePeriodMinutes' => 0,
                'CrossesMidNight' => false,
                'IsWorkingDay' => true,
                'TotalHours' => 8.00,
            ],
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
                'Name' => 'Regular Shift (7:00am - 4:00pm)',
                'TimeIn' => '07:00:00',
                'TimeOut' => '16:00:00',
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
