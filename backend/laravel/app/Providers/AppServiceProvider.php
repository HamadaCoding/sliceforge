<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Point password-reset emails at the React page that talks to the API.
     */
    public function boot(): void
    {
        ResetPassword::createUrlUsing(function (User $user, string $token) {
            $frontendUrl = rtrim((string) config('app.frontend_url'), '/');
            $email = urlencode($user->getEmailForPasswordReset());

            return $frontendUrl.'/reset-password?token='.$token.'&email='.$email;
        });
    }
}
