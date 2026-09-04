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
        Schema::create('employee_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('EmpID')->constrained('employees')->cascadeOnDelete();
            $table->enum('ScheduleType', ['default', 'per_date', 'date_range']);
            $table->foreignId('ShiftCodeID')->nullable()->constrained('shift_codes'); // null = day off
            $table->date('EffectiveFrom')->nullable(); // for per_date, this IS the date
            $table->date('EffectiveTo')->nullable(); // null for default/per_date; required for date_range
            $table->string('Remarks')->nullable();
            $table->boolean('IsActive')->default(true);
            $table->timestamps();

            $table->index(['EmpID', 'ScheduleType']);
            $table->index(['EmpID', 'ScheduleType','EffectiveFrom']);

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_schedules');
    }
};
