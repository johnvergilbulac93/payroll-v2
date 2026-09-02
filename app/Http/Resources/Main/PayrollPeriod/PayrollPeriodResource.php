<?php

namespace App\Http\Resources\Main\PayrollPeriod;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PayrollPeriodResource extends JsonResource
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
            'Label' => Carbon::createFromFormat('!m', $this->Month)->format('M') . ' ' . $this->Year . ' - Cutoff ' . $this->CutoffNumber,
            'Scheme' =>  $this->cutoffDates?->Name,
            'Cutoff' => Carbon::parse($this->PeriodStart)->format('M d') . ' - ' . Carbon::parse($this->PeriodEnd)->format('M d'),
            'PayDate' => Carbon::parse($this->PayDate)->format('M d, Y'),
            'Status' => $this->Status,
            'Year' => $this->Year,
        ];
    }
}
