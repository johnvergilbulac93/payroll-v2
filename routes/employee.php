<?php

use App\Http\Controllers\Main\EmployeeController;
use App\Http\Controllers\Main\ScheduleController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('employee')->name('employee.')->group(function () {

    Route::get('/', [EmployeeController::class, 'index'])->name('index');

    Route::get('/create', [EmployeeController::class, 'create'])->name('create');
    Route::post('/', [EmployeeController::class, 'store'])->name('store');

    Route::get('/{employee}/show', [EmployeeController::class, 'show'])->name('show');

    Route::post('/{employee}', [EmployeeController::class, 'update'])->name('update');
    Route::delete('/{employee}', [EmployeeController::class, 'destroy'])->name('destroy');

    Route::get('/schedule/{employee}/setup', [ScheduleController::class, 'indexSchedule'])->name('scheduleIndex');
    Route::post('/schedule/{employee}/setup', [ScheduleController::class, 'storeSchedule'])->name('scheduleStore');
});
