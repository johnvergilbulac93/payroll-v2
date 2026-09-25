<?php

namespace App\Http\Resources\Main\Deduction;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DeductionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'DeductionTypeId' => $this->DeductionTypeId,
            'DeductionType' => $this->deductionType?->name,
            'EmpID' => $this->EmpID,
            'EmpNbr' => $this->employee?->EmpNbr,
            'EmployeeName' => $this->employee?->FullName,
            'ImageUrl' => $this->employee?->image_url,
            'OrigBal' => $this->OrigBal,
            'DedAmt' => $this->DedAmt,
            'StartDate' => $this->StartDate,
            'StartDateLabel' => $this->StartDate ? Carbon::parse($this->StartDate)->format('F j, Y') : null,
            'Frequency' => $this->Frequency,
            'BalanceAmt' => $this->BalanceAmt,
            'BalanceasofDate' => $this->BalanceasofDate,
        ];
    }
}
