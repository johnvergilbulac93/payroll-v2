<?php

namespace App\Http\Controllers\Settings\AccessControl;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccessControlController extends Controller
{

    public function index(Request $request)
    {
        $users = User::select('name as label', 'id as value', 'IsActive as status')->get();
        $roles = Role::with('permissions:id')->orderBy('id', 'asc')->get(['id', 'name']);

        $permissions = Permission::filter($request->only(['search']))
            ->where('type', 'action')
            ->select(['id', 'name', 'slug', 'parent_id'])
            ->get();

        $rolePermissionMap = $roles->mapWithKeys(
            fn($role) => [$role->id => $role->permissions->pluck('id')->toArray()],
        );

        $matrix = $permissions->mapWithKeys(function ($permission) use ($roles, $rolePermissionMap) {
            return [
                $permission->id => $roles->mapWithKeys(function ($role) use ($permission, $rolePermissionMap) {
                    $rolePermissionIds = $rolePermissionMap->get($role->id, []);
                    return [
                        $role->id => [
                            'granted' => in_array($permission->id, $rolePermissionIds),
                        ],
                    ];
                }),
            ];
        });

        return Inertia::render(
            'access_control/access-control',
            [
                'users' => $users,
                'permissions' => $permissions,
                'roles' => $roles,
                'matrix' => $matrix,
            ]
        );
    }

    public function getUserPermission(User $user)
    {
        $permissions = Permission::treeWithChecked(
            $user->permissions()->pluck('permissions.id')
        );
        return response()->json(['data' => $permissions, 'status' => 'success']);
    }
    public function updateUserPermission(Request $request, User $user)
    {
        $user->permissions()->sync($request->permission_ids);
        return to_route('access_control.index');
    }

    public function updateRolePermission(Request $request, Role $role)
    {
        $granted = $request->input('granted');
        $permissionID = $request->input('permission_id');
        if ($granted) {
            $role->permissions()->syncWithoutDetaching([$permissionID]);
        } else {
            $role->permissions()->detach($permissionID);
        }
        return to_route('access_control.index');
    }
}
