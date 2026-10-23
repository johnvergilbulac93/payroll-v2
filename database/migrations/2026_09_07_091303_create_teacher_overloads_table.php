<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// REVIEW: Potential cleanup candidate — TeacherOverload model currently has no implementation.
// Verify controller, service, and direct DB query usage before removing this migration/table.
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Schema::create('teacher_overloads', function (Blueprint $table) {
        //     $table->id();
        //     $table->foreignId('EmpID')->constrained('employees')->cascadeOnDelete();
        //     $table->foreignId('PayrollPeriodID')->constrained('payroll_periods');
        //     $table->decimal('ExcessLoadUnits', 5, 2);
        //     $table->decimal('RatePerExcess', 10, 2);
        //     $table->decimal('TotalOverloadPay', 10, 2);
        //     $table->timestamps();
        // });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teacher_overloads');
    }
};
