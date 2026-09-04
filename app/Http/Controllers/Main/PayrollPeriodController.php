<?php

namespace App\Http\Controllers\Main;

use App\Http\Controllers\Controller;
use App\Http\Requests\Main\PayrollPeriod\PayrollPeriodFormRequest;
use App\Http\Resources\Main\PayrollPeriod\PayrollPeriodResourceCollection;
use App\Models\CutOffDate;
use App\Models\PayrollPeriod;
use App\Services\DTR\DtrViewerService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PayrollPeriodController extends Controller
{
    public function __construct(
        protected DtrViewerService $dtrViewerService

    ) {}
    public function index(Request $request)
    {
        $limit = $request->input("limit");
        $query = PayrollPeriod::filter($request->only(['Year', 'Month']))
            ->with('cutoffDates')
            // ->where('month', Carbon::now()->month)
            // ->where('year', Carbon::now()->year)
            ->orderBy('id', 'asc')
            ->paginate($limit ?? 10)
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
                'period' =>  $payrollPeriod,
                'employee_details' => $employee_details,

            ]
        );
    }
}
