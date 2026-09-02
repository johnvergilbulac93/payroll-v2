<?php

namespace App\Http\Resources\Main\Biometric;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BiometricUploadingResource extends JsonResource
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
            'FileName' => $this->original_filename,
            'UploadedBy' => $this->uploadedBy->name,
            'Status' => $this->status,
            'TotalRows' =>  number_format($this->total_rows),
            'ImportedRows' => number_format($this->imported_rows),
            'SkippedRows' => number_format($this->skipped_rows),
            'FailedRows' => number_format($this->failed_rows),
            'StartedAt' => $this->started_at->format('Y-m-d H:i:s'),
            'FinishedAt' => $this->finished_at->format('Y-m-d H:i:s'),
            'DateUploaded' => $this->created_at->format('M d, Y g:i A'),
        ];
    }
}
