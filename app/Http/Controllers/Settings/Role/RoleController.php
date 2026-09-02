<?php

namespace App\Http\Controllers\Settings\Role;

use App\Http\Controllers\Controller;
use App\Http\Requests\Role\RoleRequest;
use App\Http\Resources\Role\RoleResourceCollection;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleController extends Controller
{
    public function index(Request $request)
    {
        $query = Role::filter($request->only(['search']))
            ->orderBy('updated_at', 'desc')
            ->paginate($limit ?? 10)
            ->withQueryString();
        return Inertia::render('roles/role', [
            'roles' => RoleResourceCollection::make($query),
        ]);
    }
    public function store(RoleRequest $request)
    {
        Role::create($request->validated());
        return to_route('role.index');
    }

    public  function update(RoleRequest $request, Role $role)
    {
        $role->update($request->validated());
        return to_route('role.index');
    }

    public function destroy(Role $role)
    {
        $role->delete();
        return to_route('role.index');
    }
}
