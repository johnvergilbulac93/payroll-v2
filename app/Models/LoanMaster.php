<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


#[Fillable(['LoanTypeID', 'EmpNbr', 'OrigBal', 'DedAmt', 'StartDate', 'Frequency', 'BalanceAmt', 'BalanceasofDate', 'Crtd_Date', 'Crtd_User', 'LUpd_Date'])]
class LoanMaster extends Model
{
    public function loanType(): BelongsTo
    {
        return $this->belongsTo(LoanType::class, 'LoanTypeID');
    }
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'EmpNbr', 'EmpNbr');
    }

    public function scopeFilter(Builder $query, array $filters)
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('EmpNbr', 'like', "%{$search}%")
                    ->orWhereHas('employee', function ($q) use ($search) {
                        $q->where('FullName', 'like', "%{$search}%");
                    })
                    ->orWhereHas('loanType', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        });
    }
    protected function startDate(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->attributes['StartDate']
                ? Carbon::parse($this->attributes['StartDate'])->format('F j, Y')
                : null,
        );
    }
}
