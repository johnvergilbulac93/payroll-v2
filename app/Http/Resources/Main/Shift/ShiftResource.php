<?php

namespace App\Http\Resources\Main\Shift;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShiftResource extends JsonResource
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
            'Name' => $this->Name,
            'Schedule' => ($this->TimeIn && $this->TimeOut)
                ? Carbon::parse($this->TimeIn)->format('g:i A') . ' - ' . Carbon::parse($this->TimeOut)->format('g:i A')
                : null,
            'TimeIn' => $this->TimeIn ? Carbon::parse($this->TimeIn)->format('H:i') : null,
            'TimeOut' => $this->TimeOut ? Carbon::parse($this->TimeOut)->format('H:i') : null,
            'BreakMinutes' => intval($this->BreakMinutes),
            'GracePeriodMinutes' => intval($this->GracePeriodMinutes),
            'TotalHours' => floatval($this->TotalHours),
            'CrossesMidNight' => $this->CrossesMidNight,
            'IsWorkingDay' => $this->IsWorkingDay,
            'IsActive' => $this->IsActive,
        ];
    }
}
