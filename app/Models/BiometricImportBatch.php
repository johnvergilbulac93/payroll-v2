<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['original_filename', 'stored_path', 'uploaded_by', 'status', 'total_rows', 'imported_rows', 'skipped_rows', 'failed_rows', 'started_at', 'finished_at', 'error_message'])]
class BiometricImportBatch extends Model
{
    protected $casts = [
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
    ];

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
    public function logs(): HasMany
    {
        return $this->hasMany(BiometricLog::class, 'import_batch_id');
    }
    public function scopeFilter(Builder $query, array $filters)
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('original_filename', 'like', "%{$search}%");
            });
        });
    }
}
