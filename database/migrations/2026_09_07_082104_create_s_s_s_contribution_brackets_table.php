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
        Schema::create('sss_contribution_brackets', function (Blueprint $table) {
            $table->id();
            $table->decimal('CompensationFrom', 12, 2);
            $table->decimal('CompensationTo', 12, 2)->nullable(); // null = open-ended (35,000 MSC bracket)

            // Monthly Salary Credit this range maps to
            $table->decimal('MonthlySalaryCreditRegularSS', 10, 2);
            $table->decimal('MonthlySalaryCreditMpf', 10, 2)->default(0);
            $table->decimal('MonthlySalaryCreditTotal', 10, 2);

            // Employer side
            $table->decimal('EmployerRegularSS', 10, 2);
            $table->decimal('EmployerMpf', 10, 2)->default(0);
            $table->decimal('EmployerEc', 10, 2);
            $table->decimal('EmployerTotal', 10, 2);

            // Employee side
            $table->decimal('EmployeeRegularSS', 10, 2);
            $table->decimal('EmployeeMpf', 10, 2)->default(0);
            $table->decimal('EmployeeTotal', 10, 2);

            // Combined
            $table->decimal('GrandTotal', 10, 2);

            $table->smallInteger('EffectiveYear')->default(2025);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sss_contribution_brackets');
    }
};
