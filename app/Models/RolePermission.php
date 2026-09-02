<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Pivot;


/**
 * @property int $role_id
 * @property int $permission_id
 */
#[Fillable(['role_id', 'permission_id'])]
class RolePermission extends Pivot
{
    protected $table = 'role_permissions';
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function permission()
    {
        return $this->belongsTo(Permission::class);
    }
}
