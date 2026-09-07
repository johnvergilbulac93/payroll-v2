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
        Schema::create('overload_rate_configs', function (Blueprint $table) {
            $table->id();
            $table->decimal('BaseMonthlyRate', 10, 2)->nullable();
            $table->decimal('OverloadPercent', 5, 2)->default(12.50);
            $table->boolean('Status')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('overload_rate_configs');
    }
};
