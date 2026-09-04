<?php

use App\Http\Controllers\Main\EmployeeScheduleController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('employee_schedule')->name('employee_schedule.')->group(function () {
    Route::get('/', [EmployeeScheduleController::class, 'index'])->name('index');
    Route::post('/', [EmployeeScheduleController::class, 'store'])->name('store');
    Route::delete('/{scheduleTemplate}', [EmployeeScheduleController::class, 'destroy'])->name('destroy');

    Route::post('/per_date', [EmployeeScheduleController::class, 'storePerDate'])->name('storePerDate');
    Route::delete('/per_date/{employeeSchedule}', [EmployeeScheduleController::class, 'destroyPerDate'])->name('destroyPerDate');
});
