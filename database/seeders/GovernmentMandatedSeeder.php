<?php

namespace Database\Seeders;

use App\Models\GovernmentMandated;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class GovernmentMandatedSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $government_mandated = [
            ['Code' => 'PHILHEALTH', 'Description' => 'PHILHEALTH Premium', 'ValueType' => 'Percentage', 'DefaultValue' => (float)5.5, 'created_at' => now(), 'updated_at' => now()],
            ['Code' => 'Pag-IBIG', 'Description' => 'Pag-IBIG Contribution', 'ValueType' => 'Fixed-Amount', 'DefaultValue' => (float)100, 'created_at' => now(), 'updated_at' => now()],
            ['Code' => 'SSS', 'Description' => 'SSS Contribution', 'ValueType' => 'Table-Based', 'DefaultValue' => (float) 0, 'created_at' => now(), 'updated_at' => now()],
            ['Code' => 'W/TAX', 'Description' => 'Withholding Tax', 'ValueType' => 'Table-Based', 'DefaultValue' => (float) 0, 'created_at' => now(), 'updated_at' => now()],
        ];
        GovernmentMandated::insert($government_mandated);
    }
}
