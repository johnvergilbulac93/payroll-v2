<?php

namespace App\Http\Resources\Maintenance;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Spatie\Activitylog\Models\Activity;

class ActivityLogResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var Activity $activity */
        $activity = $this->resource;
        $subject = $activity->subject;

        return [
            'id' => $activity->id,
            'date' => $activity->created_at?->format('Y-m-d H:i:s'),
            'user' => $activity->causer?->name
                ?? $activity->causer?->username
                ?? 'System',
            'event' => $activity->event ?? 'activity',
            'module' => $activity->log_name ?? 'default',
            'description' => $activity->description,
            'subject' => $subject?->name
                ?? $subject?->FullName
                ?? $subject?->Name
                ?? ($subject
                    ? class_basename($subject) . ' #' . $subject->getKey()
                    : null),
        ];
    }
}
