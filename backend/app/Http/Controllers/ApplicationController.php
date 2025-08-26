<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Schedule;
use Illuminate\Http\Request;
use App\Mail\ApplicationApprovedMail;
use Illuminate\Support\Facades\Mail;    

class ApplicationController extends Controller
{
    /**
     * Store new application
     */
    public function store(Request $request)
    {
        $data = $request->all();

        // Force convert declaration to boolean (0/1)
        $data['declaration'] = $request->boolean('declaration');

        // Upload photo if exists
        if ($request->hasFile('photo')) {
            $data['photo_path'] = $request->file('photo')->store('photos', 'public');
        }

        // Check if schedule is provided
        if (isset($data['schedule_id'])) {
            $schedule = Schedule::withCount('applications')->findOrFail($data['schedule_id']);

            // check kung puno na
            if ($schedule->applications_count >= $schedule->limit) {
                return response()->json(['message' => 'Selected schedule is already full'], 400);
            }
        }

        // Create the application
        $application = Application::create($data);

        return response()->json([
            'message'     => 'Application submitted successfully!',
            'application' => $application
        ], 201);
    }

    /**
     * List applications with schedule relation
     */
    public function index()
    {
        return Application::with('schedule')->latest()->get();
    }
    /**
     * Delete application
     */
    public function destroy($id)
    {
        $application = Application::find($id);

        if (!$application) {
            return response()->json(['message' => 'Application not found'], 404);
        }

        $application->delete();

        return response()->json(['message' => 'Application deleted successfully']);
    }
    /**
     * Show single application
     */
    public function show($id)
{
    $application = Application::find($id);

    if (!$application) {
        return response()->json(['message' => 'Applicant not found.'], 404);
    }

    return response()->json($application);
}

 public function approve(Request $request, $id)
    {
        $application = Application::findOrFail($id);

        // Use the schedule already chosen by the applicant
        if (empty($application->schedule_id)) {
            return response()->json([
                'message' => 'Applicant has not selected a schedule. Please have the applicant choose a schedule before approving.'
            ], 422);
        }

        $schedule = $application->schedule; // may be null, but we checked schedule_id exists

        $application->status = 'approved';
        $application->approved_at = now();
        $application->save();

        // send email (consider queueing in production)
        try {
            Mail::to($application->email)->send(new ApplicationApprovedMail($application, $schedule));
        } catch (\Exception $e) {
            \Log::error('Mail send failed: '.$e->getMessage());
            // still return success for approval but warn admin
            return response()->json([
                'message' => 'Application approved but failed to send email.',
                'warning' => $e->getMessage(),
                'application' => $application
            ], 200);
        }

        return response()->json([
            'message' => 'Application approved and email sent.',
            'application' => $application
        ], 200);
    }
}