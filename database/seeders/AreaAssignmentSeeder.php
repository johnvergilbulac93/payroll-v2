<?php

namespace Database\Seeders;

use App\Models\AreaAssignment;
use App\Models\Group;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AreaAssignmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $teaching = Group::where('name', 'Teaching')->first();
        $non_teaching = Group::where('name', 'Non-Teaching')->first();

        $areas = [
            ['name' => 'TLE-JHS', 'type' => $teaching->id, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'MAPEH', 'type' => $teaching->id, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Mathematics', 'type' => $teaching->id, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Araling Panlipunan', 'type' => $teaching->id, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Science', 'type' => $teaching->id, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'English', 'type' => $teaching->id, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Carpentry', 'type' => $non_teaching->id, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Small Kitchen', 'type' => $non_teaching->id, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Maintenance', 'type' => $non_teaching->id, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Bakery', 'type' => $non_teaching->id, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Laundry', 'type' => $non_teaching->id, 'created_at' => now(), 'updated_at' => now()],
        ];

        AreaAssignment::insert($areas);
    }
}
