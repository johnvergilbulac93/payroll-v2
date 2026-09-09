<?php

namespace App\Http\Controllers\Main;

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
        $periods =  PayrollPeriodResource::collection(PayrollPeriod::get())->resolve();

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
        try {
            $start = Carbon::parse($payrollPeriod->PeriodStart)->format('M d, Y');
            $end = Carbon::parse($payrollPeriod->PeriodEnd)->format('M d, Y');
            $this->dtrProcessor->processPayrollPeriod($payrollPeriod);
            return to_route('dtr.index', ['period' => $payrollPeriod->id])
                ->with('success', "DTR process for period {$start} - {$end} completed.");
        } catch (\RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }
    }
    public function processDTREmployee(PayrollPeriod $payrollPeriod, Employee $employee)
    {
        try {
            $this->dtrProcessor->processEmployeeForPeriod($employee, $payrollPeriod);
            return to_route('dtr.index', ['period' => $payrollPeriod->id])
                ->with('success', "DTR reprocessed for {$employee->FullName} completed.");
        } catch (\RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
