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
        Schema::create('deduction_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('frequency');
            $table->timestamps();
        });
        Schema::create('deduction_masters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('DeductionTypeId')->constrained('deduction_types')->onDelete('cascade');
            $table->foreignId('EmpID')->constrained('employees')->onDelete('cascade');
            $table->decimal('OrigBal', 10, 2);
            $table->decimal('DedAmt', 10, 2);
            $table->date('StartDate');
            $table->string('Frequency')->nullable();
            $table->decimal('BalanceAmt', 10, 2);
            $table->decimal('BalanceasofDate', 10, 2)->nullable();
            $table->date('Crtd_Date')->nullable();
            $table->string('Crtd_User')->nullable();
            $table->date('LUpd_Date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deduction_masters');
        Schema::dropIfExists('deduction_types');
    }
};
