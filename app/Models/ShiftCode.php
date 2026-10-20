<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

#[Table('shift_codes')]
#[Fillable(['Name', 'TimeIn', 'TimeOut', 'BreakMinutes', 'GracePeriodMinutes', 'CrossesMidNight', 'IsWorkingDay', 'TotalHours', 'IsActive'])]
class ShiftCode extends Model
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
            ->useLogName('shift_codes')
            ->logAll()
            ->logOnlyDirty();
    }

    protected $casts = [
        'CrossesMidNight' => 'boolean',
        'IsWorkingDay' => 'boolean',
        'IsActive' => 'boolean',
        'TimeIn' => 'datetime:H:i',
        'TimeOut' => 'datetime:H:i',
    ];
    public function scopeFilter(Builder $query, array $filters)
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('Name', 'like', "%{$search}%");
            });
        });
    }
    public function getTotalHoursAttribute(): float
    {
        if (!$this->TimeIn || !$this->TimeOut) {
            return 0.0;
        }

        $start = $this->TimeIn->copy();
        $end = $this->TimeOut->copy();

        if ($this->CrossesMidNight && $end->lessThanOrEqualTo($start)) {
            $end->addDay();
        }

        $totalMinutes = ($end->getTimestamp() - $start->getTimestamp()) / 60;
        $breakMinutes = $this->BreakMinutes ?? 0;

        return round(max(0, $totalMinutes - $breakMinutes) / 60, 2);
    }
}
