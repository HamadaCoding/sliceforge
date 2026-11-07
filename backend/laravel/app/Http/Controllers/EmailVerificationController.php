<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * Handles signed email verification callbacks dispatched by Laravel's notification system.
 */
class EmailVerificationController extends Controller
{
    /**
     * Validates a signed verification link and redirects the user to the frontend login view.
     * 
     * Route parameters `$id` and `$hash` match Laravel's built-in VerifyEmail notification contract.
     */
    public function verify(Request $request, string $id, string $hash): RedirectResponse
    {
        $targetUserId = $id;
        $incomingVerificationHash = $hash;

        /** @var User $verifiedUser */
        $verifiedUser = User::query()->findOrFail($targetUserId);

        if (! hash_equals(sha1($verifiedUser->getEmailForVerification()), $incomingVerificationHash)) {
            abort(403, 'Invalid or tampered email verification signature.');
        }

        if (! $verifiedUser->hasVerifiedEmail()) {
            $verifiedUser->markEmailAsVerified();
            event(new Verified($verifiedUser));
        }

        $frontendBaseUrl = rtrim((string) config('app.frontend_url', 'http://localhost:5173'), '/');

        return redirect()->away($frontendBaseUrl . '/login?verified=1');
    }
}

