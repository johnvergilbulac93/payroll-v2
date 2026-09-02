<?php

namespace App\Http\Resources\User;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'name' => $this->name,
            'role_name' => $this->role?->name,
            'role' => (string) $this->role?->id,
            'username' => $this->username,
            'IsActive' => $this->IsActive,
            'date_created' => Carbon::parse($this->created_at)->format('F j, Y g:i A')
        ];
    }
}
