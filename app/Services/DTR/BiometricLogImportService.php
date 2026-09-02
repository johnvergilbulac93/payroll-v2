<?php

namespace App\Services\DTR;

use App\Models\BiometricImportBatch;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Throwable;

class BiometricLogImportService
{

    private const CHUNK_SIZE = 180;
    /**
     * Create a new class instance.
     */
    public function import(BiometricImportBatch $batch): BiometricImportBatch
    {
        $batch->update(['status' => 'processing', 'started_at' => now()]);

        try {
            $this->process($batch);

            $batch->update([
                'status' => 'completed',
                'finished_at' => now(),
            ]);
        } catch (Throwable $e) {
            $batch->update([
                'status' => 'failed',
                'finished_at' => now(),
                'error_message' => $e->getMessage(),
            ]);

            throw $e;
        }

        return $batch->fresh();
    }


    private function process(BiometricImportBatch $batch): void
    {
        $path = Storage::disk('local')->path($batch->stored_path);

        $handle = fopen($path, 'r');

        if ($handle === false) {
            throw new \RuntimeException("Unable to open stored file: {$batch->stored_path}");
        }

        $timestamp = Carbon::now();

        $totalRows = 0;
        $failed = 0;

        $buffer = [];

        while (($line = fgets($handle)) !== false) {

            $line = rtrim($line, "\r\n");

            if ($line === '') {
                continue;
            }

            $totalRows++;

            $row = $this->parseLine($line, $timestamp);

            if ($row === null) {
                $failed++;
                continue;
            }

            $row['import_batch_id'] = $batch->id;

            $buffer[] = $row;

            if (count($buffer) >= self::CHUNK_SIZE) {

                DB::table('biometric_raw_logs')->insert($buffer);

                $buffer = [];

                $batch->update([
                    'total_rows' => $totalRows,
                    'failed_rows' => $failed,
                ]);
            }
        }

        if (!empty($buffer)) {
            DB::table('biometric_raw_logs')->insert($buffer);
        }

        fclose($handle);

        $batch->update([
            'total_rows' => $totalRows,
            'failed_rows' => $failed,
        ]);

        // Process the imported rows
        $this->processRawLogs($batch);
    }
    private function parseLine(string $line, Carbon $timestamp): ?array
    {
        $columns = preg_split('/\t+/', trim($line));

        if (count($columns) < 6) {
            return null;
        }

        [$deviceUserId, $punchTime, $status, $verifyMode, $ioState, $reserved] = $columns;

        if (! ctype_digit($deviceUserId)) {
            return null;
        }

        try {
            $parsedTime = Carbon::createFromFormat('Y-m-d H:i:s', $punchTime);
        } catch (Throwable) {
            return null;
        }

        return [
            'device_user_id' => (int) $deviceUserId,
            'punch_time'     => $parsedTime,
            'status'         => (int) $status,
            'verify_mode'    => (int) $verifyMode,
            'io_state'       => (int) $ioState,
            'reserved'       => (int) $reserved,
            'raw_line'       => mb_substr($line, 0, 255),
            'created_at'     => $timestamp,
            'updated_at'     => $timestamp,
        ];
    }

