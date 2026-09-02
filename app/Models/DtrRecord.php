<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('dtr_records')]
#[Fillable(['EmpID', 'DTRDate', 'ShiftCodeID', 'IN', 'OUT', 'LateMinutes', 'UndertimeMinutes', 'OvertimeHours', 'RenderedHours', 'DaysWorked', 'Status', 'Remarks', 'PayrollPeriodID', 'PayrollStatus'])]
class DtrRecord extends Model
{

    protected $casts = [
        'DTRDate' => 'date',
        'ScheduledTimeIn' => 'datetime',
        'ScheduledTimeOut' => 'datetime',
        'ActualTimeIn' => 'datetime',
        'ActualTimeOut' => 'datetime',
        'DaysWorked' => 'float',
        'OvertimeHours' => 'float',
        'RenderedHours' => 'float'
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'EmpID');
    }

    // public function employeeSchedule(): BelongsTo
    // {
    //     return $this->belongsTo(EmployeeSchedule::class, 'EmployeeScheduleID');
    // }
}
