<?php

namespace App\Http\Controllers\Maintenance;

use App\Http\Controllers\Controller;
use App\Http\Resources\Maintenance\PositionResourceCollection;
use App\Models\Group;
use App\Models\Position;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PositionController extends Controller
{
    public function index(Request $request)
    {
        $limit = $request->integer('limit');
        $query = Position::with('group:id,name')->filter($request->only(['search']))
            ->orderBy('updated_at', 'desc')
            ->paginate($limit ?: 10);
        return Inertia::render(
            'maintenance/position/position',
            [
                'positions' => PositionResourceCollection::make($query),
                'groups' => Group::select('id as value', 'name as label')->get()
            ]
        );
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string'],
            'type' => ['required', 'string']

        ], ['type.required' => 'The group field is required.']);

        Position::create($validated);
        return to_route('maintenance.position.index')->with('success', 'Successfully saved.');
    }
    public function update(Request $request, Position $position)
    {
        $validated = $request->validate([
            'name' => ['required', 'string'],
            'type' => ['required', 'string']
        ]);

        $position->update($validated);
        return to_route('maintenance.position.index')->with('success', 'Successfully updated.');
    }
    public function destroy(Position $position)
    {
        $position->delete();
        return to_route('maintenance.position.index')->with('success', 'Successfully deleted.');
    }
}
