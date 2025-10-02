<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Report;

class ReportController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'department' => 'required|string',
            'message' => 'nullable|string',
            'file' => 'nullable|file|mimes:pdf,doc,docx,jpg,png|max:2048'
        ]);

        $path = null;
        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('reports', 'public');
        }

        $report = Report::create([
            'staff_id' => auth()->id(), // kung naka-login yung staff
            'department' => $request->department,
            'message' => $request->message,
            'file_path' => $path,
        ]);

        return response()->json(['success' => true, 'report' => $report]);
    }

    public function index()
    {
        $reports = Report::with('staff')->latest()->get();
        return response()->json($reports);
    }
}
