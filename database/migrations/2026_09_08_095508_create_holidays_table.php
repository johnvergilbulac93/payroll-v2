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
        Schema::create('holidays', function (Blueprint $table) {
            $table->id();
            $table->string('Name', 150);
            $table->date('Date');
            $table->enum('HolidayType', [
                'regular',
                'special_non_working',
                'special_working'
            ]); 
            $table->boolean('IsRecurring')->default(false);
            $table->unique(['Date', 'Name']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('holidays');
    }
};
