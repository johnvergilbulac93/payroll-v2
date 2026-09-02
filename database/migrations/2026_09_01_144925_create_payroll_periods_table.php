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
        Schema::create('cutoff_dates', function (Blueprint $table) {
            $table->id();
            $table->string('Name');              // "Semi-monthly 24-8"
            $table->unsignedTinyInteger('Cutoff1StartDay');
            $table->unsignedTinyInteger('Cutoff1EndDay');
            $table->unsignedTinyInteger('Cutoff2StartDay');
            $table->unsignedTinyInteger('Cutoff2EndDay');
            $table->boolean('IsActive')->default(true);
            $table->softDeletes();
            $table->timestamps();
        });
        Schema::create('payroll_periods', function (Blueprint $table) {
            $table->id();
            $table->year('Year');
            $table->unsignedTinyInteger('Month');          // 1-12
            $table->unsignedTinyInteger('CutoffNumber');   // 1 = first half, 2 = second half
            $table->foreignId('CutoffDateID')
                ->constrained('cutoff_dates', 'id')->cascadeOnDelete();
            $table->date('PeriodStart');
            $table->date('PeriodEnd');
            $table->date('PayDate');                       // when salary is actually released
            $table->enum('Status', [
                'open',       // DTR still being collected/edited
                'processing', // DTR locked, payroll being computed
                'closed',     // payroll finalized/released
            ])->default('open');
            $table->timestamps();

            $table->unique(['Year', 'Month', 'CutoffNumber', 'CutoffDateID']);
        });
        Schema::create('shift_codes', function (Blueprint $table) {
            $table->id();
            $table->string('Name');
            $table->time('TimeIn')->nullable();
            $table->time('TimeOut')->nullable();
            $table->unsignedSmallInteger('BreakMinutes')->default(60);
            $table->unsignedSmallInteger('GracePeriodMinutes')->default(0);
            $table->boolean('CrossesMidNight')->default(false);
            $table->boolean('IsWorkingDay')->default(true);
            $table->decimal('TotalHours', 4, 2)->nullable();
            $table->boolean('IsActive')->default(true);
            $table->softDeletes();
            $table->timestamps();
        });
        Schema::create('dtr_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('EmpID')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('ShiftCodeID')->nullable()->constrained('shift_codes');
            $table->date('DTRDate');
            $table->dateTime('IN')->nullable();
            $table->dateTime('OUT')->nullable();
            $table->decimal('OvertimeHours', 5, 2)->default(0);
            $table->decimal('RenderedHours', 5, 2)->default(0);
            $table->decimal('DaysWorked', 5, 4)->default(0);
            $table->decimal('LateMinutes', 5, 2)->default(0);
            $table->decimal('UndertimeMinutes', 5, 2)->default(0);
            $table->string('Remarks')->nullable();
            $table->enum('PayrollStatus', [
                'pending',
                'locked',
                'processed',
                'paid',
            ])->default('pending');
            $table->foreignId('PayrollPeriodID')
                ->nullable()
                ->constrained('payroll_periods');
            $table->timestamps();

            $table->unique(['EmpID', 'DTRDate']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cutoff_dates');
        Schema::dropIfExists('payroll_periods');
        Schema::dropIfExists('shift_codes');
        Schema::dropIfExists('dtr_records');
    }
};
