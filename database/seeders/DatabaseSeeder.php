<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $this->call([
            PermissionSeeder::class,
            RoleSeeder::class,
            UserSeeder::class,
            GroupSeeder::class,
            LoanTypeSeeder::class,
            ShiftSeeder::class,
            PositionSeeder::class,
            AreaAssignmentSeeder::class,
            CutOffDateSeeder::class,
            WTaxTableSeeder::class,
            SSSContributionBracketSeeder::class,
            PhilHealthContributionSeeder::class,

        ]);
    }
}
