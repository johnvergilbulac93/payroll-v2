<?php

namespace App\Http\Controllers\Report;

use App\Enums\Enums\PayrollPeriodStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\Main\PayrollPeriod\PayrollPeriodResource;
use App\Http\Resources\Main\ProcessDtr\ProcessDtrResourceCollection;
use App\Models\Employee;
use App\Models\Group;
use App\Models\PayrollPeriod;
use App\Services\DTR\DtrViewerService;
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

        $periods = PayrollPeriodResource::collection(PayrollPeriod::where('Status', PayrollPeriodStatus::Released)->get())->resolve();
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
}
