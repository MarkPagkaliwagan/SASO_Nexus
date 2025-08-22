<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Schedule;

class ScheduleController extends Controller
{
    public function index()
    {
        return Schedule::orderBy('date','desc')
            ->orderBy('time','desc')
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'date'  => 'required|date',
            'time'  => 'required',
            'limit' => 'required|integer|min:1',
        ]);

        $schedule = Schedule::create([
            'date'   => $data['date'],
            'time'   => $data['time'],
            'limit'  => $data['limit'],
            'booked' => 0,
        ]);

        return response()->json($schedule, 201);
    }

    public function destroy($id)
    {
        $s = Schedule::findOrFail($id);
        $s->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
