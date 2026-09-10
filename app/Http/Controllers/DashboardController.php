<?php

namespace App\Http\Controllers;

use App\Enums\Enums\PayrollPeriodStatus;
use App\Models\Employee;
use App\Models\LoanMaster;
use App\Models\PayrollPeriod;
use App\Models\User;
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


        return Inertia::render('dashboard', [
            'employees' => $employees,
            'periods' => $periods,
            'loans' => $loans,
            'users' => $users
        ]);
    }
}
