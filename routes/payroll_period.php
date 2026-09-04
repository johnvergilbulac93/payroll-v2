<?php

use App\Http\Controllers\Main\PayrollPeriodController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('payroll_period')->name('payroll_period.')->group(function () {
    Route::get('/', [PayrollPeriodController::class, 'index'])->name('index');
    Route::post('/', [PayrollPeriodController::class, 'store'])->name('store');
    Route::put('/{payrollPeriod}', [PayrollPeriodController::class, 'update'])->name('update');
    Route::delete('/{payrollPeriod}', [PayrollPeriodController::class, 'destroy'])->name('destroy');

    Route::get('/process/{payrollPeriod}', [PayrollPeriodController::class, 'processIndex'])->name('processIndex');
});
