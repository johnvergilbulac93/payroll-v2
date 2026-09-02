<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

/**
 * @property string $name
 * @property string $slug
 * @property int $parent_id
 * @property string $type
 */
#[Fillable(['name', 'slug', 'parent_id', 'type'])]
class Permission extends Model
{
    public function children()
    {
        return $this->hasMany(Permission::class, 'parent_id')->with('children');;
    }
    public function parent()
    {
        return $this->belongsTo(Permission::class, 'parent_id');
    }
    public static function treeWithChecked(Collection $assignedIds)
    {
        $permissions = self::whereNull('parent_id')
            ->with('children')
            ->get();

        return self::markChecked($permissions, $assignedIds);
    }
    public function scopeFilter(Builder $query, array $filters)
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->orWhere('slug', 'like', "%{$search}%");
            });
        });
    }
    private static function markChecked(object $nodes, object $assignedIds)
    {
        return $nodes->map(function ($node) use ($assignedIds) {

            $node->checked = $assignedIds->contains($node->id);

            if ($node->children->isNotEmpty()) {
                $node->children = self::markChecked(
                    $node->children,
                    $assignedIds
                );
            }

            return $node;
        });
    }
}
