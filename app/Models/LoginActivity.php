<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class LoginActivity extends Model
{
    protected $fillable = [
        'user_id',
        'username',
        'event',
        'session_id',
        'ip_address',
        'user_agent',
        'failure_reason',
    ];

    public static function record(
        string $event,
        ?string $username = null,
        ?User $user = null,
        ?string $failureReason = null,
        ?Request $request = null,
    ): void {
        $request ??= request();

        self::query()->create([
            'user_id' => $user?->getKey(),
            'username' => $username ?? $user?->username,
            'event' => $event,
            'session_id' => $request->hasSession() ? $request->session()->getId() : null,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'failure_reason' => $failureReason,
        ]);
    }

    public function user()
    {
        return $this->belongsTo(User::class)->withTrashed();
    }
}
