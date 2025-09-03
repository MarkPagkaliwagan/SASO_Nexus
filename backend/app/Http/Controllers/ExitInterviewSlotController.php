<?php
namespace App\Http\Controllers;

use App\Models\ExitInterviewSlot;
use Illuminate\Http\Request;

class ExitInterviewSlotController extends Controller
{
public function index(Request $request) {
    // include trashed so bookings remain visible even if slot soft-deleted
    return ExitInterviewSlot::with(['bookings'])
                ->withCount('bookings')
                ->withTrashed()
                ->get();
}


    public function store(Request $request) {
        $validated = $request->validate([
            'date' => 'required|date',
            'time' => 'required',
            'limit' => 'required|integer|min:1',
            'department' => 'required|string|in:College,SHS,JHS,GS'
        ]);
        return ExitInterviewSlot::create($validated);
    }

    public function destroy($id) {
        ExitInterviewSlot::findOrFail($id)->delete();
        return response()->json(['message' => 'Slot deleted']);
    }
}
