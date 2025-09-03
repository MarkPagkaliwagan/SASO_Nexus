<?php
namespace App\Http\Controllers;

use App\Models\ExitBooking;
use App\Models\ExitInterviewSlot;
use Illuminate\Http\Request;

class ExitBookingController extends Controller
{
public function store(Request $request) {
    $validated = $request->validate([
        'slot_id'     => 'required|exists:exit_interview_slots,id',
        'last_name'   => 'required|string',
        'middle_name' => 'nullable|string',
        'first_name'  => 'required|string',
        'department'  => 'required|string',
        // only required when department is College:
        'course'      => 'required_if:department,College|nullable|string',
        // resume rules: require one of the two (file OR url)
        'resume_link' => 'required_without:resume_file|nullable|url',
        'resume_file' => 'nullable|file|mimes:pdf',
    ]);

    $slot = ExitInterviewSlot::find($validated['slot_id']);
    if ($slot->bookings()->count() >= $slot->limit) {
        // slot full — use 422 Unprocessable Entity for consistency with validation errors
        return response()->json(['error' => 'Slot full'], 422);
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
