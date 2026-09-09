<?php

use App\Http\Controllers\Report\ReportController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('report')->name('report.')->group(function () {
    Route::get('/generate/dtr', [ReportController::class, 'generateDtr'])->name('generateDtr');
});
