<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Pivot;

/**
 * @property int $user_id
 * @property int $permission_id
 */
#[Fillable(['user_id', 'permission_id'])]
class UserPermission extends Pivot
{

    protected $table = 'user_permissions';
    protected $fillable = [
        'user_id',
        'permission_id'
    ];
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function permission()
    {
        return $this->belongsTo(Permission::class);
    }
}
