<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

#[Fillable(['EmpNbr', 'Group', 'FirstName', 'MidName', 'LastName', 'Suffix', 'FullName', 'Address', 'CityProv', 'BirthDate', 'EmployDate', 'RegularDate', 'Position', 'Assignment', 'SalaryGrade', 'BasicPay', 'DailyRate', 'HourlyRate', 'Status', 'SSSNbr', 'PHICNbr', 'HDMFNbr', 'TIN', 'Degree', 'AllowReg', 'ResignDate', 'BPIATM', 'BPIEmpCode', 'PIN', 'PERAAID', 'BiometricID', 'DeductionStatus', 'Image'])]

class Employee extends Model
{
    use SoftDeletes;

    protected $appends = ['image_url'];
    protected $hidden = ['Image'];

    protected function casts(): array
    {
        return [
            'Status' => 'boolean',
            'BasicPay' => 'float',
            'DailyRate' => 'float',
            'HourlyRate' => 'float',
            'AllowReg' => 'float',
        ];
    }
    public function scheduleTemplate(): HasMany
    {
        return $this->HasMany(ScheduleTemplate::class, 'EmpID');
    }
    protected static function booted(): void
    {
        static::creating(function (Employee $employee) {
            if (empty($employee->EmpNbr)) {
                $year = now()->year;

                $counter = DB::table('emp_nbr_counters')
                    ->where('year', $year)
                    ->lockForUpdate()
                    ->first();

                $nextNumber = $counter ? $counter->last_number + 1 : 1;

                DB::table('emp_nbr_counters')->updateOrInsert(
                    ['year' => $year],
                    ['last_number' => $nextNumber]
                );

                $employee->EmpNbr = sprintf('%05d-%d', $nextNumber, $year);
            }
        });

        static::saving(function (Employee $employee) {
            $employee->FullName = collect([
                $employee->FirstName,
                $employee->MidName,
                $employee->Suffix,
            ])->filter()->implode(' ');

            $employee->FullName = $employee->LastName . ', ' . $employee->FullName;
        });
    }
    public function scopeFilter(Builder $query, array $filters)
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->orWhere('FullName', 'like', "%{$search}%")
                    ->orWhere('EmpNbr', 'like', "%{$search}%");
            });
        });
    }
    protected function imageUrl(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->Image ? Storage::disk('public')->url($this->Image) : null,
        );
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class, 'Group');
    }
}
