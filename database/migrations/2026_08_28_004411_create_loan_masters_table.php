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
        Schema::create('loan_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });
        Schema::create('loan_masters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('LoanTypeID')->constrained('loan_types')->onDelete('cascade');
            $table->string('EmpNbr');
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
        Schema::dropIfExists('loan_masters');
    }
};
