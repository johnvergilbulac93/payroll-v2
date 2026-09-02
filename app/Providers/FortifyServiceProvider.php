<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use App\Http\Requests\Auth\AuthRequest;
use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class FortifyServiceProvider extends ServiceProvider
{
    protected const MAX_ATTEMPTS = 3;
    protected const LOCKOUT_SECONDS = 60;
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureActions();
        $this->configureViews();
        $this->configureRateLimiting();
    }

    /**
     * Configure Fortify actions.
     */
    private function configureActions(): void
    {
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
        Fortify::createUsersUsing(CreateNewUser::class);
    }

    /**
     * Configure Fortify views.
     */
    private function configureViews(): void
    {
        Fortify::loginView(fn(Request $request) => Inertia::render('auth/login', [
            'canResetPassword' => Features::enabled(Features::resetPasswords()),
            'status' => $request->session()->get('status'),
        ]));
        Fortify::authenticateUsing(function (Request $request) {
            return $this->authenticate($request);
        });
        Fortify::resetPasswordView(fn(Request $request) => Inertia::render('auth/reset-password', [
            'email' => $request->email,
            'token' => $request->route('token'),
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
        ]));

        Fortify::requestPasswordResetLinkView(fn(Request $request) => Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::verifyEmailView(fn(Request $request) => Inertia::render('auth/verify-email', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::registerView(fn() => Inertia::render('auth/register', [
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
        ]));

        Fortify::twoFactorChallengeView(fn() => Inertia::render('auth/two-factor-challenge'));

        Fortify::confirmPasswordView(fn() => Inertia::render('auth/confirm-password'));
    }

    /**
     * Configure rate limiting.
     */
    private function configureRateLimiting(): void
    {
        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });

        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())) . '|' . $request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });

        RateLimiter::for('passkeys', function (Request $request) {
            return Limit::perMinute(10)->by(
                ($request->input('credential.id') ?: $request->session()->getId()) . '|' . $request->ip(),
            );
        });
    }
    public function authenticate(Request $request): User
    {

        $throttleKey = $this->throttleKey($request);
        $lockKey = "login_lockout:{$throttleKey}";
        $attemptsKey = "login_attempts:{$throttleKey}";

        if (Cache::has($lockKey)) {
            $expiresAt = Cache::get($lockKey);
            $secondsLeft = max(0, $expiresAt - now()->timestamp);

            throw ValidationException::withMessages([
                'username' => "Too many login attempts. Please try again in {$secondsLeft} seconds.",
            ]);
        }

        $user = User::where('username', $request->input(Fortify::username()))->first();
        $isValid = $user && Hash::check($request->password, $user->password);
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
        if (! $user->IsActive) {
            throw ValidationException::withMessages([
                'username' => 'This account is inactive. Please contact your administrator.',
            ]);
        }

        Cache::forget($attemptsKey);
        Cache::forget($lockKey);

        return $user;
    }
    private function throttleKey(Request $request): string
    {
        return Str::transliterate(
            Str::lower($request->input(Fortify::username())) . '|' . $request->ip()
        );
    }
}
