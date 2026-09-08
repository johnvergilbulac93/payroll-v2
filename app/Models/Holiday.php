<?php

namespace App\Models;

use App\Enums\HolidayType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;


#[Fillable('Name', 'Date', 'HolidayType', 'IsRecurring')]
class Holiday extends Model
{
    protected function casts(): array
    {
        return [
            'Date' => 'date',
            'IsRecurring' => 'boolean',
            'HolidayType' => HolidayType::class,
        ];
    }
    public function scopeFilter(Builder $query, array $filters)
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->orWhere('name', 'like', "%{$search}%");
            });
        });
    }
}
