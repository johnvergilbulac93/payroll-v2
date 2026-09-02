<?php

use App\Http\Controllers\Settings\AccessControl\AccessControlController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('access_control')->name('access_control.')->group(function () {
    Route::get('/', [AccessControlController::class, 'index'])->name('index');

    Route::get('/user/permission/{user}', [AccessControlController::class, 'getUserPermission'])->name('userPermission');
    Route::post('/user/permission/{user}', [AccessControlController::class, 'updateUserPermission'])->name('updateUserPermission');

    Route::post('/role/permission/{role}', [AccessControlController::class, 'updateRolePermission'])->name('updateRolePermission');
});
