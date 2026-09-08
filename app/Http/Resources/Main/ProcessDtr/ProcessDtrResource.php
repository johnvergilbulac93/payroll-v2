<?php

namespace App\Http\Resources\Main\ProcessDtr;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ProcessDtrResource extends JsonResource
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
            'Status' => $this->status,
            'FullName' => $this->FullName,
            'GroupName' => $this->GroupName,
            'EmpNbr' => $this->EmpNbr,
            'Image' => $this->Image ? Storage::disk('public')->url($this->Image) : null,
            'Period' => $this->period,
            'Remarks' => $this->last_remarks,
            'ProcessedAt' => $this->last_processed_at
                ? Carbon::parse($this->last_processed_at)->calendar()
                : null,
            'DTRRecords' => $this->dtr_records

        ];
    }
}
