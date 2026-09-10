<?php

use App\Http\Controllers\Report\ReportController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('report')->name('report.')->group(function () {
    Route::get('/dtr', [ReportController::class, 'generateDtr'])->name('generateDtr');
    Route::get('/dtr/{period}/{employee}', [ReportController::class, 'printDtrPerEmployee'])->name('printDtrPerEmployee');
    Route::get('/dtr/{period}', [ReportController::class, 'printDtrAllEmployees'])->name('printDtrAllEmployees');

    Route::get('/payslip', [ReportController::class, 'generatePaySlip'])->name('generatePaySlip');
    Route::get('/payslip/per_employee', [ReportController::class, 'printPayslipPerEmployee'])->name('printPayslipPerEmployee');
});
