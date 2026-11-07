<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ContactInquiryMail;
use App\Mail\ContactReceiptMail;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    /**
     * Persist a contact message and send it through Laravel's mailer.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $contactMessage = ContactMessage::query()->create($validated);

        $inbox = (string) config('mail.contact_inbox');

        Mail::to($inbox)->send(new ContactInquiryMail($contactMessage));
        Mail::to($contactMessage->email)->send(new ContactReceiptMail($contactMessage));

        return response()->json([
            'message' => 'Message sent. A confirmation email is on its way.',
        ], 201);
    }
}
