<?php

namespace App\Http\Controllers\Main;

use App\Http\Controllers\Controller;
use App\Http\Resources\Main\PayrollPeriod\PayrollPeriodResource;
use App\Http\Resources\Main\ProcessDtr\ProcessDtrResourceCollection;
use App\Models\PayrollPeriod;
use App\Services\DTR\DtrProcessorService;
use App\Services\DTR\DtrViewerService;
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
        $periodId =  $request->input('period');
        $periods =  PayrollPeriodResource::collection(PayrollPeriod::where('Status', 'open')->get())->resolve();

        if (!$periodId) {
            return Inertia::render('process_dtr/process-dtr', [
                'employees' => ProcessDtrResourceCollection::make(
                    new LengthAwarePaginator([], 0, 15)
                ),
                'periods' =>  $periods,
                'employee_details' =>
                $employee_details = [
                    ['label' => 'Employees', 'value' => (int) 0],
                    ['label' => 'Processed', 'value' => (int) 0],
                    ['label' => 'Flagged', 'value' => (int) 0],
                    ['label' => 'Pending', 'value' => (int) 0],
                ],
            ]);
        }
        $period = PayrollPeriod::findOrFail($periodId);
        $employees = $this->dtrViewerService->employees(
            $period,
            $search
        );
        $this->dtrViewerService->attachDtrRecords(
            $employees,
            $period
        );

        $employee_details = $this->dtrViewerService->summary($period);

        return Inertia::render(
            'process_dtr/process-dtr',
            [
                'employees' => ProcessDtrResourceCollection::make($employees),
                'periods' =>  $periods,
                'employee_details' => $employee_details,

            ]
        );
    }
}
