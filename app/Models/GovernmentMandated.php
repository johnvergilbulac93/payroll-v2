<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

#[Fillable(['Code', 'Description', 'ValueType', 'DefaultValue', 'File', 'Status'])]
class GovernmentMandated extends Model
{
    use LogsActivity;

    protected static $recordEvents = ['created', 'updated', 'deleted'];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('government_mandateds')
            ->logAll()
            ->logOnlyDirty();
    }

    public function scopeFilter(Builder $query, array $filters): void
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('Code', 'like', "%{$search}%")
                    ->orWhere('Description', 'like', "%{$search}%")
                    ->orWhere('ValueType', 'like', "%{$search}%");
            });
        });
    }
}
