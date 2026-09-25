<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PayrollSummary extends Model
{
    protected $fillable = [
        'EmpID',
        'PayrollPeriodID',
        'TotalWorkingDays',
        'Absences',
        'Tardiness',
        'OTHours',
        'NDHours',
        'RegularHoliday',
        'SpecialHoliday',
        'SL',
        'VL',
    ];

    protected $casts = [
        'TotalWorkingDays' => 'decimal:4',
        'Absences' => 'decimal:4',
        'Tardiness' => 'integer',
        'OTHours' => 'decimal:2',
        'NDHours' => 'decimal:2',
        'RegularHoliday' => 'decimal:4',
        'SpecialHoliday' => 'decimal:4',
        'SL' => 'decimal:4',
        'VL' => 'decimal:4',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'EmpID');
    }

    public function payrollPeriod()
    {
        return $this->belongsTo(PayrollPeriod::class, 'PayrollPeriodID');
    }
}
