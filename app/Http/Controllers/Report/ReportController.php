<?php

namespace App\Http\Controllers\Report;

use App\Enums\Enums\PayrollPeriodStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\Main\PayrollComputation\PayslipResource;
use App\Http\Resources\Main\PayrollComputation\PayslipResourceCollection;
use App\Http\Resources\Main\PayrollPeriod\PayrollPeriodResource;
use App\Http\Resources\Main\ProcessDtr\ProcessDtrResourceCollection;
use App\Models\Employee;
use App\Models\Group;
use App\Models\PayrollComputation;
use App\Models\PayrollPeriod;
use App\Services\DTR\DtrViewerService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Pagination\LengthAwarePaginator;


class ReportController extends Controller
{
    public function __construct(
        protected DtrViewerService $dtrViewerService

    ) {}
    public function generateDtr(Request $request)
    {
        $periodID = $request->input('period');
        $groupId = $request->input('group');
        $search = $request->input('search');
        $limit = $request->input('limit');

        $periods = PayrollPeriodResource::collection(PayrollPeriod::whereIn('Status', [PayrollPeriodStatus::Closed, PayrollPeriodStatus::Released])->get())->resolve();
        $groups = Group::select('id as value', 'name as label')->get();

        $filter = [
            'period' => $periodID,
            'group' => $groupId,
            'search' => $search,
            'limit' => $limit
        ];

        if (!$periodID) {
            return Inertia::render(
                'report/report-dtr',
                [
                    'employees' =>  ProcessDtrResourceCollection::make(new LengthAwarePaginator([], 0, 10)),
                    'periods' =>  $periods,
                    'groups' =>  $groups,
                    'filter' => $filter

                ]
            );
        }
        $period = PayrollPeriod::findOrFail($periodID);
        $employees = $this->dtrViewerService->employees(
            period: $period,
            search: $search,
            groupId: $groupId,
            limit: $limit,
        );
        $this->dtrViewerService->attachDtrRecords(
            $employees,
            $period
        );
        return Inertia::render(
            'report/report-dtr',
            [
                'periods' => $periods,
                'groups' => $groups,
                'employees' =>  ProcessDtrResourceCollection::make($employees),
                'filter' => $filter
            ]
        );
    }

    public function printDtrPerEmployee(PayrollPeriod $period, Employee $employee)
    {

        $queryEmployee = $this->dtrViewerService->printingDtrEmployee(
            $period,
            $employee->id,
        );

        $this->dtrViewerService->attachDtrRecords(
            $queryEmployee,
            $period
        );
        $periodLabel = Carbon::parse($period->PeriodStart)->format('M d, Y')
            . ' to ' .
            Carbon::parse($period->PeriodEnd)->format('M d, Y');
        $data = [
            'company' => config('app.description'),
            'title' => 'DAILY TIME RECORD',
            'employee' => $employee->FullName ?? '',
            'period' => $periodLabel,
            'dtr_records' => $queryEmployee->first()->dtr_records ?? []
        ];

        $pdf = Pdf::loadView('pdf.dtr.per_employee', $data)
            ->setPaper([0, 0, 612, 420]);
        $safeFilename = str_replace(['/', '\\'], '-', $periodLabel);
        return $pdf->stream("{$safeFilename}.pdf");
    }
    public function printDtrAllEmployees(PayrollPeriod $period, Request $request)
    {
        $groupId = $request->integer('group_id') ?: null;

        $employees = $this->dtrViewerService->printingDtrAllEmployee(
            $period,
            $groupId,
        );
        $this->dtrViewerService->attachDtrRecords($employees, $period);

        $periodLabel = Carbon::parse($period->PeriodStart)->format('M d, Y')
            . ' to ' .
            Carbon::parse($period->PeriodEnd)->format('M d, Y');
        $data = [
            'company' => config('app.description'),
            'title' => 'DAILY TIME RECORD',
            'period' => $periodLabel,
            'employees' => $employees->map(function ($employee) {
                return [
                    'employee' => $employee->FullName ?? '',
                    'dtr_records' => $employee->dtr_records ?? [],
                ];
            }),
        ];

        $pdf = Pdf::loadView('pdf.dtr.all_employees', $data)
            ->setPaper([0, 0, 612, 420]);

        $safeFilename = str_replace(['/', '\\'], '-', $periodLabel);

        return $pdf->stream("{$safeFilename}.pdf");
    }

    public function generatePaySlip(Request $request)
    {
        $periods = PayrollPeriodResource::collection(PayrollPeriod::where('Status', PayrollPeriodStatus::Released)->get())->resolve();

        $payslip  = PayrollComputation::with(['employee.group', 'period'])
            ->filter($request->only(['period', 'search']))
            ->orderBy('created_at', 'desc')
            ->paginate($request->input('limit') ?: 10)
            ->onEachSide(1)
            ->withQueryString();

        return Inertia::render(
            'report/report-payslip',
            [
                'periods' => $periods,
                'payslips' => PayslipResourceCollection::make($payslip)
            ]
        );
    }
    public function printPayslipPerEmployee(Request $request)
    {
        $empId = $request->integer('employee') ?: null;

        $query = PayrollComputation::with(['employee.group', 'period'])
            ->when($empId, function ($query, $empId) {
                $query->where('EmpID', $empId);
            })
            ->get();
        $result = PayslipResource::collection($query)->resolve();

        $data = [
            'payslips' => $result,
            'company' => config('app.description')
        ];

        $pdf = Pdf::loadView('pdf.payslip.payslip_employee', $data)
            ->setPaper([0, 0, 380, 430]);

        // $safeFilename = str_replace(['/', '\\'], '-', $result['Cutoff']);

        return $pdf->stream("payslip_employee.pdf");
    }
}
