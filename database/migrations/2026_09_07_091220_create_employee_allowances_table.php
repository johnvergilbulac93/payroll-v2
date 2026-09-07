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
        Schema::create('employee_allowances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('EmpID')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('AllowanceTypeID')->constrained('allowance_types');
            $table->decimal('Amount', 10, 2);
            $table->date('EffectiveDate')->nullable();
            $table->boolean('Status')->default(true);
            $table->timestamps();
            $table->unique(['EmpID', 'AllowanceTypeID']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_allowances');
    }
};
