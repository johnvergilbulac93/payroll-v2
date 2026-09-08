<?php

namespace App\Http\Resources\Main\Loan;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LoanResource extends JsonResource
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
            'LoanType' => $this->loanType?->name,
            'LoanTypeID' => $this->LoanTypeID,
            'EmployeeName' => $this->employee?->FullName,
            'ImageUrl' => $this->employee?->imageUrl,
            'EmpNbr' => $this->EmpNbr,
            'OrigBal' => $this->OrigBal,
            'DedAmt' => $this->DedAmt,
            'StartDateLabel' =>  Carbon::parse($this->StartDate)->format('F j, Y'),
            'StartDate' => $this->StartDate,
            'Frequency' => $this->Frequency,
            'BalanceAmt' => $this->BalanceAmt,
            'BalanceasofDate' => $this->BalanceasofDate,
        ];
    }
}
