<?php

namespace App\Services\Payroll;

use App\Models\Employee;
use App\Models\PayrollPeriod;
use App\Models\PayrollComputation;
use App\Services\Deductions\SssContributionService;
use App\Services\Deductions\PhilHealthContributionService;
use App\Services\Deductions\PagIbigContributionService;
use App\Services\Deductions\WithholdingTaxService;
use App\Services\Deductions\LoanDeductionService;
use App\Services\Holiday\HolidayPayService;
use InvalidArgumentException;

class PayrollComputationService
{
    // Adjust these to match the actual values stored in your groups table.
    protected const GROUP_TEACHING = 'Teaching';
    protected const GROUP_NON_TEACHING = 'Non-Teaching';

    // Teacher overload reference rates
    protected const OVERLOAD_LET_BASE = 20007.00;
    protected const OVERLOAD_LET_RATE = 82.22;
    protected const OVERLOAD_NO_LET_BASE = 17529.00;
    protected const OVERLOAD_NO_LET_RATE = 72.04;

    protected const ATTENDANCE_INCENTIVE_TENURED = 1200.00;
    protected const ATTENDANCE_INCENTIVE_NON_TENURED = 1000.00;

    protected const PERFECT_ATTENDANCE_REGULAR = 1000.00;
    protected const PERFECT_ATTENDANCE_PROBATIONARY = 800.00;

    public function __construct(
        protected SssContributionService $sss,
        protected PhilHealthContributionService $philHealth,
        protected PagIbigContributionService $pagIbig,
        protected WithholdingTaxService $withholdingTax,
        protected LoanDeductionService $loan,
        protected HolidayPayService $holiday,

    ) {}

    /**
     * Loads every employee-independent lookup once. Call this before
     * looping employees in computePayroll(), then pass the result into
     * every computeForPeriod() call in that loop.
     */
    public function preloadLookups(PayrollPeriod $period): PayrollLookups
    {
        return new PayrollLookups(
            sssBrackets: $this->sss->preloadBrackets(),
            philHealthRate: $this->philHealth->preloadRate(),
            pagIbigDeduction: $this->pagIbig->preloadDeduction(),
            withholdingTaxBrackets: $this->withholdingTax->preloadBrackets(),
            holidayPreload: $this->holiday->preload($period),
        );
    }

    /**
     * Compute payroll for an employee for a given period and persist the result.
     *
     * @param Employee $employee Must have `group` relation loaded/loadable
     *        (belongsTo Group, Group.Name = 'Teaching' | 'Non-Teaching').
     * @param PayrollPeriod $period
     * @param array{
     *     daysWorked?: float,
     *     absences?: float,
     *     lateMinutes?: int,
     *     undertimeMinutes?: int,
     *     overtimeHours?: float,
     *     excessLoadUnits?: float,
     *     lateAfter8am?: bool
     * } $dtrSummary Aggregated DTR figures for the period. Pull this from
     *        DtrProcessorService / dtr_records before calling this method.
     * @param PayrollLookups $lookups Preloaded once via preloadLookups()
     *        before the employee loop -- not re-queried per employee.
     */
    public function computeForPeriod(Employee $employee, PayrollPeriod $period, array $dtrSummary, PayrollLookups $lookups): PayrollComputation
    {

        $groupName = $employee->group->name ?? null;

        $result = match ($groupName) {
            self::GROUP_TEACHING => $this->computeTeaching($employee, $period, $dtrSummary, $lookups),
            self::GROUP_NON_TEACHING => $this->computeNonTeaching($employee, $period, $dtrSummary, $lookups),
            default => throw new InvalidArgumentException(
                "Employee {$employee->EmpID} has no recognized payroll group " .
                    "(expected 'Teaching' or 'Non-Teaching', got '{$groupName}')."
            ),
        };

        return $this->persist($employee, $period, $result);
    }

