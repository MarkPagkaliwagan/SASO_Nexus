<?php
namespace App\Http\Controllers;

use App\Models\ExitBooking;
use App\Models\ExitInterviewSlot;
use Illuminate\Http\Request;

class ExitBookingController extends Controller
{
    public function store(Request $request) {
        $validated = $request->validate([
            'slot_id' => 'required|exists:exit_interview_slots,id',
            'last_name' => 'required|string',
            'middle_name' => 'nullable|string',
            'first_name' => 'required|string',
            'department' => 'required|string',
            'resume_link' => 'nullable|url',
            'resume_file' => 'nullable|file|mimes:pdf'
        ]);

        $slot = ExitInterviewSlot::find($validated['slot_id']);
        if ($slot->bookings()->count() >= $slot->limit) {
            return response()->json(['error' => 'Slot full'], 400);
        }

        if ($request->hasFile('resume_file')) {
            $validated['resume_file'] = $request->file('resume_file')->store('resumes', 'public');
        }

        $booking = ExitBooking::create($validated);
        return $booking->load('slot');
    }

        public function updateStatus(Request $request, $id) {
        $booking = ExitBooking::findOrFail($id);
        $validated = $request->validate([
            'status' => 'required|in:pending,finished,no_show'
        ]);
        $booking->update(['status' => $validated['status']]);
        return response()->json(['message' => 'Status updated', 'booking' => $booking]);
    }

}
