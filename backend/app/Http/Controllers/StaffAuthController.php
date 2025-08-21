<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Staff;
use Illuminate\Support\Facades\Hash;

class StaffAuthController extends Controller
{
    public function login(Request $request)
    {
        // Validate the input
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        // Find staff by email
        $staff = Staff::where('email', $request->email)->first();

        // Check if staff exists and password is correct
        if (!$staff || !Hash::check($request->password, $staff->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Create token using Laravel Sanctum
        $token = $staff->createToken('staff-token')->plainTextToken;

        // Return successful login response
        return response()->json([
            'message' => 'Login successful',
            'staff' => [
                'id' => $staff->id,
                'name' => $staff->name,
                'email' => $staff->email,
                'position' => $staff->position ?? null,
            ],
            'token' => $token
        ]);
    }
}