    protected function computeNonTeaching(Employee $employee, PayrollPeriod $period, array $dtrSummary, PayrollLookups $lookups): array
    {
        $semiMonthly = $employee->BasicPay / 2;


        // Some non-teaching employees use /365, others /314 per the documented rule.
        // Expects an explicit divisor column on the employee record.
        $dailyRateDivisor = $employee->DailyRateDivisor ?? 365;
        $dailyRate = $employee->BasicPay * 12 / $dailyRateDivisor;
        $hourlyRate = $employee->HourlyRate > 0
            ? $employee->HourlyRate
            : $dailyRate / 8;

        $absences = $dtrSummary['absences'] ?? 0.0;
        $absenceDeduction = round($dailyRate * $absences, 2);
        $holidayPay = $this->holiday->computeForEmployee($employee, $dailyRate, $lookups->holidayPreload);

        $lateDeduction = $this->minutesToPesoDeduction($dtrSummary['lateMinutes'] ?? 0, $hourlyRate);
        $undertimeDeduction = $this->minutesToPesoDeduction($dtrSummary['undertimeMinutes'] ?? 0, $hourlyRate);
        $overtimePay = round(($dtrSummary['overtimeHours'] ?? 0) * $hourlyRate * 1.25, 2);

        $allowance = $employee->AllowReg ?? 0;

        // $clothingAllowance = $employee->ClothingAllowance ?? 0;

        // $qualifiesForPerfectAttendance = $absences === 0.0
        //     && ($dtrSummary['lateMinutes'] ?? 0) === 0
        //     && empty($dtrSummary['lateAfter8am']);

        // $perfectAttendanceIncentive = 0.0;
        // if ($qualifiesForPerfectAttendance) {
        //     $perfectAttendanceIncentive = $employee->EmploymentStatus === 'Probationary'
        //         ? self::PERFECT_ATTENDANCE_PROBATIONARY
        //         : self::PERFECT_ATTENDANCE_REGULAR;
        // }

        $grossPay = $semiMonthly
            + $allowance
            // + $clothingAllowance
            // + $perfectAttendanceIncentive
            + $overtimePay
            - $absenceDeduction
            - $lateDeduction
            - $undertimeDeduction;

        $sss = $period->CutoffNumber == 2
            ? $this->sss->calculate($employee, $lookups->sssBrackets)
            : 0;
        $philHealth = $period->CutoffNumber == 2
            ? $this->philHealth->calculate($employee, $lookups->philHealthRate)
            : 0;
        $pagIbig = $period->CutoffNumber == 2
            ? $this->pagIbig->calculate($employee, $lookups->pagIbigDeduction)
            : 0;

        // $hmoPremium = $employee->HmoPremiumEmployeeShare ?? 0;


        $taxableIncome = $semiMonthly
            + $allowance
            // + $perfectAttendanceIncentive
            - $absenceDeduction
            - $sss
            - $philHealth;
        // - $hmoPremium;

        $withholdingTax =  $period->CutoffNumber == 2
            ? $this->withholdingTax->calculate(max($taxableIncome, 0), $lookups->withholdingTaxBrackets)
            : 0;

        $loanDeduction = $this->loan->calculate($employee, $period);


        $netPay = $grossPay
            - $sss
            - $philHealth
            - $pagIbig
            - $withholdingTax
            // - $hmoPremium 
            - $loanDeduction;

        return [
            'grossPay' => $grossPay,
            'netPay' => $netPay,
            'overtimePay' => $overtimePay,
            'lateDeduction' => $lateDeduction,
            'undertimeDeduction' => $undertimeDeduction,
            'sss' => $sss,
            'philHealth' => $philHealth,
            'pagIbig' => $pagIbig,
            'withholdingTax' => $withholdingTax,
            'loanDeduction' => $loanDeduction,
        ];
    }