    private function processRawLogs(BiometricImportBatch $batch): void
    {
        DB::transaction(function () use ($batch) {

            /*
        |--------------------------------------------------------------------------
        | Insert new logs
        |--------------------------------------------------------------------------
        */
            $imported = DB::affectingStatement(
                "
            INSERT INTO biometric_logs
            (
                raw_log_id,
                employee_id,
                device_user_id,
                punch_time,
                status,
                verify_mode,
                io_state,
                reserved,
                created_at,
                updated_at
            )
            SELECT
                r.id,
                e.id,
                r.device_user_id,
                r.punch_time,
                r.status,
                r.verify_mode,
                r.io_state,
                r.reserved,
                GETDATE(),
                GETDATE()
            FROM biometric_raw_logs r
            INNER JOIN employees e
                ON e.BiometricID = r.device_user_id
            WHERE
                r.import_batch_id = ?
                AND NOT EXISTS
                (
                    SELECT 1
                    FROM biometric_logs b
                    WHERE b.device_user_id = r.device_user_id
                    AND b.punch_time = r.punch_time
                )
            ",
                [$batch->id]
            );

            /*
        |--------------------------------------------------------------------------
        | Mark all raw logs in this batch as processed
        |--------------------------------------------------------------------------
        */
            DB::statement("
            UPDATE r
            SET imported_at = GETDATE()
            FROM biometric_raw_logs r
            WHERE
                r.import_batch_id = ?
                AND r.imported_at IS NULL
                AND EXISTS
                (
                    SELECT 1
                    FROM biometric_logs b
                    WHERE b.raw_log_id = r.id
                )
        ", [$batch->id]);

            /*
        |--------------------------------------------------------------------------
        | Batch statistics
        |--------------------------------------------------------------------------
        */

            // Total rows in this batch
            // $total = DB::table('biometric_raw_logs')
            //     ->where('import_batch_id', $batch->id)
            //     ->count();

            // Successfully imported
            $imported = DB::table('biometric_logs')
                ->whereIn('raw_log_id', function ($query) use ($batch) {
                    $query->select('id')
                        ->from('biometric_raw_logs')
                        ->where('import_batch_id', $batch->id);
                })
                ->count();

            // Employee not found
            $skipped = DB::table('biometric_raw_logs as r')
                ->leftJoin('employees as e', 'e.BiometricID', '=', 'r.device_user_id')
                ->where('r.import_batch_id', $batch->id)
                ->whereNull('e.id')
                ->count();

            // Duplicate rows
            $duplicates = DB::table('biometric_raw_logs as r')
                ->join('employees as e', 'e.BiometricID', '=', 'r.device_user_id')
                ->where('r.import_batch_id', $batch->id)
                ->whereExists(function ($query) {
                    $query->select(DB::raw(1))
                        ->from('biometric_logs as b')
                        ->whereColumn('b.device_user_id', 'r.device_user_id')
                        ->whereColumn('b.punch_time', 'r.punch_time')
                        ->whereColumn('b.raw_log_id', '<>', 'r.id');
                })
                ->count();

            $batch->update([
                'imported_rows'  => $imported,
                'skipped_rows'   => $skipped,
                'duplicate_rows' => $duplicates,
            ]);
        });
    }

    public function reprocess(BiometricImportBatch $batch): void
    {
        DB::transaction(function () use ($batch) {

            /*
            |--------------------------------------------------------------------------
            | Import rows that:
            |   1. Have a matching employee
            |   2. Have never been imported before
            |   3. Are not duplicates in biometric_logs
            |--------------------------------------------------------------------------
            */

            DB::statement("
            INSERT INTO biometric_logs
            (
                raw_log_id,
                employee_id,
                device_user_id,
                punch_time,
                status,
                verify_mode,
                io_state,
                reserved,
                created_at,
                updated_at
            )
            SELECT
                r.id,
                e.id,
                r.device_user_id,
                r.punch_time,
                r.status,
                r.verify_mode,
                r.io_state,
                r.reserved,
                GETDATE(),
                GETDATE()
            FROM biometric_raw_logs r
            INNER JOIN employees e
                ON e.BiometricID = r.device_user_id
            WHERE
                r.import_batch_id = ?
                AND r.imported_at IS NULL
                AND NOT EXISTS
                (
                    SELECT 1
                    FROM biometric_logs b
                    WHERE b.raw_log_id = r.id
                )
                AND NOT EXISTS
                (
                    SELECT 1
                    FROM biometric_logs b
                    WHERE b.device_user_id = r.device_user_id
                    AND b.punch_time = r.punch_time
                )
        ", [$batch->id]);

            /*
            |--------------------------------------------------------------------------
            | Mark successfully imported raw logs
            |--------------------------------------------------------------------------
            */

            DB::statement("
            UPDATE r
            SET imported_at = GETDATE()
            FROM biometric_raw_logs r
            WHERE
                r.import_batch_id = ?
                AND r.imported_at IS NULL
                AND EXISTS
                (
                    SELECT 1
                    FROM biometric_logs b
                    WHERE b.raw_log_id = r.id
                )
        ", [$batch->id]);

            /*
            |--------------------------------------------------------------------------
            | Statistics
            |--------------------------------------------------------------------------
            */

            $imported = DB::table('biometric_logs')
                ->whereIn('raw_log_id', function ($query) use ($batch) {
                    $query->select('id')
                        ->from('biometric_raw_logs')
                        ->where('import_batch_id', $batch->id);
                })
                ->count();

            $skipped = DB::table('biometric_raw_logs as r')
                ->leftJoin('employees as e', 'e.BiometricID', '=', 'r.device_user_id')
                ->where('r.import_batch_id', $batch->id)
                ->whereNull('e.id')
                ->count();

            $duplicates = DB::table('biometric_raw_logs as r')
                ->join('employees as e', 'e.BiometricID', '=', 'r.device_user_id')
                ->where('r.import_batch_id', $batch->id)
                ->whereExists(function ($query) {
                    $query->select(DB::raw(1))
                        ->from('biometric_logs as b')
                        ->whereColumn('b.device_user_id', 'r.device_user_id')
                        ->whereColumn('b.punch_time', 'r.punch_time')
                        ->whereColumn('b.raw_log_id', '<>', 'r.id');
                })
                ->count();

            $batch->update([
                'imported_rows' => $imported,
                'skipped_rows' => $skipped,
                'duplicate_rows' => $duplicates,
            ]);
        });
    }
}
