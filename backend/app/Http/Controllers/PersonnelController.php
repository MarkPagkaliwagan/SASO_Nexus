<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Personnel;

class PersonnelController extends Controller
{
    // Store new personnel
    public function store(Request $request)
    {
        $request->validate([
            'fullName' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'contact' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'unit' => 'required|string|max:255',
            'profile' => 'nullable|image|max:2048',
        ]);

        $profilePath = null;
        if ($request->hasFile('profile')) {
            $profilePath = $request->file('profile')->store('profiles', 'public');
        }

        $personnel = Personnel::create([
            'fullName' => $request->fullName,
            'email' => $request->email,
            'contact' => $request->contact,
            'position' => $request->position,
            'unit' => $request->unit,
            'profile' => $profilePath,
        ]);

        $personnel->refresh();

        return response()->json(['message' => 'Personnel added successfully!', 'data' => $personnel]);
    }

    // Get all personnel
    public function index()
    {
        $personnels = Personnel::all();
        return response()->json($personnels);
    }

    // Get single personnel
    public function show($id)
    {
        $personnel = Personnel::find($id);

        if (!$personnel) {
            return response()->json(['message' => 'Personnel not found'], 404);
        }

        return response()->json($personnel);
    }

    // Update personnel
    public function update(Request $request, $id)
    {
        $personnel = Personnel::find($id);

        if (!$personnel) {
            return response()->json(['message' => 'Personnel not found'], 404);
        }

        $request->validate([
            'fullName' => 'sometimes|string|max:255',
            'email' => 'nullable|email|max:255',
            'contact' => 'sometimes|string|max:255',
            'position' => 'sometimes|string|max:255',
            'unit' => 'sometimes|string|max:255',
            'profile' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('profile')) {
            if ($personnel->profile && \Storage::disk('public')->exists($personnel->profile)) {
                \Storage::disk('public')->delete($personnel->profile);
            }
            $profilePath = $request->file('profile')->store('profiles', 'public');
            $personnel->profile = $profilePath;
        }

        $personnel->fill($request->only(['fullName', 'email', 'contact', 'position', 'unit']));
        $personnel->save();
        $personnel->refresh();

        return response()->json([
            'message' => 'Personnel updated successfully!',
            'data' => $personnel
        ]);
    }

    // Delete personnel
    public function destroy($id)
    {
        $personnel = Personnel::find($id);

        if (!$personnel) {
            return response()->json(['message' => 'Personnel not found'], 404);
        }

        $personnel->delete();

        return response()->json(['message' => 'Personnel deleted successfully!']);
    }
}
