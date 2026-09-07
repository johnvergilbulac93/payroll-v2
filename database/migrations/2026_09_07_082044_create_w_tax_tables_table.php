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
        Schema::create('w_tax_tables', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('BracketOrder');
            $table->decimal('MinIncome', 12, 2);
            $table->decimal('MaxIncome', 12, 2)->nullable();
            $table->decimal('BaseTax', 12, 2)->default(0);
            $table->decimal('ExcessBase', 12, 2)->default(0);
            $table->decimal('Rate', 5, 4);
            $table->year('EffectiveYear')->default(2026);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('w_tax_tables');
    }
};
