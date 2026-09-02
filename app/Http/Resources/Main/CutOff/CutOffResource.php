<?php

namespace App\Http\Resources\Main\CutOff;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CutOffResource extends JsonResource
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
            'Cutoff1StartDay' => $this->Cutoff1StartDay,
            'Cutoff1EndDay' => $this->Cutoff1EndDay,
            'Cutoff2StartDay' => $this->Cutoff2StartDay,
            'Cutoff2EndDay' => $this->Cutoff2EndDay,
            'IsActive' => $this->IsActive,
            'Label' => 'Cutoff 1: ' . $this->formatCutoffRange($this->Cutoff1StartDay, $this->Cutoff1EndDay) . ' - ' . 'Cutoff 2: ' . $this->formatCutoffRange($this->Cutoff2StartDay, $this->Cutoff2EndDay)
        ];
    }

    private function formatCutoffRange(int $start, int $end): string
    {
        return $this->ordinal($start) . ' → ' . $this->ordinal($end);
    }

    private function ordinal(int $day): string
    {
        if (in_array($day % 100, [11, 12, 13])) {
            return $day . 'th';
        }

        return match ($day % 10) {
            1 => $day . 'st',
            2 => $day . 'nd',
            3 => $day . 'rd',
            default => $day . 'th',
        };
    }
}
