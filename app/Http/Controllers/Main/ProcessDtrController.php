<?php

namespace App\Http\Controllers\Main;

use App\Enums\Enums\PayrollPeriodStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\Main\PayrollPeriod\PayrollPeriodResource;
use App\Http\Resources\Main\ProcessDtr\ProcessDtrResourceCollection;
use App\Models\Employee;
use App\Models\PayrollPeriod;
use App\Services\DTR\DtrProcessorService;
use App\Services\DTR\DtrViewerService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
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
            $limit
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
            return to_route('dtr.index', ['period' => $payrollPeriod->id])
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