    protected function computeTeaching(Employee $employee, PayrollPeriod $period, array $dtrSummary, PayrollLookups $lookups): array
    {
        $semiMonthly = $employee->BasicPay / 2;
        $dailyRate = $employee->BasicPay * 12 / 365;
        $hourlyRate = $employee->HourlyRate > 0
            ? $employee->HourlyRate
            : $dailyRate / 8;

        $absences = $dtrSummary['absences'] ?? 0.0;
        $absenceDeduction = round($dailyRate * $absences, 2);
        $holidayPay = $this->holiday->computeForEmployee($employee, $dailyRate, $lookups->holidayPreload);

        $lateDeduction = $this->minutesToPesoDeduction($dtrSummary['lateMinutes'] ?? 0, $hourlyRate);
        $undertimeDeduction = $this->minutesToPesoDeduction($dtrSummary['undertimeMinutes'] ?? 0, $hourlyRate);
        $overtimePay = round(($dtrSummary['overtimeHours'] ?? 0) * $hourlyRate * 1.25, 2);
        // $overloadRatePerUnit = $employee->IsLetPasser
        //     ? $employee->BasicPay
        //     : self::OVERLOAD_NO_LET_RATE;
        // $overloadPay = round(($dtrSummary['excessLoadUnits'] ?? 0) * $overloadRatePerUnit, 2);

        // $serviceIncentiveAllowance = $employee->ServiceIncentiveAllowance ?? 0;

        // $attendanceIncentive = $employee->IsTenured
        //     ? self::ATTENDANCE_INCENTIVE_TENURED
        //     : self::ATTENDANCE_INCENTIVE_NON_TENURED;

        $grossPay = $semiMonthly
            // + $serviceIncentiveAllowance
            // + $attendanceIncentive
            // + $overloadPay
            - $absenceDeduction;

        $sss = $period->CutoffNumber == 2
            ? $this->sss->calculate($employee, $lookups->sssBrackets)
            : 0;

        $philHealth = $period->CutoffNumber == 2
            ? $this->philHealth->calculate($employee, $lookups->philHealthRate)
            : 0;

        $pagIbig = $period->CutoffNumber == 2
            ? $this->pagIbig->calculate($employee, $lookups->pagIbigDeduction)
            : 0;


        $taxableIncome = $semiMonthly
            // + $serviceIncentiveAllowance
            // + $attendanceIncentive
            - $absenceDeduction
            - $sss
            - $philHealth;

        $withholdingTax = $period->CutoffNumber == 2
            ?  $withholdingTax = $this->withholdingTax->calculate(max($taxableIncome, 0), $lookups->withholdingTaxBrackets)
            : 0;
        // $withholdingTax = $this->withholdingTax->calculate(max($taxableIncome, 0), $lookups->withholdingTaxBrackets);

        $loanDeduction = $this->loan->calculate($employee, $period);

        $netPay = $grossPay - $sss - $philHealth - $pagIbig - $withholdingTax - $loanDeduction;
        return [
            'grossPay' => $grossPay,
            'netPay' => $netPay,
            // 'overloadPay' => $overloadPay,
            'overtimePay' => $overtimePay,
            'lateDeduction' => $lateDeduction,
            'undertimeDeduction' => $undertimeDeduction,
            'sss' => $sss,
            'philHealth' => $philHealth,
            'pagIbig' => $pagIbig,
            'withholdingTax' => $withholdingTax,
            'loanDeduction' => $loanDeduction,
        ];
    }

    protected function minutesToPesoDeduction(int $minutes, float $hourlyRate): float
    {
        return round(($minutes / 60) * $hourlyRate, 2);
    }

    protected function persist(Employee $employee, PayrollPeriod $period, array $result): PayrollComputation
    {
        return PayrollComputation::updateOrCreate(
            [
                'EmpID' => $employee->id,
                'PayrollPeriodID' => $period->id,
            ],
            [
                'BasicPay' => $employee->BasicPay,
                'OvertimePay' => $result['overtimePay'] ?? 0,
                'LateDeduction' => $result['lateDeduction'] ?? 0,
                'UndertimeDeduction' => $result['undertimeDeduction'] ?? 0,
                'GrossPay' => round($result['grossPay'], 2),
                'SSSContribution' => round($result['sss'], 2),
                'PhilHealthContribution' => round($result['philHealth'], 2),
                'PagIbigContribution' => round($result['pagIbig'], 2),
                'WithholdingTax' => round($result['withholdingTax'], 2),
                'LoanDeduction' => round($result['loanDeduction'] ?? 0, 2),
                'NetPay' => round($result['netPay'], 2),
            ]
        );
    }
}
