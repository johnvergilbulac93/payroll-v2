<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Laravel\Fortify\Fortify;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthRequest extends FormRequest
{
    protected const MAX_ATTEMPTS = 5;
    protected const LOCKOUT_SECONDS = 60;
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            Fortify::username() => ['required', 'string'],
            'password' => ['required', 'string'],
        ];
    }

    public function authenticate()
    {

        $throttleKey = $this->throttleKey();
        $lockKey = "login_lockout:{$throttleKey}";
        $attemptsKey = "login_attempts:{$throttleKey}";

        if (Cache::has($lockKey)) {
            $expiresAt = Cache::get($lockKey);
            $secondsLeft = max(0, $expiresAt - now()->timestamp);

            throw ValidationException::withMessages([
                'username' => "Too many login attempts. Please try again in {$secondsLeft} seconds.",
            ]);
        }

        $user = User::where('username', $this->input(Fortify::username()))->first();
        $isValid = $user && Hash::check($this->password, $user->password);
        if (! $isValid) {
            $attempts = Cache::get($attemptsKey, 0) + 1;
            Cache::put($attemptsKey, $attempts, self::LOCKOUT_SECONDS);

            if ($attempts >= self::MAX_ATTEMPTS) {
                $expiresAt = now()->addSeconds(self::LOCKOUT_SECONDS)->timestamp;
                Cache::put($lockKey, $expiresAt, self::LOCKOUT_SECONDS);
                Cache::forget($attemptsKey);

                throw ValidationException::withMessages([
                    'username' => 'Too many login attempts. Please try again in ' . self::LOCKOUT_SECONDS . ' seconds.',
                ]);
            }

            throw ValidationException::withMessages([
                'username' => 'These credentials do not match our records.',
            ]);
        }
        if (! $user->isActive) {
            throw ValidationException::withMessages([
                'username' => 'This account is inactive. Please contact your administrator.',
            ]);
        }

        Cache::forget($attemptsKey);
        Cache::forget($lockKey);

        return $user;
    }
}
