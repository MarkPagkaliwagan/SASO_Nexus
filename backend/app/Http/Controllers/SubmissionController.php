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
}
