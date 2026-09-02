<?php

use App\Http\Controllers\Setting\Group\GroupController;
use App\Http\Controllers\Settings\LoanType\LoanTypeController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('loan_type')->name('loan_type.')->group(function () {

    Route::post('/', [LoanTypeController::class, 'store'])->name('store');
});
