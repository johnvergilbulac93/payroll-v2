<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('government_mandateds', function (Blueprint $table) {
            $table->id();
            $table->string('Code')->unique();
            $table->string('Description');
            $table->string('ValueType')->nullable();
            $table->decimal('DefaultValue', 10, 2)->nullable();
            $table->string('File')->nullable();
            $table->boolean('Status')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('government_mandateds');
    }
};
