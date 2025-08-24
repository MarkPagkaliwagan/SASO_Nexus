<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Schedule;
use Illuminate\Http\Request;

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
            $schedule = Schedule::findOrFail($data['schedule_id']);

            // check kung puno na
            if ($schedule->booked >= $schedule->limit) {
                return response()->json(['message' => 'Selected schedule is already full'], 400);
            }

            // dagdagan booked count
            $schedule->booked += 1;
            $schedule->save();
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
}
