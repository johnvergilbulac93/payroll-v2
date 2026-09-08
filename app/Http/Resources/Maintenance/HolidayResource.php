<?php

namespace App\Http\Resources\Maintenance;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HolidayResource extends JsonResource
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
            'DisplayDate' => $this->Date->copy()->setYear(now()->year)->format('F d, Y'), // e.g. "December 25, 2026"
            'Date' => Carbon::parse($this->Date)->format('Y-m-d'),
            'HolidayType' => $this->HolidayType,
            'IsRecurring' => $this->IsRecurring

        ];
    }
}
