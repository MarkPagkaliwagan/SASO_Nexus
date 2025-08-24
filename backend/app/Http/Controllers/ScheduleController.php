<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Schedule;

class ScheduleController extends Controller
{
    /**
     * List all schedules
     */
    public function index()
    {
    return Schedule::withCount('applications')
        ->orderBy('date', 'desc')
        ->orderBy('time', 'desc')
        ->get()
        ->map(function ($s) {
            return [
                'id'      => $s->id,
                'date'    => $s->date->format('Y-m-d'), // YYYY-MM-DD lang
                'time'    => date('H:i', strtotime($s->time)), // HH:MM lang
                'limit'   => $s->limit,
                'booked'  => $s->applications_count, // computed
            ];
        });
    }

    /**
     * Create new schedule
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'date'  => 'required|date',
            'time'  => 'required',
            'limit' => 'required|integer|min:1',
        ]);

        $schedule = Schedule::create($data);

        return response()->json($schedule, 201);
    }

    /**
     * Delete schedule
     */
    public function destroy($id)
    {
        $s = Schedule::findOrFail($id);
        $s->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
