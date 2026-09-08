<?php

namespace App\Http\Controllers\Settings\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\UserRequest;
use App\Http\Resources\User\UserResourceCollection;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $limit = $request->input("limit");
        $roles = Role::select('name as label', 'id as value')->get();
        $query = User::filter($request->only(['search']))
            ->orderBy('updated_at', 'desc')
            ->paginate($limit ?? 10);
        return Inertia::render('user/user', [
            'users' => UserResourceCollection::make($query),
            'roles' => $roles
        ]);
    }
    public function store(UserRequest $request)
    {
        $validated = $request->validated();
        $validated['password'] = Hash::make(config('auth.default_password'));
        User::create($validated);
        return to_route('user.index');
    }
    public function update(UserRequest $request, User $user)
    {
        $user->update($request->validated());
        return to_route('user.index');
    }
    public function destroy(User $user)
    {
        $user->delete();
        return to_route('user.index');
    }

    public function permissionIndex(User $user)
    {
        $permissions = Permission::treeWithChecked(
            $user->permissions()->pluck('permissions.id')
        );
        return response()->json(['data' => $permissions, 'status' => 'success']);
    }
}
