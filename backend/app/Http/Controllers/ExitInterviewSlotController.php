<?php
namespace App\Http\Controllers;

use App\Models\ExitInterviewSlot;
use Illuminate\Http\Request;

class ExitInterviewSlotController extends Controller
{
    public function index() {
        return ExitInterviewSlot::with(['bookings'])->withCount('bookings')->get();
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'date' => 'required|date',
            'time' => 'required',
            'limit' => 'required|integer|min:1'
        ]);
        return ExitInterviewSlot::create($validated);
    }

    public function destroy($id) {
        ExitInterviewSlot::findOrFail($id)->delete();
        return response()->json(['message' => 'Slot deleted']);
    }
}
