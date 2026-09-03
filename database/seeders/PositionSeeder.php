<?php

namespace Database\Seeders;

use App\Models\EmployeePosition;
use App\Models\Group;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PositionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $teaching = Group::where('name', 'Teaching')->first();
        $non_teaching = Group::where('name', 'Non-Teaching')->first();

        $positions = [
            ['name' => 'SAC', 'type' =>  $teaching->id, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Teacher', 'type' => $teaching->id, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Carpenter', 'type' =>  $non_teaching->id, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Cook', 'type' => $non_teaching->id, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Maintenance Staff', 'type' => $non_teaching->id, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Baker', 'type' => $non_teaching->id, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Laundry Staff', 'type' => $non_teaching->id, 'created_at' => now(), 'updated_at' => now()],
        ];

        EmployeePosition::insert($positions);
    }
}
