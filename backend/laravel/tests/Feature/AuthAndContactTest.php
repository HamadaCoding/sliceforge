<?php

namespace Tests\Feature;

use App\Mail\ContactInquiryMail;
use App\Mail\ContactReceiptMail;
use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class AuthAndContactTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_issues_a_token_and_sends_verification_email(): void
    {
        Notification::fake();

        $response = $this->postJson('/api/register', [
            'name' => 'Ada Lovelace',
            'email' => 'ada@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated()->assertJsonPath('user.email', 'ada@example.com');

        $user = User::query()->where('email', 'ada@example.com')->firstOrFail();
        Notification::assertSentTo($user, VerifyEmail::class);
        $this->assertNotEmpty($response->json('token'));
    }

    public function test_login_rejects_unknown_credentials(): void
    {
        $this->postJson('/api/login', [
            'email' => 'missing@example.com',
            'password' => 'password123',
        ])->assertUnprocessable();
    }

    public function test_verification_link_marks_the_email_verified(): void
    {
        $user = User::factory()->unverified()->create();

        $signedUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            [
                'id' => $user->id,
                'hash' => sha1($user->getEmailForVerification()),
            ],
        );

        $this->get($signedUrl)->assertRedirect('http://localhost:5173/login?verified=1');
        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_forgot_password_sends_a_reset_notification(): void
    {
        Notification::fake();
        $user = User::factory()->create();

        $this->postJson('/api/forgot-password', [
            'email' => $user->email,
        ])->assertOk();

        Notification::assertSentTo($user, ResetPassword::class);
    }

    public function test_contact_form_stores_the_message_and_sends_mail(): void
    {
        Mail::fake();

        $this->postJson('/api/contact', [
            'name' => 'Ada Lovelace',
            'email' => 'ada@example.com',
            'message' => 'The grid overlay is one pixel off on the last column.',
        ])->assertCreated();

        $this->assertDatabaseHas('contact_messages', [
            'email' => 'ada@example.com',
        ]);

        Mail::assertSent(ContactInquiryMail::class);
        Mail::assertSent(ContactReceiptMail::class);
    }
}
