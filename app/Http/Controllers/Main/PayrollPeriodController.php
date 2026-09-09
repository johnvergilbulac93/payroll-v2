<?php

namespace App\Http\Controllers\Main;

use App\Http\Controllers\Controller;
use App\Http\Requests\Main\PayrollPeriod\PayrollPeriodFormRequest;
use App\Http\Resources\Main\PayrollPeriod\PayrollPeriodResource;
use App\Http\Resources\Main\PayrollPeriod\PayrollPeriodResourceCollection;
use App\Models\CutOffDate;
use App\Models\Employee;
use App\Models\PayrollPeriod;
use App\Services\DTR\DtrLockService;
use App\Services\DTR\DtrViewerService;
use App\Services\DTR\DtrSummaryService;
use App\Services\Payroll\PayrollComputationService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PayrollPeriodController extends Controller
{
    public function __construct(
        protected DtrViewerService $dtrViewerService,
        protected DtrLockService $dtrLockService

    ) {}
    public function index(Request $request)
    {
        $limit = $request->input("limit");
        $query = PayrollPeriod::filter($request->only(['year', 'month', 'status', 'search']))
            ->with('cutoffDates')
            ->orderBy('id', 'asc')
            ->paginate($limit ?: 10)
            ->withQueryString(); // keep query string during pagination

        return Inertia::render(
            'payroll_period/payroll-period',
            [
                'payroll_periods' => Inertia::scroll(fn() => PayrollPeriodResourceCollection::make($query)),
                'cutoff_dates' => CutOffDate::select('id as value', 'Name as label')->get(),
            ]
        );
    }
    public function store(PayrollPeriodFormRequest $request)
    {
        $validated = $request->validated();
        $scheme = CutOffDate::findOrFail($validated['CutoffDateID']);

        PayrollPeriod::generateForYear((int) $validated['Year'], $scheme);

        return to_route('payroll_period.index')->with('success', "Periods for year {$validated['Year']} successfully generated.");
    }
    public function processIndex(PayrollPeriod $payrollPeriod)
    {
        $employee_details = $this->dtrViewerService->summary($payrollPeriod);
        return Inertia::render(
            'payroll_period/process-period',
            [
                'period' =>  PayrollPeriodResource::make($payrollPeriod)->resolve(),
                'employee_details' => $employee_details,

            ]
        );
    }

    public function lockPeriod(PayrollPeriod $payrollPeriod)
    {
        try {
            if ($payrollPeriod->Status === 'closed') {
                return back()->with(
                    'error',
                    'This payroll period has already been closed.',
                );
            }

            $validation = $this->dtrLockService->validate($payrollPeriod);

            if (!$validation['ready_to_lock']) {
                return back()->with(
                    'error',
                    'Cannot lock DTR — some employees are flagged or pending.',
                );
            }

            $this->dtrLockService->lock($payrollPeriod);

            $payrollPeriod->update(['Status' => 'processing']);

            return back()->with('success', 'DTR locked. Payroll computation can now proceed.');
        } catch (\Throwable $e) {
            Log::error('Failed to payroll computed.', [
                'exception' => $e,
            ]);
            return back()->with('error', 'Something went wrong.');
        }
    }

    public function computePayroll(
        PayrollPeriod $payrollPeriod,
        PayrollComputationService $payrollComputation,
        DtrSummaryService $dtrSummary,
    ) {

        try {
            $employees = Employee::where('Status', 1)->with('group')->get();

            $lookups = $payrollComputation->preloadLookups($payrollPeriod);

            DB::transaction(function () use ($employees, $payrollPeriod, $payrollComputation, $dtrSummary, $lookups) {
                foreach ($employees as $employee) {
                    $summary = $dtrSummary->buildFor($employee, $payrollPeriod);

                    $payrollComputation->computeForPeriod($employee, $payrollPeriod, $summary, $lookups);
                }
            });
            $this->dtrLockService->processed($payrollPeriod);
            $payrollPeriod->update(['Status' => 'closed']);

            return back()->with('success', 'Payroll computed for the period.');
        } catch (\Throwable $e) {
            Log::error('Failed to payroll computed.', [
                'exception' => $e,
            ]);
            return back()->with('error', 'Something went wrong.');
        }
    }

    public function releasedPayslip(PayrollPeriod $payrollPeriod)
    {

        try {
            $this->dtrLockService->paid($payrollPeriod);
            $payrollPeriod->update(['Status' => 'released']);
            return back()->with('success', 'Payslip released successfully.');
        } catch (\Throwable $e) {
            Log::error('Failed to release payslips.', [
                'exception' => $e,
            ]);
            return back()->with('error', 'Something went wrong.');
        }
    }
    public function reComputePayroll(
        PayrollPeriod $payrollPeriod,
        PayrollComputationService $payrollComputation,
        DtrSummaryService $dtrSummary,
    ) {
        try {
            $employees = Employee::where('Status', 1)->with('group')->get();

            $lookups = $payrollComputation->preloadLookups($payrollPeriod);

            DB::transaction(function () use ($employees, $payrollPeriod, $payrollComputation, $dtrSummary, $lookups) {
                foreach ($employees as $employee) {
                    $summary = $dtrSummary->buildFor($employee, $payrollPeriod);

                    $payrollComputation->computeForPeriod($employee, $payrollPeriod, $summary, $lookups);
                }
            });

            return back()->with('success', 'Payroll recomputed for the period.');
        } catch (\Throwable $e) {
            Log::error('Failed to payroll recomputed.', [
                'exception' => $e,
            ]);
            return back()->with('error', 'Something went wrong.');
        }
    }
}
