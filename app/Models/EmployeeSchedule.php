<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;


#[Fillable(['EmpID', 'ScheduleType', 'ShiftCodeID', 'EffectiveFrom', 'EffectiveTo', 'IsActive', 'Remarks'])]
class EmployeeSchedule extends Model
{
    use LogsActivity;

    protected static $recordEvents = [
        'created',
        'updated',
        'deleted',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('employee_schedules')
            ->logAll()
            ->logOnlyDirty();
    }

    public function logs(): MorphMany
    {
        return $this->activities()->with('causer');
    }

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
