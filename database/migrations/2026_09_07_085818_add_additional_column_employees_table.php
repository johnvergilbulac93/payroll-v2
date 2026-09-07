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
        Schema::table('employees', function (Blueprint $table) {
            $table->enum('EmploymentStatus', ['regular', 'probationary'])->nullable()->after('Image'); // non-teaching
            $table->enum('TenureStatus', ['tenured', 'non_tenured'])->nullable();      // teaching
            $table->boolean('IsLETPasser')->nullable();                               // teaching
            $table->unsignedSmallInteger('DailyRateDivisor')->default(365);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            // Drop the field if rolled back
            $table->dropColumn([
                'EmploymentStatus',
                'TenureStatus',
                'IsLETPasser',
                'DailyRateDivisor',
            ]);
        });
    }
};
