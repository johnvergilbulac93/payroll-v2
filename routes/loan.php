<?php

use App\Http\Controllers\Main\LoanController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('loan')->name('loan.')->group(function () {
    Route::get('/', [LoanController::class, 'index'])->name('index');
    Route::post('/', [LoanController::class, 'store'])->name('store');
    Route::put('/{loanMaster}', [LoanController::class, 'update'])->name('update');
    Route::delete('/{loanMaster}', [LoanController::class, 'destroy'])->name('destroy');
});
