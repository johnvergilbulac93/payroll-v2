<?php

namespace Database\Seeders;

use App\Models\LoanType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class LoanTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = now();

        $loanTypes = collect([
            'SSS Salary Loan',
            'SSS Calamity Loan',
            'PAG-IBIG Loan',
            'PERAA Loan',
            'CA SALARY/PERSONAL',
            'CA - HEALTH CARD',
            'CA - SCHOLARSHIP',
            'CA - Others',
        ])->map(fn($type) => [
            'name' => $type,
            'created_at' => $now,
            'updated_at' => $now,
        ])->toArray();

        LoanType::insert($loanTypes);
    }
}
