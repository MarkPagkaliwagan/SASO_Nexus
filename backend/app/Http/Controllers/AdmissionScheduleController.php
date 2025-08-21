<?php
// app/Http/Controllers/AdmissionScheduleController.php

namespace App\Http\Controllers;

use App\Models\AdmissionSchedule;
use Illuminate\Http\Request;

class AdmissionScheduleController extends Controller
{
    public function index()
    {
        return AdmissionSchedule::orderBy('date_time')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date_time' => 'required|date',
            'limit' => 'required|integer|min:1',
        ]);

        $schedule = AdmissionSchedule::create($validated);

        return response()->json($schedule, 201);
    }

    public function destroy(AdmissionSchedule $admissionSchedule)
    {
        $admissionSchedule->delete();
        return response()->json(null, 204);
    }
}
