<!DOCTYPE html>
<html lang="en">
<body style="font-family: Segoe UI, sans-serif; color: #0f172a; line-height: 1.5;">
    <h1 style="font-size: 18px;">Thanks, {{ $contactMessage->name }}</h1>
    <p>We received your message and will reply to {{ $contactMessage->email }}.</p>
    <p style="white-space: pre-wrap;">{{ $contactMessage->message }}</p>
</body>
</html>
