<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // Validate the input
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        // Find admin by email
        $admin = Admin::where('email', $request->email)->first();

        // Check if admin exists and password is correct
        if (!$admin || !Hash::check($request->password, $admin->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Create token using Laravel Sanctum
        $token = $admin->createToken('admin-token')->plainTextToken;

        // Return successful login response
        return response()->json([
            'message' => 'Login successful',
            'admin' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email
            ],
            'token' => $token
        ]);
    }

    public function forgotPassword(Request $request)
    {
        // Validate email input
        $request->validate([
            'email' => 'required|email|exists:admins,email'
        ]);

        // Generate token
        $token = Str::random(60);

        // Store or update password reset record
        DB::table('password_resets')->updateOrInsert(
            ['email' => $request->email],
            [
                'token' => $token,
                'created_at' => now()
            ]
        );

        // Send email (customize as needed)
        Mail::raw("Your password reset token is: $token", function ($message) use ($request) {
            $message->to($request->email)
                    ->subject('Reset Password Token');
        });

        return response()->json([
            'message' => 'Password reset token sent to your email.'
        ]);
    }

    public function resetPassword(Request $request)
    {
        // Validate input
        $request->validate([
            'email' => 'required|email|exists:admins,email',
            'token' => 'required',
            'password' => 'required|confirmed|min:6',
        ]);

        // Check if token exists and is valid
        $check = DB::table('password_resets')
            ->where('email', $request->email)
            ->where('token', $request->token)
            ->first();

        if (!$check) {
            return response()->json(['message' => 'Invalid token.'], 400);
        }

        // Update password
        Admin::where('email', $request->email)
            ->update(['password' => bcrypt($request->password)]);

        // Delete the password reset token
        DB::table('password_resets')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Password has been reset.']);
    }
}
