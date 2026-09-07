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
        Schema::create('payroll_computations', function (Blueprint $table) {
            $table->id();
            // Identity
            $table->foreignId('EmpID')->constrained('employees');
            $table->foreignId('PayrollPeriodID')->constrained('payroll_periods');

            // Base pay
            $table->decimal('BasicPay', 10, 2);
            $table->decimal('OvertimePay', 10, 2)->default(0);
            $table->decimal('LateDeduction', 10, 2)->default(0);
            $table->decimal('UndertimeDeduction', 10, 2)->default(0);

            // Allowances / incentives
            $table->decimal('TotalAllowances', 10, 2)->default(0);
            $table->decimal('PerfectAttendanceIncentive', 10, 2)->default(0);

            // Absences
            $table->decimal('AbsenceDeduction', 10, 2)->default(0);

            // Retro adjustments
            $table->decimal('RetroAdjSIA', 10, 2)->default(0);
            $table->decimal('RetroAdjBP', 10, 2)->default(0);

            // Government contributions
            $table->decimal('SSSContribution', 10, 2)->default(0);
            $table->decimal('PhilHealthContribution', 10, 2)->default(0);
            $table->decimal('PagIbigContribution', 10, 2)->default(0);
            $table->decimal('WithholdingTax', 10, 2)->default(0);

            // HMO
            $table->decimal('HMOPremium', 10, 2)->default(0);

            // Loans
            $table->decimal('TotalLoanDeductions', 10, 2)->default(0);

            // Totals
            $table->decimal('TaxableIncome', 10, 2)->default(0);
            $table->decimal('GrossPay', 10, 2)->default(0);
            $table->decimal('NetPay', 10, 2)->default(0);

            $table->unique(['EmpID', 'PayrollPeriodID']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payroll_computations');
    }
};
