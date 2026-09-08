<?php

namespace App\Http\Controllers\Maintenance;

use App\Http\Controllers\Controller;
use App\Http\Resources\Maintenance\GroupResourceCollection;
use App\Models\Group;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GroupController extends Controller
{
    public function index(Request $request)
    {
        $limit = $request->integer('limit');
        $query = Group::filter($request->only(['search']))
            ->orderBy('updated_at', 'desc')
            ->paginate($limit ?: 10);
        return Inertia::render(
            'maintenance/group/group',
            [
                'groups' => GroupResourceCollection::make($query)
            ]
        );
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string']
        ]);

        Group::create($validated);
        return to_route('maintenance.group.index')->with('success', 'Successfully saved.');
    }
    public function update(Request $request, Group $group)
    {
        $validated = $request->validate([
            'name' => ['required', 'string']
        ]);

        $group->update($validated);
        return to_route('maintenance.group.index')->with('success', 'Successfully updated.');
    }
    public function destroy(Group $group)
    {
        $group->delete();
        return to_route('maintenance.group.index')->with('success', 'Successfully deleted.');
    }
}
