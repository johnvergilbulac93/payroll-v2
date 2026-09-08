<?php

namespace Database\Seeders;

use App\Enums\HolidayType;
use App\Models\Holiday;
use Illuminate\Database\Seeder;

class HolidaySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $year = now()->year;

        $holidays = [
            ['name' => "New Year's Day", 'month' => 1, 'day' => 1, 'type' => HolidayType::Regular],
            ['name' => 'Araw ng Kagitingan', 'month' => 4, 'day' => 9, 'type' => HolidayType::Regular],
            ['name' => 'Labor Day', 'month' => 5, 'day' => 1, 'type' => HolidayType::Regular],
            ['name' => 'Independence Day', 'month' => 6, 'day' => 12, 'type' => HolidayType::Regular],
            ['name' => 'Bonifacio Day', 'month' => 11, 'day' => 30, 'type' => HolidayType::Regular],
            ['name' => 'Christmas Day', 'month' => 12, 'day' => 25, 'type' => HolidayType::Regular],
            ['name' => "Rizal Day", 'month' => 12, 'day' => 30, 'type' => HolidayType::Regular],
            ['name' => 'Ninoy Aquino Day', 'month' => 8, 'day' => 21, 'type' => HolidayType::SpecialNonWorking],
            ["name" => "All Saints' Day", 'month' => 11, 'day' => 1, 'type' => HolidayType::SpecialNonWorking],
            ['name' => 'Feast of the Immaculate Conception', 'month' => 12, 'day' => 8, 'type' => HolidayType::SpecialNonWorking],
            ['name' => "Last Day of the Year", 'month' => 12, 'day' => 31, 'type' => HolidayType::SpecialNonWorking],
        ];

        foreach ($holidays as $holiday) {
            Holiday::firstOrCreate(
                [
                    'Name' => $holiday['name'],
                    'Date' => sprintf('%d-%02d-%02d', $year, $holiday['month'], $holiday['day']),
                ],
                [
                    'HolidayType' => $holiday['type'],
                    'IsRecurring' => true,
                ]
            );
        }
    }
}
