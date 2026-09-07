<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;

#[Table('philhealth_contributions')]
#[Fillable(['EffectiveYear', 'PremiumRate', 'EmployeeShareRate', 'EmployerShareRate', 'SalaryFloor', 'SalaryCeiling', 'Status'])]
class PhilHealthContribution extends Model
{
    protected $casts = [
        'PremiumRate' => 'float',
        'EmployeeShareRate' => 'float',
        'EmployerShareRate' => 'float',
        'SalaryFloor' => 'float',
        'SalaryCeiling' => 'float',
        'Status' => 'boolean',
    ];
}
