<?php
namespace App\Http\Controllers;

use App\Models\ExitBooking;
use App\Models\ExitInterviewSlot;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ExitBookingController extends Controller
{
    public function store(Request $request) {
        $validated = $request->validate([
            'slot_id'     => 'required|exists:exit_interview_slots,id',
            'last_name'   => 'required|string',
            'middle_name' => 'nullable|string',
            'first_name'  => 'required|string',
            'department'  => 'required|string',
            'course'      => 'required_if:department,College|nullable|string',
            'resume_link' => 'required_without:resume_file|nullable|url',
            'resume_file' => 'nullable|file|mimes:pdf',
        ]);

        $slot = ExitInterviewSlot::find($validated['slot_id']);
        if ($slot->bookings()->count() >= $slot->limit) {
            return response()->json(['error' => 'Slot full'], 422);
        }

        if ($request->hasFile('resume_file')) {
            $validated['resume_file'] = $request->file('resume_file')->store('resumes', 'public');
        }

        $booking = ExitBooking::create(array_merge($validated, ['status' => 'pending']));
        return $booking->load('slot');
    }

    // NEW: search by name (exact match on last + first; middle optional)
    public function search(Request $request)
    {
        $request->validate([
            'last_name' => 'required|string',
            'middle_name' => 'nullable|string',
            'first_name' => 'required|string',
        ]);

        $q = ExitBooking::where('last_name', $request->last_name)
            ->where('first_name', $request->first_name);

        if ($request->middle_name) {
            $q->where('middle_name', $request->middle_name);
        }

        $booking = $q->with('slot')->first();

        if (! $booking) {
            return response()->json(null, 404);
        }

        return response()->json($booking);
    }
    public function updateStatus(Request $request, $id)
{
    $request->validate([
        'status' => ['required', Rule::in(['booked','no_show','finished'])],
    ]);

    $booking = ExitBooking::findOrFail($id);

    // KEEP slot_id so it won't turn NULL
    $booking->update([
        'status' => $request->status,
        'slot_id' => $booking->slot_id, 
    ]);

    return response()->json(['message' => 'Status updated']);
}


    // NEW: update existing booking (reschedule / reason / resume optional)
    public function update(Request $request, ExitBooking $booking)
    {
        $validated = $request->validate([
            'slot_id'     => 'nullable|exists:exit_interview_slots,id',
            'department'  => 'nullable|string',
            'course'      => 'nullable|string',
            'resume_link' => 'nullable|url',
            'resume_file' => 'nullable|file|mimes:pdf',
            'reason'      => 'nullable|string',
            'status'      => ['nullable', Rule::in(['booked','no_show','finished'])],
        ]);

        // If changing slot, check capacity
        if (!empty($validated['slot_id']) && $validated['slot_id'] != $booking->slot_id) {
            $slot = ExitInterviewSlot::find($validated['slot_id']);
            if ($slot->bookings()->count() >= $slot->limit) {
                return response()->json(['error' => 'Slot full'], 422);
            }
            $booking->slot_id = $validated['slot_id'];
        }

        if ($request->hasFile('resume_file')) {
            // optionally delete previous file if you want:
            if ($booking->resume_file) {
                Storage::disk('public')->delete($booking->resume_file);
            }
            $booking->resume_file = $request->file('resume_file')->store('resumes', 'public');
            $booking->resume_link = null;
        } else {
            // update resume_link only if provided
            if (array_key_exists('resume_link', $validated) && $validated['resume_link']) {
                $booking->resume_link = $validated['resume_link'];
            }
        }

        if (array_key_exists('department', $validated) && $validated['department'] !== null) {
            $booking->department = $validated['department'];
        }
        if (array_key_exists('course', $validated) && $validated['course'] !== null) {
            $booking->course = $validated['course'];
        }
        if (array_key_exists('reason', $validated)) {
            $booking->reason = $validated['reason'];
        }
        if (array_key_exists('status', $validated) && $validated['status']) {
            $booking->status = $validated['status'];
        }

        $booking->save();

        return $booking->load('slot');
    }
}
