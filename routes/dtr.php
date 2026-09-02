<?php

use App\Http\Controllers\Main\ProcessDtrController;
use App\Http\Controllers\Settings\User\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('dtr')->name('dtr.')->group(function () {
    Route::get('/', [ProcessDtrController::class, 'index'])->name('index');
    Route::post('/', [ProcessDtrController::class, 'store'])->name('store');
    Route::put('/{payrollPeriod}', [ProcessDtrController::class, 'update'])->name('update');
    Route::delete('/{payrollPeriod}', [ProcessDtrController::class, 'destroy'])->name('destroy');
});
