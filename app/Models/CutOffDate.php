<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;


#[Table('cutoff_dates')]
#[Fillable(['Name', 'Cutoff1StartDay', 'Cutoff1EndDay', 'Cutoff2StartDay', 'Cutoff2EndDay', 'IsActive'])]
class CutOffDate extends Model
{
    protected $casts = [
        'Cutoff1StartDay' => 'integer',
        'Cutoff1EndDay' => 'integer',
        'Cutoff2StartDay' => 'integer',
        'Cutoff2EndDay' => 'integer',
        'IsActive' => 'boolean',
    ];

    public function scopeFilter(Builder $query, array $filters)
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->orWhere('Name', 'like', "%{$search}%");
            });
        });
    }
}
