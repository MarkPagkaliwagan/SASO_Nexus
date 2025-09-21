<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Staff;

class StaffController extends Controller
{
    public function index()
    {
        $staffs = Staff::all()->map(function ($staff) {
            return [
                'id' => $staff->id,
                'name' => $staff->name,
                'email' => $staff->email,
                'department' => $staff->department,
                'password' => $staff->password,
                'remember_token' => $staff->remember_token,
                'created_at' => $staff->created_at,
                'updated_at' => $staff->updated_at,
            ];
        });

        return response()->json($staffs);
    }

    public function show($id)
    {
        $staff = Staff::find($id);

        if (!$staff) {
            return response()->json(['message' => 'Staff not found'], 404);
        }

        return response()->json($staff);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:staffs,email',
            'password' => 'required|string|min:6',
            'department' => 'nullable|string',
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $staff = Staff::create($validated);

        return response()->json($staff, 201);
    }

    public function update(Request $request, $id)
    {
        $staff = Staff::find($id);

        if (!$staff) {
            return response()->json(['message' => 'Staff not found'], 404);
        }

        $staff->update($request->only(['name', 'email', 'department']));

        if ($request->filled('password')) {
            $staff->password = Hash::make($request->password);
            $staff->save();
        }

        return response()->json($staff);
    }

    public function destroy($id)
    {
        $staff = Staff::find($id);

        if (!$staff) {
            return response()->json(['message' => 'Staff not found'], 404);
        }

        $staff->delete();

        return response()->json(['message' => 'Staff deleted successfully']);
    }
}
