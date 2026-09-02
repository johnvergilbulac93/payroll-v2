<?php

use App\Http\Controllers\Main\ShiftController;
use App\Http\Controllers\Settings\User\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('shift')->name('shift.')->group(function () {
    Route::get('/', [ShiftController::class, 'index'])->name('index');
    Route::post('/', [ShiftController::class, 'store'])->name('store');
    Route::put('/{shift}', [ShiftController::class, 'update'])->name('update');
    Route::delete('/{shift}', [ShiftController::class, 'destroy'])->name('destroy');
});
