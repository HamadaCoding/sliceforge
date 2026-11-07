<!DOCTYPE html>
<html lang="en">
<body style="font-family: Segoe UI, sans-serif; color: #0f172a; line-height: 1.5;">
    <h1 style="font-size: 18px;">New contact message</h1>
    <p><strong>{{ $contactMessage->name }}</strong> ({{ $contactMessage->email }}) wrote:</p>
    <p style="white-space: pre-wrap;">{{ $contactMessage->message }}</p>
</body>
</html>
