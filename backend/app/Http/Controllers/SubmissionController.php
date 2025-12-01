<?php

namespace App\Http\Controllers;

use App\Models\Submission;
use Illuminate\Http\Request;
use App\Models\Application;

class SubmissionController extends Controller
{
public function updateScore(Request $request, $id)
{
    // Allowed fields for ALL levels
    $allowedFields = [
        // College
        'mat_rs',
        'apt_verbal_rs',
        'apt_num_rs',

        // Senior High School
        'cfit_rs',
        'olsat_verbal_rs',
        'olsat_nonverbal_rs',

        // Junior High School
        'vc_rs',
        'vr_rs',
        'fr_rs',
        'qr_rs',

        // Grade School (same as JHS)
        // cv_rs, vr_rs, fr_rs, qr_rs already included
    ];

    // Validate input
    $request->validate([
        'field' => 'required|string|in:' . implode(',', $allowedFields),
        'score' => 'required|numeric',
    ]);

    // Find the application
    $application = Application::findOrFail($id);

    // Update the selected field
    $application->{$request->field} = $request->score;
    $application->save();

    return response()->json(['message' => 'Score updated successfully']);
}

    public function index()
    {
        // I-load kasama exam at answers
        $submissions = Submission::with(['exam', 'answers'])->orderBy('created_at', 'desc')->get();

        return response()->json($submissions);
    }

        public function destroy($id)
    {
        $submission = Submission::find($id);
        if (!$submission) {
            return response()->json(['message' => 'Not found'], 404);
        }

        // Optional: authorize the user (policy) if needed
        // $this->authorize('delete', $submission);

        $submission->delete();

        return response()->json(['message' => 'Deleted'], 200);
    }
}
