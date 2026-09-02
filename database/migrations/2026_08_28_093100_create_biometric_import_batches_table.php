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
        Schema::create('biometric_import_batches', function (Blueprint $table) {
            $table->id();
            $table->string('original_filename');
            $table->string('stored_path');
            $table->foreignId('uploaded_by')->constrained('users')->cascadeOnDelete();

            // enum kept as string for sqlsrv portability
            $table->string('status', 20)->default('pending'); // pending|processing|completed|failed

            $table->unsignedInteger('total_rows')->default(0);
            $table->unsignedInteger('imported_rows')->default(0);
            $table->unsignedInteger('skipped_rows')->default(0);
            $table->unsignedInteger('failed_rows')->default(0);
            $table->unsignedInteger('duplicate_rows')->default(0);

            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->text('error_message')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index('status');
            $table->index('uploaded_by');
        });

        Schema::create('biometric_raw_logs', function (Blueprint $table) {
            $table->id();

            $table->foreignId('import_batch_id')
                ->constrained('biometric_import_batches')
                ->cascadeOnDelete();

            // Raw device PIN/User ID as printed in the log file (column 1).
            // NOT a foreign key by itself — device IDs are reused across
            // devices/sites, so resolution to an employee happens via
            // employees.biometric_id + optional device scoping.
            $table->unsignedInteger('device_user_id');

            // Resolved employee — nullable until matched. Nullable FK lets
            // us import first and reconcile unmatched punches afterward
            // rather than losing raw data on a failed match.
            $table->dateTime('punch_time'); // column 2

            $table->unsignedTinyInteger('status')->default(1);      // column 3
            $table->unsignedTinyInteger('verify_mode')->default(0); // column 4: 0=fingerprint,1=password,2=card...
            $table->unsignedTinyInteger('io_state')->default(1);    // column 5: 1=normal,15=OT, device-specific
            $table->unsignedTinyInteger('reserved')->default(0);    // column 6: unused, kept for fidelity

            // Original tab-delimited line, for audit/reprocessing if the
            // parsing rules change later.
            $table->string('raw_line', 255)->nullable();
            $table->timestamp('imported_at')->nullable();
            $table->timestamps();

            $table->index(['device_user_id', 'punch_time']);
            $table->index('imported_at');
        });
        Schema::create('biometric_logs', function (Blueprint $table) {
            $table->id();

            $table->foreignId('raw_log_id')
                ->constrained('biometric_raw_logs')
                ->cascadeOnDelete();

            // Raw device PIN/User ID as printed in the log file (column 1).
            // NOT a foreign key by itself — device IDs are reused across
            // devices/sites, so resolution to an employee happens via
            // employees.biometric_id + optional device scoping.
            $table->unsignedInteger('device_user_id');

            // Resolved employee — nullable until matched. Nullable FK lets
            // us import first and reconcile unmatched punches afterward
            // rather than losing raw data on a failed match.
            $table->foreignId('employee_id')->nullable()
                ->constrained('employees')->nullOnDelete();

            $table->dateTime('punch_time'); // column 2

            $table->unsignedTinyInteger('status')->default(1);      // column 3
            $table->unsignedTinyInteger('verify_mode')->default(0); // column 4: 0=fingerprint,1=password,2=card...
            $table->unsignedTinyInteger('io_state')->default(1);    // column 5: 1=normal,15=OT, device-specific
            $table->unsignedTinyInteger('reserved')->default(0);    // column 6: unused, kept for fidelity

            // Original tab-delimited line, for audit/reprocessing if the
            // parsing rules change later.

            $table->timestamps();
            $table->unique('raw_log_id');
            $table->unique([
                'device_user_id',
                'punch_time',
            ]);

            $table->index(['employee_id', 'punch_time']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('biometric_import_batches');
        Schema::dropIfExists('biometric_logs_raw');
        Schema::dropIfExists('biometric_logs');
    }
};
