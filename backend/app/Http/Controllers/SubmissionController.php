<?php

namespace App\Http\Controllers;

use App\Models\Submission;
use Illuminate\Http\Request;

class SubmissionController extends Controller
{
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
