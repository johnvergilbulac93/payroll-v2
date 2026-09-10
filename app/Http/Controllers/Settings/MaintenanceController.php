<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\AreaAssignment;
use App\Models\Group;
use App\Models\Position;
use Illuminate\Http\Request;

class MaintenanceController extends Controller
{
    public function storeGroup(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string']
        ], [
            'name.required' => 'Group name is required'
        ]);
        Group::create($validated);
        return redirect()->back()->with('success', 'Successfully saved.');
    }
    public function storePosition(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string'],
            'type' => ['required', 'string']

        ], [
            'name.required' => 'Position name is required',
            'type.required' => 'Group is required',

        ]);
        Position::create($validated);
        return redirect()->back()->with('success', 'Successfully saved.');
    }
    public function storeArea(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string'],
            'type' => ['required', 'string']
        ], [
            'name.required' => 'Area name is required',
            'type.required' => 'Group is required'
        ]);
        AreaAssignment::create($validated);
        return redirect()->back()->with('success', 'Successfully saved.');
    }
}
