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
        Schema::create('employee_schedule_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('EmpID')->constrained('employees')->cascadeOnDelete();
            $table->unsignedTinyInteger('DayOfWeek');
            $table->foreignId('ShiftCodeID')->constrained('shift_codes')->cascadeOnDelete();
            $table->timestamps();
            $table->index(['EmpID', 'DayOfWeek']);
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_schedule_templates');
    }
};
