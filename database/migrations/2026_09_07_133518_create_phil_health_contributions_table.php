<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('philhealth_contributions', function (Blueprint $table) {
            $table->id();
            $table->unsignedSmallInteger('EffectiveYear');
            $table->decimal('PremiumRate', 5, 4);        // e.g. 0.0500 = 5%
            $table->decimal('EmployeeShareRate', 5, 4);  // e.g. 0.0250 = 2.5%
            $table->decimal('EmployerShareRate', 5, 4);  // e.g. 0.0250 = 2.5%
            $table->decimal('SalaryFloor', 10, 2);        // min monthly basic salary the rate applies to
            $table->decimal('SalaryCeiling', 10, 2);      // max monthly basic salary the rate applies to
            $table->boolean('Status')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('phil_health_contributions');
    }
};
