<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
// AnalyticsController.php
public function academicYears()
{
    $years = DB::table('applications')
        ->select('academicYear')
        ->distinct()
        ->orderBy('academicYear', 'desc')
        ->get();

    return response()->json($years);
}


public function applications(Request $request)
{
    $year = $request->query('academicYear'); // Kunin ang selected year

    $query = DB::table('applications')
        ->select('applicationType', DB::raw('COUNT(*) as total'))
        ->groupBy('applicationType');

    if ($year) { // Kung may selected year, i-filter
        $query->where('academicYear', $year);
    }

    $data = $query->get();

    return response()->json($data);
}


public function payments(Request $request)
{
    $year = $request->query('academicYear');

    $query = DB::table('applications')
        ->selectRaw('applicationType, payment_type, DATE(created_at) as date, COUNT(*) as total')
        ->groupBy('applicationType', 'payment_type', 'date')
        ->orderBy('date', 'asc');

    if ($year) {
        $query->where('academicYear', $year);
    }

    $data = $query->get();

    return response()->json($data);
}

public function exitBookings()
{
    $departments = DB::table('exit_bookings')
        ->select('department', DB::raw('COUNT(*) as total'))
        ->groupBy('department')
        ->orderBy('total', 'desc')
        ->get();

    $statusBreakdown = DB::table('exit_bookings')
        ->select('department', 'status', DB::raw('COUNT(*) as count'))
        ->groupBy('department', 'status')
        ->orderBy('department')
        ->get();

    return response()->json([
        'departments' => $departments,
        'statusBreakdown' => $statusBreakdown,
    ]);
}


}
