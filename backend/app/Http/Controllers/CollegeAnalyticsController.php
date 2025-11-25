<?php

namespace App\Http\Controllers;

use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CollegeAnalyticsController extends Controller
{
    /**
     * Return summary for all firstChoice values (courses).
     * Output: [{ course, totalApplicants, percent_of_all_applicants }]
     */
    public function index()
    {
        $totalAll = Application::count();

        $courses = Application::select('firstChoice', DB::raw('COUNT(*) as total'))
            ->whereNotNull('firstChoice')
            ->groupBy('firstChoice')
            ->orderByDesc('total')
            ->get()
            ->map(function($row) use ($totalAll) {
                return [
                    'course' => $row->firstChoice,
                    'totalApplicants' => (int)$row->total,
                    'percent_of_all_applicants' => $totalAll > 0 ? round(($row->total / $totalAll) * 100, 2) : 0
                ];
            });

        return response()->json([
            'total_applicants' => $totalAll,
            'courses' => $courses
        ]);
    }

    /**
     * Return analytics and paginated detail rows for a single course (firstChoice).
     * Supports query params: page, per_page, academicYear (optional).
     */
    public function courseDetail($course, Request $request)
    {
        $perPage = (int) $request->query('per_page', 50);
        $page = (int) $request->query('page', 1);
        $academicYear = $request->query('academicYear', null);

        // Base query
        $baseQuery = Application::where('firstChoice', $course);
        if ($academicYear) {
            $baseQuery = $baseQuery->where('academicYear', $academicYear);
        }

        $count = $baseQuery->count();

        if ($count === 0) {
            return response()->json([
                'course' => $course,
                'total' => 0,
                'message' => 'No applicants for this course'
            ]);
        }

        // Averages (rounded) for numeric percent fields
        $averagesQuery = Application::where('firstChoice', $course);
        if ($academicYear) $averagesQuery = $averagesQuery->where('academicYear', $academicYear);

        $averages = $averagesQuery
            ->selectRaw('
                ROUND(AVG(mat_iq), 2) as mat_iq_avg,
                ROUND(AVG(mat_percentile), 2) as mat_percentile_avg,
                ROUND(AVG(mat_rs), 2) as mat_rs_avg,
                ROUND(AVG(apt_verbal_percentile), 2) as apt_verbal_percentile_avg,
                ROUND(AVG(apt_num_percentile), 2) as apt_num_percentile_avg,
                ROUND(AVG(apt_total_percentile), 2) as apt_total_percentile_avg,
                ROUND(AVG(gwa_percentile), 2) as gwa_percentile_avg
            ')
            ->first();

        // Classification fields to group
        $groupFields = [
            'mat_classification',
            'apt_verbal_classification',
            'apt_num_classification',
            'apt_total_classification',
            'gwa_classification'
        ];

        $classificationStats = [];
        foreach ($groupFields as $field) {
            $q = Application::where('firstChoice', $course);
            if ($academicYear) $q = $q->where('academicYear', $academicYear);

            $rows = $q->select($field, DB::raw('COUNT(*) as total'))
                ->groupBy($field)
                ->get()
                ->map(function($r) use ($count, $field) {
                    $label = $r->{$field} ?? 'Unspecified';
                    return [
                        'classification' => $label,
                        'total' => (int) $r->total,
                        'percentage' => round(($r->total / $count) * 100, 2)
                    ];
                });

            $classificationStats[$field] = $rows;
        }

        // Payment distribution
        $payQ = Application::where('firstChoice', $course);
        if ($academicYear) $payQ = $payQ->where('academicYear', $academicYear);

        $paymentStats = $payQ->select('payment_type', DB::raw('COUNT(*) as total'))
            ->groupBy('payment_type')
            ->get()
            ->map(function($r) use ($count) {
                $label = $r->payment_type ?? 'Unspecified';
                return [
                    'payment_type' => $label,
                    'total' => (int) $r->total,
                    'percentage' => round(($r->total / $count) * 100, 2)
                ];
            });

        // Rows (paginated). Select the fields you requested plus personal info.
$selectFields = [
    'id',
    'nameFamily','nameGiven','nameMiddle',
    'mat_iq','mat_percentile','mat_classification','mat_rs',
    'apt_verbal_rs','apt_verbal_percentile','apt_verbal_classification',
    'apt_num_rs','apt_num_percentile','apt_num_classification',
    'apt_total_rs','apt_total_percentile','apt_total_classification',
    'gwa_percentile','gwa_classification',
    'remarks','payment_type','academicYear'
];


        $rowsQ = Application::where('firstChoice', $course);
        if ($academicYear) $rowsQ = $rowsQ->where('academicYear', $academicYear);

        $rows = $rowsQ->select($selectFields)
            ->orderBy('nameFamily')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        return response()->json([
            'course' => $course,
            'total' => $count,
            'page' => $page,
            'per_page' => $perPage,
            'averages' => $averages,
            'classification_stats' => $classificationStats,
            'payment_stats' => $paymentStats,
            'rows' => $rows
        ]);
    }
}
