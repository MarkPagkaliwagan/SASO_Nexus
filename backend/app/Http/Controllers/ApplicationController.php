<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Schedule;
use Illuminate\Http\Request;
use App\Mail\ApplicationApprovedMail;
use Illuminate\Support\Facades\Mail;    

class ApplicationController extends Controller
{

    public function updateResults(Request $request, $id)
    {
        $application = Application::findOrFail($id);

$application->update($request->only([
    // College
    'mat_rs','mat_iq','mat_percentile','mat_classification',
    'apt_verbal_rs','apt_verbal_percentile','apt_verbal_classification',
    'apt_num_rs','apt_num_percentile','apt_num_classification',
    'apt_total_rs','apt_total_percentile','apt_total_classification',
    'gwa_percentile','gwa_classification',

    // SHS
    'cfit_rs','cfit_iq','cfit_pc','cfit_classification',
    'olsat_verbal_rs','olsat_verbal_ss','olsat_verbal_percentile','olsat_verbal_stanine','olsat_verbal_classification',
    'olsat_nonverbal_rs','olsat_nonverbal_ss','olsat_nonverbal_pc','olsat_nonverbal_stanine','olsat_nonverbal_classification',
    'olsat_total_rs','olsat_total_ss','olsat_total_pc','olsat_total_stanine','olsat_total_classification',

    // JHS
    'vc_rs','vc_pc','vr_rs','vr_pc','fr_rs','fr_pc','qr_rs','qr_pc',
    'verbal_rs','verbal_pc','nonverbal_rs','nonverbal_pc','overall_rs','overall_pc',

    // Common
    'remarks'
]));


        return response()->json([
            'message' => 'Exam results updated successfully.',
            'application' => $application
        ], 200);
    }

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

public function togglePayment($id)
{
    $app = Application::findOrFail($id);
    $app->payment_type = $app->payment_type === 'free' ? 'paid' : 'free';
    $app->save();

    return response()->json($app);
}

}