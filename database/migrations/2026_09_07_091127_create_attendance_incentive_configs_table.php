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
        Schema::create('attendance_incentive_configs', function (Blueprint $table) {
            $table->id();
            $table->enum('EmployeeCategory', ['teaching', 'non_teaching']);
            $table->foreignId('GroupID')->constrained('groups')->onDelete('cascade');
            $table->string('StatusKey')->nullable(); // tenured/non_tenured OR regular/probationary
            $table->decimal('Amount', 10, 2);
            $table->boolean('Status')->default(true);
            $table->timestamps();
            $table->unique(['EmployeeCategory', 'StatusKey']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendance_incentive_configs');
    }
};
