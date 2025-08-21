<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Event;
use Illuminate\Support\Facades\Storage;

class EventController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'academic_year' => 'required|string',
            'department' => 'required|string',
            'description' => 'required|string',
            'image' => 'nullable|image|max:2048', // max 2MB
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('events', 'public');
        }

        $event = Event::create([
            'academic_year' => $request->academic_year,
            'department' => $request->department,
            'description' => $request->description,
            'image' => $imagePath,
        ]);

        return response()->json([
            'message' => 'Event created successfully!',
            'event' => $event
        ]);
    }
    public function index()
{
    $events = Event::orderBy('created_at', 'desc')->get();
    return response()->json(['events' => $events]);
}

}
