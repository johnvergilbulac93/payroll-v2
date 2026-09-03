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
        Schema::create('groups', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->timestamps();
        });
        Schema::create('positions', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->smallInteger('type')->nullable();
            $table->timestamps();
        });
        Schema::create('areas', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->smallInteger('type')->nullable();
            $table->timestamps();
        });

        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('EmpNbr', 15)->unique()->nullable();
            $table->foreignId('Group')->constrained('groups')->onDelete('cascade');
            $table->string('FirstName')->nullable();
            $table->string(column: 'MidName')->nullable();
            $table->string(column: 'LastName')->nullable();
            $table->string(column: 'Suffix')->nullable();
            $table->string(column: 'FullName')->nullable();
            $table->string(column: 'Address')->nullable();
            $table->string(column: 'CityProv')->nullable();
            $table->date(column: 'BirthDate')->nullable();
            $table->date(column: 'EmployDate')->nullable();
            $table->date(column: 'RegularDate')->nullable();
            $table->foreignId('Position')->constrained('positions')->onDelete('cascade');
            $table->foreignId('Assignment')->constrained('areas')->onDelete('cascade');
            $table->string(column: 'SalaryGrade')->nullable();
            $table->decimal('BasicPay', 10, 2)->nullable();
            $table->decimal('DailyRate', 10, 2)->nullable();
            $table->decimal('HourlyRate', 10, 2)->nullable();
            $table->boolean(column: 'Status')->default(true);
            $table->string(column: 'SSSNbr')->nullable();
            $table->string(column: 'PHICNbr')->nullable();
            $table->string(column: 'HDMFNbr')->nullable();
            $table->string(column: 'TIN')->nullable();
            $table->string(column: 'Degree')->nullable();
            $table->decimal('AllowReg', 10, 2)->nullable();
            $table->date(column: 'ResignDate')->nullable();
            $table->string(column: 'BPIATM')->nullable();
            $table->string(column: 'BPIEmpCode')->nullable();
            $table->string(column: 'PIN')->nullable();
            $table->string(column: 'PERAAID')->nullable();
            $table->string('BiometricID')->nullable();
            $table->string('DeductionStatus')->default('Half');
            $table->string('Image')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index('BiometricID');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
