<?php

namespace App\Http\Controllers;

use App\Enums\Enums\PayrollPeriodStatus;
use App\Models\Employee;
use App\Models\LoanMaster;
use App\Models\PayrollComputation;
use App\Models\PayrollPeriod;
use App\Models\User;
use Spatie\Activitylog\Models\Activity;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $employees = Employee::where('Status', 1)->count();
        $periods = PayrollPeriod::where('Status', PayrollPeriodStatus::Open)->where('Year', now()->year)->count();
        $loans = LoanMaster::count();
        $users = User::where('IsActive', 1)->count();

        $payrollByMonth = PayrollComputation::query()
            ->with('period:id,Year,Month')
            ->whereHas('period', fn ($query) => $query->where('Year', now()->year))
            ->get()
            ->groupBy(fn (PayrollComputation $payroll) => $payroll->period?->Month)
            ->map(fn ($payrolls) => $payrolls->count());

        $payrollOverview = collect(range(1, 12))
            ->map(fn (int $month) => [
                'month' => now()->setMonth($month)->format('M'),
                'payroll' => $payrollByMonth->get($month, 0),
            ])
            ->values();

        $recentActivities = Activity::with('causer')
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn (Activity $activity) => [
                'id' => $activity->id,
                'event' => $activity->event,
                'description' => $activity->description,
                'subject' => $activity->subject_type
                    ? class_basename($activity->subject_type)
                    : null,
                'subject_id' => $activity->subject_id,
                'causer' => $activity->causer?->name ?? 'System',
                'created_at' => $activity->created_at?->diffForHumans(),
                'changes' => $activity->attribute_changes,
                'properties' => $activity->properties,
            ]);

        return Inertia::render('dashboard', [
            'employees' => $employees,
            'periods' => $periods,
            'loans' => $loans,
            'users' => $users,
            'payrollOverview' => $payrollOverview,
            'recentActivities' => $recentActivities,
        ]);
    }
}
