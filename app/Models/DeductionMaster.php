<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

#[Fillable([
    'DeductionTypeId',
    'EmpID',
    'OrigBal',
    'DedAmt',
    'StartDate',
    'Frequency',
    'BalanceAmt',
    'BalanceasofDate',
    'Crtd_Date',
    'Crtd_User',
    'LUpd_Date',
])]
class DeductionMaster extends Model
{
    use LogsActivity;

    protected static $recordEvents = ['created', 'updated', 'deleted'];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('deduction-masters')
            ->logAll()
            ->logOnlyDirty();
    }

    public function deductionType(): BelongsTo
    {
        return $this->belongsTo(DeductionType::class, 'DeductionTypeId');
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'EmpID');
    }

    public function scopeFilter(Builder $query, array $filters): void
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('employee', function ($employee) use ($search) {
                    $employee->where('FullName', 'like', "%{$search}%")
                        ->orWhere('EmpNbr', 'like', "%{$search}%");
                })->orWhereHas('deductionType', function ($type) use ($search) {
                    $type->where('name', 'like', "%{$search}%");
                });
            });
        });
    }
}
