<?php

use App\Http\Controllers\Main\BiometricUploadingController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('uploading')->controller(BiometricUploadingController::class)->name('uploading.')->group(function () {
    Route::get('/', 'index')->name('index');
    Route::post('/', 'store')->name('store');
    Route::post('/{biometricImportBatch}/reprocess', 'reProcessBiometricData')->name('reprocess');
    Route::delete('/{biometricImportBatch}', 'destroy')->name('destroy');
});
