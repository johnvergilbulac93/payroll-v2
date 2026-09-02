<?php

namespace App\Http\Controllers\Setting\Group;

use App\Http\Controllers\Controller;
use App\Models\Group;
use Illuminate\Http\Request;

class GroupController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string']
        ],[
            'name.required' => 'Group name is required'
        ]);
        Group::create($validated);
        return redirect()->back();
    }
}
