<?php

use App\Http\Controllers\Main\DeductionController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('deduction')->name('deduction.')->group(function () {
    Route::get('/', [DeductionController::class, 'index'])->name('index');
    Route::post('/', [DeductionController::class, 'store'])->name('store');
    Route::put('/{deductionMaster}', [DeductionController::class, 'update'])->name('update');
    Route::delete('/{deductionMaster}', [DeductionController::class, 'destroy'])->name('destroy');
});
