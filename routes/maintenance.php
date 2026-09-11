<?php

use App\Http\Controllers\Maintenance\ActivityLogController;
use App\Http\Controllers\Maintenance\AreaOfAssignmentController;
use App\Http\Controllers\Maintenance\GroupController;
use App\Http\Controllers\Maintenance\HolidayController;
use App\Http\Controllers\Maintenance\LoanTypeController;
use App\Http\Controllers\Maintenance\PositionController;
use App\Http\Controllers\Settings\MaintenanceController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('maintenance')->name('maintenance.')->group(function () {
    Route::get('/activity-logs', [ActivityLogController::class, 'index'])->name('activity_logs.index');

    Route::resource('loan_type', LoanTypeController::class)
        ->except(['create', 'edit', 'show']);
    Route::resource('group', GroupController::class)
        ->except(['create', 'edit', 'show']);
    Route::resource('position', PositionController::class)
        ->except(['create', 'edit', 'show']);
    Route::resource('area_of_assignment', AreaOfAssignmentController::class)
        ->except(['create', 'edit', 'show']);
    Route::resource('holiday', HolidayController::class)
        ->except(['create', 'edit', 'show']);

    Route::post('/group/option', [MaintenanceController::class, 'storeGroup'])->name('storeGroup');
    Route::post('/position/option', [MaintenanceController::class, 'storePosition'])->name('storePosition');
    Route::post('/area/option', [MaintenanceController::class, 'storeArea'])->name('storeArea');
});
