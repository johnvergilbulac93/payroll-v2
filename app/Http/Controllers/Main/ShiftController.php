<?php

namespace App\Http\Controllers\Main;

use App\Http\Controllers\Controller;
use App\Http\Requests\Main\Shift\ShiftFormRequest;
use App\Http\Resources\Main\Shift\ShiftResourceCollection;
use App\Models\ShiftCode;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShiftController extends Controller
{
    public function index(Request $request)
    {
        $limit = $request->input("limit");
        $query = ShiftCode::filter($request->only(['search']))
            ->orderBy('updated_at', 'desc')
            ->paginate($limit ?? 10);
        return Inertia::render('shift_code/shift-code', [
            'shift_codes' =>  Inertia::scroll(fn() => ShiftResourceCollection::make($query)),
        ]);
    }

    public function store(ShiftFormRequest $request)
    {
        ShiftCode::create($request->validated());
        return to_route('shift.index')->with('success', 'Success: shift saved.');
    }

    public function update(ShiftFormRequest $request, ShiftCode $shift)
    {
        $shift->update($request->validated());
        return to_route('shift.index')->with('success', 'Success: shift updated.');
    }

    public function destroy(ShiftCode $shift)
    {
        $shift->delete();
        return to_route('shift.index')->with('success', 'Success: shift deleted.');
    }
}
