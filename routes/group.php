<?php

use App\Http\Controllers\Setting\Group\GroupController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('group')->name('group.')->group(function () {

    Route::post('/', [GroupController::class, 'store'])->name('store');
});
