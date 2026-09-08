<?php

namespace App\Http\Controllers\Maintenance;

use App\Http\Controllers\Controller;
use App\Http\Resources\Maintenance\AreaOfAssignmentResourceCollection;
use App\Models\AreaAssignment;
use App\Models\Group;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AreaOfAssignmentController extends Controller
{
    public function index(Request $request)
    {
         $limit = $request->integer('limit');
        $query = AreaAssignment::with('group:id,name')->filter($request->only(['search']))
            ->orderBy('updated_at', 'desc')
            ->paginate($limit ?: 10);
        return Inertia::render(
            'maintenance/area_of_assignment/area-of-assignment',
            [
                'areas' => AreaOfAssignmentResourceCollection::make($query),
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

        AreaAssignment::create($validated);
        return to_route('maintenance.area_of_assignment.index')->with('success', 'Successfully saved.');
    }
    public function update(Request $request, AreaAssignment $area_of_assignment)
    {
        $validated = $request->validate([
            'name' => ['required', 'string'],
            'type' => ['required', 'string']
        ]);

        $area_of_assignment->update($validated);
        return to_route('maintenance.area_of_assignment.index')->with('success', 'Successfully updated.');
    }
    public function destroy(AreaAssignment $area_of_assignment)
    {
        $area_of_assignment->delete();
        return to_route('maintenance.area_of_assignment.index')->with('success', 'Successfully deleted.');
    }
}
