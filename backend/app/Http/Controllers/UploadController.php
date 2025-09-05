<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    public function store(Request $request)
    {
        try {
            $request->validate([
                'file' => 'required|file|max:10240|mimes:jpg,jpeg,png,gif,svg',
            ]);

            $file = $request->file('file');
            $path = $file->store('uploads', 'public'); // stores in storage/app/public/uploads
            $url = asset('storage/' . $path);

            return response()->json(['url' => $url, 'path' => $path]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
