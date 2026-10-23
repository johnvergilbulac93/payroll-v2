<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// REVIEW: Potential cleanup candidate — RetroAdjustment model currently has no implementation.
// Verify controller, service, and direct DB query usage before removing this migration/table.
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Schema::create('retro_adjustments', function (Blueprint $table) {
        //     $table->id();
        //     $table->foreignId('EmpID')->constrained('employees')->cascadeOnDelete();
        //     $table->foreignId('PayrollPeriodID')->constrained('payroll_periods');
        //     $table->enum('Type', ['SIA', 'BasicPay']);
        //     $table->decimal('Amount', 10, 2);
        //     $table->string('Reason')->nullable();
        //     $table->timestamps();
        // });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('retro_adjustments');
    }
};
