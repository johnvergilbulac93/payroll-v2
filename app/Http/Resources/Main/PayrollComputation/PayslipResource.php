<?php

namespace App\Http\Resources\Main\PayrollComputation;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PayslipResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'EmpID' => $this->EmpID,
            'PayrollPeriodID' => $this->PayrollPeriodID,
            'FullName' => $this->employee?->FullName,
            'Image' => $this->employee?->Image,
            'GroupName' => $this->employee?->group?->name,
            'Label' => Carbon::createFromFormat('!m', $this->period?->Month)->format('M') . ' ' . $this->period?->Year . ' - Cutoff ' . $this->period?->CutoffNumber,
            'Cutoff' => Carbon::parse($this->period?->PeriodStart)->format('M d, Y') . ' to ' . Carbon::parse($this->period?->PeriodEnd)->format('M d, Y'),
            'PayDate' => Carbon::parse($this->period?->PayDate)->format('M d, Y'),
            'BasicPay' => $this->BasicPay,
            'OvertimePay' => $this->OvertimePay,
            'LateDeduction' => $this->LateDeduction,
            'UndertimeDeduction' => $this->UndertimeDeduction,
            'TotalAllowances' => $this->TotalAllowances,
            'PerfectAttendanceIncentive' => $this->PerfectAttendanceIncentive,
            'AbsenceDeduction' => $this->AbsenceDeduction,
            'RetroAdjSIA' => $this->RetroAdjSIA,
            'RetroAdjBP' => $this->RetroAdjBP,
            'SSSContribution' => $this->SSSContribution,
            'PhilHealthContribution' => $this->PhilHealthContribution,
            'PagIbigContribution' => $this->PagIbigContribution,
            'WithholdingTax' => $this->WithholdingTax,
            'HMOPremium' => $this->HMOPremium,
            'TotalLoanDeductions' => $this->TotalLoanDeductions,
            'TaxableIncome' => $this->TaxableIncome,
            'GrossPay' => $this->GrossPay,
            'NetPay' => $this->NetPay,

        ];
    }
}
