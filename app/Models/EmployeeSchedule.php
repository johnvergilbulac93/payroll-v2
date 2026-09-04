<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


#[Fillable(['EmpID', 'ScheduleType', 'ShiftCodeID', 'EffectiveFrom', 'EffectiveTo', 'IsActive', 'Remarks'])]
class EmployeeSchedule extends Model
{
    protected $casts = [
        'IsActive' => 'boolean',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'EmpID');
    }

    public function shiftCode(): BelongsTo
    {
        return $this->belongsTo(ShiftCode::class, 'ShiftCodeID');
    }
}
