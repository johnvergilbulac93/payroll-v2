<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropUnique('employees_empnbr_unique');
        });

        DB::statement('CREATE UNIQUE INDEX employees_empnbr_unique ON employees (EmpNbr) WHERE EmpNbr IS NOT NULL');
    }

    public function down(): void
    {
        DB::statement('DROP INDEX employees_empnbr_unique ON employees');

        Schema::table('employees', function (Blueprint $table) {
            $table->unique('EmpNbr', 'employees_empnbr_unique');
        });
    }
};
