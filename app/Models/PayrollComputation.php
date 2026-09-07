<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;


#[Fillable(['EmpID', 'PayrollPeriodID', 'BasicPay', 'OvertimePay', 'LateDeduction', 'UndertimeDeduction', 'TotalAllowances', 'PerfectAttendanceIncentive', 'AbsenceDeduction', 'RetroAdjSIA', 'RetroAdjBP', 'SSSContribution', 'PhilHealthContribution', 'PagIbigContribution', 'WithholdingTax', 'HMOPremium', 'TotalLoanDeductions', 'TaxableIncome', 'GrossPay', 'NetPay'])]
#[Table('payroll_computations')]
class PayrollComputation extends Model
{
    //
}
