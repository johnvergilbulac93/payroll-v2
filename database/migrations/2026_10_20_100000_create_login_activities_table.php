<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('login_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('username')->nullable();
            $table->string('event', 40)->index();
            $table->string('session_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('failure_reason')->nullable();
            $table->timestamps();

            $table->index(['created_at', 'event']);
            $table->index(['username', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('login_activities');
    }
};
