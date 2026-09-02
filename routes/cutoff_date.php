<?php

use App\Http\Controllers\Main\CutOffController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('cutoff')->name('cutoff.')->group(function () {
    Route::get('/', [CutOffController::class, 'index'])->name('index');
    Route::post('/', [CutOffController::class, 'store'])->name('store');
    Route::put('/{cutoffDate}', [CutOffController::class, 'update'])->name('update');
    Route::delete('/{cutoffDate}', [CutOffController::class, 'destroy'])->name('destroy');
});
