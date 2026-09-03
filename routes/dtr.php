<?php

use App\Http\Controllers\Main\ProcessDtrController;
use App\Http\Controllers\Settings\User\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('dtr')->name('dtr.')->group(function () {
    Route::get('/', [ProcessDtrController::class, 'index'])->name('index');
    Route::post('/{payrollPeriod}', [ProcessDtrController::class, 'processDTRPeriod'])->name('processDTRPeriod');
    Route::post('/period/{payrollPeriod}/employee/{employee}/dtr', [ProcessDtrController::class, 'processDTREmployee'])->name('processPerEmployee');
});
