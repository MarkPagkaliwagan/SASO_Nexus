<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class AnnouncementController extends Controller
{
    /**
     * Display all announcements.
     */
    public function index()
    {
        $announcements = Announcement::latest()->get()->map(function ($a) {
            return $this->appendMediaUrls($a);
        });

        return response()->json($announcements, 200);
    }

    /**
     * Store a new announcement.
     */
    public function store(Request $request)
    {
        $request->validate([
            'department' => 'required|string',
            'announcement' => 'required|string',
            'image' => 'nullable|image|max:20480', // 20 MB
            'video' => 'nullable|mimes:mp4,mov,avi|max:102400' // 100 MB
        ]);

        $imagePath = null;
        $videoPath = null;

        try {
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('announcements', 'public');
                // ensure visibility just in case
                Storage::disk('public')->setVisibility($imagePath, 'public');
            }

            if ($request->hasFile('video')) {
                $videoPath = $request->file('video')->store('announcements', 'public');
                Storage::disk('public')->setVisibility($videoPath, 'public');
            }
        } catch (\Throwable $e) {
            Log::error('Failed to store media for announcement', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to store uploaded files'], 500);
        }

        $announcement = Announcement::create([
            'department' => $request->department,
            'announcement' => $request->announcement,
            'image' => $imagePath,
            'video' => $videoPath
        ]);

        $announcement = $this->appendMediaUrls($announcement);

        return response()->json($announcement, 201);
    }

    /**
     * Update an existing announcement.
     */
    public function update(Request $request, $id)
    {
        $announcement = Announcement::findOrFail($id);

        $request->validate([
            'department' => 'required|string',
            'announcement' => 'required|string',
            'image' => 'nullable|image|max:20480', // keep consistent 20 MB
            'video' => 'nullable|mimes:mp4,mov,avi|max:102400' // 100 MB
        ]);

        $announcement->department = $request->department;
        $announcement->announcement = $request->announcement;

        // Handle image update
        if ($request->hasFile('image')) {
            if ($announcement->image) {
                Storage::disk('public')->delete($announcement->image);
            }
            $path = $request->file('image')->store('announcements', 'public');
            Storage::disk('public')->setVisibility($path, 'public');
            $announcement->image = $path;
        }

        // Handle video update
        if ($request->hasFile('video')) {
            if ($announcement->video) {
                Storage::disk('public')->delete($announcement->video);
            }
            $path = $request->file('video')->store('announcements', 'public');
            Storage::disk('public')->setVisibility($path, 'public');
            $announcement->video = $path;
        }

        $announcement->save();

        $announcement = $this->appendMediaUrls($announcement);

        return response()->json($announcement, 200);
    }

    /**
     * Delete an announcement.
     */
    public function destroy($id)
    {
        $announcement = Announcement::findOrFail($id);

        // Delete image if exists
        if ($announcement->image) {
            Storage::disk('public')->delete($announcement->image);
        }

        // Delete video if exists
        if ($announcement->video) {
            Storage::disk('public')->delete($announcement->video);
        }

        $announcement->delete();

        return response()->json(['message' => 'Announcement deleted successfully'], 200);
    }

    /**
     * Attach full public URLs for image/video to model array.
     */
    protected function appendMediaUrls(Announcement $a)
    {
        $arr = $a->toArray();

        if ($a->image) {
            // Storage::url returns "/storage/announcements/xxx"
            $arr['image_url'] = url(Storage::url($a->image));
        } else {
            $arr['image_url'] = null;
        }

        if ($a->video) {
            $arr['video_url'] = url(Storage::url($a->video));
        } else {
            $arr['video_url'] = null;
        }

        return $arr;
    }
}
