<!DOCTYPE html>
<html>
<head>
    <title>Reset Admin Password</title>
</head>
<body>
    <h2>Reset Password</h2>

    <form method="POST" action="{{ url('/api/admin/reset-password') }}">
        @csrf
        <input type="hidden" name="token" value="{{ request()->get('token') }}">
        <input type="hidden" name="email" value="{{ request()->get('email') }}">

        <div>
            <label>New Password:</label>
            <input type="password" name="password" required>
        </div>

        <div>
            <label>Confirm Password:</label>
            <input type="password" name="password_confirmation" required>
        </div>

        <button type="submit">Reset Password</button>
    </form>
</body>
</html>
