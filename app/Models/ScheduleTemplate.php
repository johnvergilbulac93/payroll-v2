<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

#[Table('employee_schedule_templates')]
#[Fillable(['EmpID', 'DayOfWeek', 'ShiftCodeID', 'EffectiveFrom', 'EffectiveTo'])]
class ScheduleTemplate extends Model
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
            ->useLogName('schedule_templates')
            ->logAll()
            ->logOnlyDirty();
    }

    public function logs(): MorphMany
    {
        return $this->activities()->with('causer');
    }

    protected $casts = [
        'EffectiveFrom' => 'date:Y-m-d',
        'EffectiveTo' => 'date:Y-m-d',
        'DayOfWeek' => 'integer',

    ];
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'EmpID');
    }

    public function shiftCode(): BelongsTo
    {
        return $this->belongsTo(ShiftCode::class, 'ShiftCodeID');
    }
    public function scopeActive(Builder $query, ?Carbon $asOf = null): Builder
    {
        $asOf ??= now();

        return $query->where('EffectiveFrom', '<=', $asOf)
            ->where(function ($q) use ($asOf) {
                $q->whereNull('EffectiveTo')
                    ->orWhere('EffectiveTo', '>=', $asOf);
            });
    }
    public function scopeForEmployee(Builder $query, int $employeeId): Builder
    {
        return $query->where('EmpID', $employeeId);
    }

    public function scopeForDay(Builder $query, int $dayOfWeek): Builder
    {
        return $query->where('DayOfWeek', $dayOfWeek);
    }
}
