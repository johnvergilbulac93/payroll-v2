<?php

namespace App\Http\Controllers\Main;

use App\Enums\Enums\PayrollPeriodStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\Main\PayrollPeriod\PayrollPeriodResource;
use App\Http\Resources\Main\ProcessDtr\ProcessDtrResourceCollection;
use App\Models\Employee;
use App\Models\PayrollPeriod;
use App\Models\ShiftCode;
use App\Http\Resources\Main\Shift\ShiftResource;
use App\Services\DTR\DtrProcessorService;
use App\Services\DTR\DtrViewerService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProcessDtrController extends Controller
{
    public function __construct(
        protected DtrProcessorService $dtrProcessor,
        protected DtrViewerService $dtrViewerService

    ) {}

    public function index(Request $request)
    {
        $search = $request->input('search');
        $limit = $request->input('limit');
        $status = $request->input('status');
        $periodId =  $request->input('period');
        $periods =  PayrollPeriodResource::collection(PayrollPeriod::where('Status', PayrollPeriodStatus::Open)->get())->resolve();

        if (!$periodId) {
            return Inertia::render(
                'process_dtr/process-dtr',
                [
                    'employees' =>  ProcessDtrResourceCollection::make(new LengthAwarePaginator([], 0, 10)),
                    'periods' =>  $periods,

                ]
            );
        }
        $period = PayrollPeriod::findOrFail($periodId);
        $employees = $this->dtrViewerService->employees(
            $period,
            $search,
            $limit,
            null,
            in_array($status, ['no_entry', 'flagged', 'processed'], true) ? $status : null
        );
        $this->dtrViewerService->attachDtrRecords(
            $employees,
            $period
        );


        return Inertia::render(
            'process_dtr/process-dtr',
            [
                'employees' => ProcessDtrResourceCollection::make($employees),
                'periods' =>  $periods,

            ]
        );
    }
    public function employeeAttendance(PayrollPeriod $payrollPeriod, Employee $employee)
    {
        $attendance = $this->dtrViewerService->employeeAttendance(
            $payrollPeriod,
            $employee->id
        );

        $attendance['shiftCodes'] = ShiftResource::collection(ShiftCode::get())->resolve();

        return Inertia::render('process_dtr/employee-attendance-logs', $attendance);
    }

    public function addMissingPunch(Request $request, PayrollPeriod $payrollPeriod, Employee $employee)
    {
        $validated = $request->validate([
            'date' => ['required', 'date', 'date_format:Y-m-d'],
            'dtr_record_id' => ['nullable', 'integer', 'min:1'],
            'time' => ['required', 'date_format:H:i'],
            'type' => ['required', 'in:IN,OUT'],
        ]);

        if (strtolower((string) $payrollPeriod->Status) === 'closed') {
            return back()->withErrors(['date' => 'This payroll period is closed. Missing punches cannot be added.']);
        }

        $date = Carbon::parse($validated['date'])->toDateString();
        if ($date < Carbon::parse($payrollPeriod->PeriodStart)->toDateString() || $date > Carbon::parse($payrollPeriod->PeriodEnd)->toDateString()) {
            return back()->withErrors(['date' => 'Choose a date within this payroll period.']);
        }

        $punchTime = Carbon::parse($date.' '.$validated['time']);

        try {
            DB::transaction(function () use ($employee, $payrollPeriod, $date, $punchTime, $validated) {
                $recordQuery = DB::table('dtr_records')
                    ->where('EmpID', $employee->id)
                    ->where('PayrollPeriodID', $payrollPeriod->id)
                    ->whereDate('DTRDate', $date);

                // Prefer the primary key supplied by the selected DTR row.
                if (! empty($validated['dtr_record_id'])) {
                    $recordQuery->where('id', $validated['dtr_record_id']);
                }

                $record = $recordQuery->lockForUpdate()->first();

                $remarks = strtolower((string) ($record->Remarks ?? ''));
                $isMissingIn = $record && $record->IN === null && $record->OUT !== null && str_contains($remarks, 'assumed out');
                $isMissingOut = $record && $record->IN !== null && $record->OUT === null && str_contains($remarks, 'assumed in');

                if (! $record || ($validated['type'] === 'IN' && ! $isMissingIn) || ($validated['type'] === 'OUT' && ! $isMissingOut)) {
                    throw new \RuntimeException('Add IN to a flagged “assumed OUT” record or OUT to a flagged “assumed IN” record.');
                }

                if (isset($record->PayrollStatus) && strtolower((string) $record->PayrollStatus) !== 'pending') {
                    throw new \RuntimeException('This DTR record is already processed or locked and cannot be corrected.');
                }

                if ($validated['type'] === 'IN') {
                    $existingOut = Carbon::parse($record->OUT);
                    if ($punchTime->greaterThanOrEqualTo($existingOut)) {
                        throw new \RuntimeException('The missing IN time must be earlier than the existing OUT punch.');
                    }
                } else {
                    $existingIn = Carbon::parse($record->IN);
                    if ($punchTime->lessThanOrEqualTo($existingIn)) {
                        throw new \RuntimeException('The missing OUT time must be later than the existing IN punch.');
                    }
                }

                $punchDateTime = $punchTime->format('Y-m-d H:i:s');
                $duplicate = DB::table('biometric_logs')
                    ->where('employee_id', $employee->id)
                    ->where('punch_time', $punchDateTime)
                    ->exists();

                if ($duplicate) {
                    throw new \RuntimeException('A biometric punch already exists at that date and time.');
                }

                // Keep corrections in the same source table used by the DTR processor.
                // biometric_logs requires a raw-log parent, so create an auditable
                // synthetic import batch and raw-log row as well.
                $now = now();
                $deviceUserId = $employee->BiometricID;

                if (! is_numeric($deviceUserId) || (int) $deviceUserId < 0) {
                    throw new \RuntimeException('This employee does not have a valid numeric BiometricID, so the punch cannot be saved to biometric_logs.');
                }

                $batchId = DB::table('biometric_import_batches')->insertGetId([
                    'original_filename' => 'manual-missing-punch-'.$employee->id.'-'.$date.'.txt',
                    'stored_path' => 'manual-corrections/'.$employee->id.'/'.$date,
                    'uploaded_by' => auth()->id(),
                    'status' => 'completed',
                    'total_rows' => 1,
                    'imported_rows' => 1,
                    'skipped_rows' => 0,
                    'failed_rows' => 0,
                    'duplicate_rows' => 0,
                    'started_at' => $now,
                    'finished_at' => $now,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);

                $rawLine = implode("\t", [
                    (string) (int) $deviceUserId,
                    $punchDateTime,
                    '1',
                    '0',
                    '1',
                    '0',
                ]);

                $rawLogId = DB::table('biometric_raw_logs')->insertGetId([
                    'import_batch_id' => $batchId,
                    'device_user_id' => (int) $deviceUserId,
                    'punch_time' => $punchDateTime,
                    'status' => 1,
                    'verify_mode' => 0,
                    'io_state' => 1,
                    'reserved' => 0,
                    'raw_line' => mb_substr($rawLine.' | Manual '.$validated['type'].' correction', 0, 255),
                    'imported_at' => $now,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);

                DB::table('biometric_logs')->insert([
                    'raw_log_id' => $rawLogId,
                    'employee_id' => $employee->id,
                    'device_user_id' => (int) $deviceUserId,
                    'punch_time' => $punchDateTime,
                    'status' => 1,
                    'verify_mode' => 0,
                    'io_state' => 1,
                    'reserved' => 0,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);

                // Rebuild this employee's DTR from biometric_logs, including the correction.
                $this->dtrProcessor->processEmployeeForPeriod($employee, $payrollPeriod);

                $punchColumn = $validated['type'] === 'OUT' ? 'OUT' : 'IN';
                $refreshedRecord = DB::table('dtr_records')
                    ->where('EmpID', $employee->id)
                    ->where('PayrollPeriodID', $payrollPeriod->id)
                    ->whereDate('DTRDate', $date)
                    ->first(['id', $punchColumn]);

                if (! $refreshedRecord || ! $refreshedRecord->{$punchColumn}
                    || Carbon::parse($refreshedRecord->{$punchColumn})->format('H:i:s') !== $punchTime->format('H:i:s')) {
                    throw new \RuntimeException("The punch was saved, but reprocessing did not produce the expected {$validated['type']} time in dtr_records.");
                }
            });
        } catch (\RuntimeException $e) {
            return back()->withErrors(['date' => $e->getMessage()]);
        }

        activity('dtr-manual-correction')
            ->performedOn($payrollPeriod)
            ->causedBy(auth()->user())
            ->event('missing_punch_added')
            ->withProperties([
                'employee_id' => $employee->id,
                'employee_name' => $employee->FullName,
                'punch_time' => $punchTime->toDateTimeString(),
                'punch_type' => $validated['type'],
            ])
            ->log('Manual missing '.$validated['type'].' punch added and DTR reprocessed.');

        return back()->with('success', 'Missing '.$validated['type'].' punch added, recorded for audit, and DTR reprocessed successfully.');
    }

    public function updatePayrollSummary(Request $request, PayrollPeriod $payrollPeriod, Employee $employee)
    {
        $validated = $request->validate([
            'TotalWorkingDays' => ['required', 'numeric', 'min:0'],
            'Absences' => ['required', 'numeric', 'min:0'],
            'Tardiness' => ['required', 'numeric', 'min:0'],
            'OTHours' => ['required', 'numeric', 'min:0'],
            'NDHours' => ['required', 'numeric', 'min:0'],
            'RegularHoliday' => ['required', 'numeric', 'min:0'],
            'SpecialHoliday' => ['required', 'numeric', 'min:0'],
            'SL' => ['required', 'numeric', 'min:0'],
            'VL' => ['required', 'numeric', 'min:0'],
        ]);

        $summaryQuery = DB::table('payroll_summaries')
            ->where('EmpID', $employee->id)
            ->where('PayrollPeriodID', $payrollPeriod->id);

        if ($summaryQuery->exists()) {
            $summaryQuery->update([
                ...$validated,
                'updated_at' => now(),
            ]);
        } else {
            DB::table('payroll_summaries')->insert([
                'EmpID' => $employee->id,
                'PayrollPeriodID' => $payrollPeriod->id,
                ...$validated,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return back()->with('success', 'Payroll summary updated successfully.');
    }

    public function processDTRPeriod(PayrollPeriod $payrollPeriod)
    {
        $start = Carbon::parse($payrollPeriod->PeriodStart)->format('M d, Y');
        $end = Carbon::parse($payrollPeriod->PeriodEnd)->format('M d, Y');
        try {

            $this->dtrProcessor->processPayrollPeriod($payrollPeriod);
            activity('dtr-processing')
                ->performedOn($payrollPeriod)
                ->causedBy(auth()->user())
                ->event('dtr_processing')
                ->withProperties([$payrollPeriod])
                ->log("DTR processed for period {$start} - {$end}");
            return to_route('dtr.index', ['period' => $payrollPeriod->id])
                ->with('success', "DTR process for period {$start} - {$end} completed.");
        } catch (\RuntimeException $e) {
            activity('dtr-processing-failed')
                ->performedOn($payrollPeriod)
                ->causedBy(auth()->user())
                ->event('dtr_processing')
                ->withProperties(['error_message' => $e->getMessage()])
                ->log("DTR processed for period {$start} - {$end}");
            return back()->with('error', $e->getMessage());
        }
    }
    public function processDTREmployee(PayrollPeriod $payrollPeriod, Employee $employee)
    {
        try {
            $this->dtrProcessor->processEmployeeForPeriod($employee, $payrollPeriod);
            activity('dtr-processing')
                ->performedOn($payrollPeriod)
                ->causedBy(auth()->user())
                ->event('dtr_processing')
                ->withProperties(['employee' => $employee, 'period' => $payrollPeriod])
                ->log("DTR per employee processed for period {$payrollPeriod->PeriodStart} - {$payrollPeriod->PeriodEnd}");
            return back()
                ->with('success', "DTR reprocessed for {$employee->FullName} completed.");
        } catch (\RuntimeException $e) {
            activity('dtr-per-employee-processing-failed')
                ->performedOn($payrollPeriod)
                ->causedBy(auth()->user())
                ->event('dtr_processing')
                ->withProperties(['employee' => $employee, 'period' => $payrollPeriod])
                ->log("DTR per employee processed for period {$payrollPeriod->PeriodStart} - {$payrollPeriod->PeriodEnd}");
            return back()->with('error', $e->getMessage());
        }
    }
}
