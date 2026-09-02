<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('biometric_logs')]
#[Fillable(['device_user_id', 'employee_id', 'punch_time', 'status', 'verify_mode', 'io_state', 'reserved', 'raw_line'])]
class BiometricLog extends Model
{
    protected $casts = [
        'punch_time' => 'datetime',
    ];

    public function batch(): BelongsTo
    {
        return $this->belongsTo(BiometricImportBatch::class, 'import_batch_id');
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
