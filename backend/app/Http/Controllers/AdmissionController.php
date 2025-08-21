<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAdmissionRequest;
use App\Models\Admission;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Exception;

class AdmissionController extends Controller
{
    /**
     * Store a newly created admission in storage.
     */
    public function store(StoreAdmissionRequest $request): JsonResponse
    {
        $data = $request->validated();

        // sanitize/trim strings
        array_walk($data, function (&$value, $key) {
            if (is_string($value)) {
                $value = trim($value);
            }
        });

        try {
            $admission = Admission::create($data);

            return response()->json([
                'message' => 'Application received successfully.',
                'data' => $admission,
            ], 201);
        } catch (Exception $e) {
            Log::error('Admission save failed: '.$e->getMessage(), [
                'exception' => $e,
                'payload' => $data,
            ]);

            return response()->json([
                'message' => 'Server error while saving application. Please try again later.',
            ], 500);
        }
    }
}
