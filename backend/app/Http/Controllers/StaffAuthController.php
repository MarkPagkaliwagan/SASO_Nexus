<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Staff;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class StaffAuthController extends Controller
{
    /**
     * Return distinct departments (pulled from staffs.department column)
     */
    public function departments()
    {
        $deps = Staff::whereNotNull('department')
            ->selectRaw('DISTINCT department as name')
            ->orderBy('department')
            ->get()
            ->map(function ($row) {
                $name = trim($row->name);
                return [
                    'name' => $name,
                    'slug' => Str::slug($name),
                ];
            });

        return response()->json($deps);
    }

    /**
     * Login using email + password + department (string)
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'department' => 'required|string',
        ]);

        $email = $request->email;
        $department = trim($request->department);

        // Find staff by email
        $staff = Staff::where('email', $email)->first();

        if (!$staff) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Compare department (case-insensitive, trimmed)
        $staffDept = trim((string) $staff->department);
        if (strcasecmp($staffDept, $department) !== 0) {
            return response()->json(['message' => 'User does not belong to the selected department'], 403);
        }

        if (!Hash::check($request->password, $staff->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Create token
        $token = $staff->createToken('staff-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'staff' => [
                'id' => $staff->id,
                'name' => $staff->name,
                'email' => $staff->email,
                // return department as object with slug for routing
                'department' => [
                    'name' => $staffDept,
                    'slug' => Str::slug($staffDept),
                ],
            ],
            'token' => $token,
        ]);
    }

    /**
     * Forgot password (by email) - same as before
     */
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $staff = Staff::where('email', $request->email)->first();

        if (!$staff) {
            return response()->json(['message' => 'No staff with that email'], 404);
        }

        $token = \Str::random(64);

        // send notification (use your existing notification)
        $staff->sendPasswordResetNotification($token);

        // store hashed token in password_resets table (recommended)
        \DB::table('password_resets')->updateOrInsert(
            ['email' => $staff->email],
            ['token' => \Hash::make($token), 'created_at' => now()]
        );

        return response()->json(['message' => 'Reset token sent to your email.']);
    }
}
