<?php

namespace App\Http\Controllers\Maintenance;

use App\Http\Controllers\Controller;
use App\Http\Resources\Maintenance\DeductionTypeResourceCollection;
use App\Models\DeductionType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DeductionTypeController extends Controller
{
    public function index(Request $request)
    {
        $limit = $request->integer('limit');
        $query = DeductionType::filter($request->only(['search']))
            ->orderBy('updated_at', 'desc')
            ->paginate($limit ?: 10);

        return Inertia::render('maintenance/deduction_type/deduction-type', [
            'deduction_types' => DeductionTypeResourceCollection::make($query),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'frequency' => ['required', 'string', 'in:00,15,30'],
        ]);

        DeductionType::create($validated);

        return to_route('maintenance.deduction_type.index')->with('success', 'Successfully saved.');
    }

    public function update(Request $request, DeductionType $deductionType)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'frequency' => ['required', 'string', 'in:00,15,30'],
        ]);

        $deductionType->update($validated);

        return to_route('maintenance.deduction_type.index')->with('success', 'Successfully updated.');
    }

    public function destroy(DeductionType $deductionType)
    {
        $deductionType->delete();

        return to_route('maintenance.deduction_type.index')->with('success', 'Successfully deleted.');
    }
}
