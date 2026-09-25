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
        Schema::create('payroll_summaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('EmpID')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('PayrollPeriodID')->constrained('payroll_periods')->cascadeOnDelete();

            $table->decimal('TotalWorkingDays', 8, 4)->default(0);
            $table->decimal('Absences', 8, 4)->default(0);
            $table->unsignedInteger('Tardiness')->default(0); // minutes
            $table->decimal('OTHours', 8, 2)->default(0);
            $table->decimal('NDHours', 8, 2)->default(0);
            $table->decimal('RegularHoliday', 8, 4)->default(0); // days
            $table->decimal('SpecialHoliday', 8, 4)->default(0); // days
            $table->decimal('SL', 8, 4)->default(0); // days
            $table->decimal('VL', 8, 4)->default(0); // days

            $table->timestamps();

            $table->unique(['EmpID', 'PayrollPeriodID']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payroll_summaries');
    }
};
