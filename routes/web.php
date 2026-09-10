<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/user.php';
require __DIR__ . '/role.php';
require __DIR__ . '/access_control.php';
require __DIR__ . '/employee.php';
require __DIR__ . '/loan.php';
require __DIR__ . '/loan_type.php';
require __DIR__ . '/biometric.php';
require __DIR__ . '/shift_code.php';
require __DIR__ . '/cutoff_date.php';
require __DIR__ . '/payroll_period.php';
require __DIR__ . '/dtr.php';
require __DIR__ . '/schedule_employee.php';
require __DIR__ . '/maintenance.php';
require __DIR__ . '/report.php';
