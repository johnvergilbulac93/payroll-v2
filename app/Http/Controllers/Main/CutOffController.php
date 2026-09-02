<?php

namespace App\Http\Controllers\Main;

use App\Http\Controllers\Controller;
use App\Http\Requests\Main\CutOff\CutOffFormRequest;
use App\Http\Resources\Main\CutOff\CutOffResourceCollection;
use App\Models\CutOffDate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CutOffController extends Controller
{
    public function index(Request $request)
    {
        $limit = $request->input("limit");
        $query = CutOffDate::filter($request->only(['search']))
            ->orderBy('updated_at', 'desc')
            ->paginate($limit ?? 10);
        return Inertia::render('cutoff_date/cutoff-date', [
            'cutoff_dates' =>  Inertia::scroll(fn() => CutOffResourceCollection::make($query)),
        ]);
    }
    public function store(CutOffFormRequest $request)
    {
        CutOffDate::create($request->validated());
        return to_route('cutoff.index')->with('success', 'Success: successfully saved.');
    }

    public function update(CutOffFormRequest $request, CutOffDate $cutoffDate)
    {
        $cutoffDate->update($request->validated());

        return to_route('cutoff.index')->with('success', 'Success: changes saved.');
    }

    public function destroy(CutOffDate $cutoffDate)
    {
        $cutoffDate->delete();

        return to_route('cutoff.index')->with('success', 'Success: cut-off date deleted.');
    }
}
