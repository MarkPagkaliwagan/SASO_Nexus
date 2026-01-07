<?php

namespace App\Http\Controllers;

use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CollegeAnalyticsController extends Controller
{
    /**
     * GET /api/college-analytics
     * Summary of all firstChoice courses
     */
    public function index()
    {
        $totalAll = Application::count();

        $courses = Application::select('firstChoice', DB::raw('COUNT(*) as total'))
            ->whereNotNull('firstChoice')
            ->groupBy('firstChoice')
            ->orderByDesc('total')
            ->get()
            ->map(function ($row) use ($totalAll) {
                return [
                    'course' => $row->firstChoice,
                    'totalApplicants' => (int)$row->total,
                    'percent_of_all_applicants' =>
                        $totalAll > 0 ? round(($row->total / $totalAll) * 100, 2) : 0
                ];
            });

        return response()->json([
            'total_applicants' => $totalAll,
            'courses' => $courses
        ]);
    }

    /**
     * GET /api/analytics/college/{course}
     * Analytics + paginated rows for a single course
     * Supports query params: page, per_page, academicYear
     */
    public function courseDetail($course, Request $request)
    {
        $perPage = (int) $request->query('per_page', 50);
        $page = (int) $request->query('page', 1);
        $academicYear = $request->query('academicYear');

        /** ----------------------------
         * BASE QUERY
         * --------------------------- */
        $baseQuery = Application::where('firstChoice', $course);
        if ($academicYear) $baseQuery->where('academicYear', $academicYear);

        $total = (clone $baseQuery)->count();

        if ($total === 0) {
            return response()->json([
                'course' => $course,
                'total' => 0,
                'page' => $page,
                'per_page' => $perPage,
                'averages' => (object) [],
                'classification_stats' => [],
                'payment_stats' => [],
                'rows' => []
            ]);
        }

        /** ----------------------------
         * AVERAGES (numeric fields)
         * --------------------------- */
        $avgFields = [
            'mat_iq',
            'mat_percentile',
            'mat_rs',
            'apt_verbal_percentile',
            'apt_num_percentile',
            'apt_total_percentile',
            'gwa_percentile'
        ];

        $averages = [];
        foreach ($avgFields as $field) {
            $val = (clone $baseQuery)->avg($field);
            $averages[$field.'_avg'] = is_numeric($val) ? round($val, 2) : null;
        }

        /** ----------------------------
         * CLASSIFICATION STATS
         * --------------------------- */
        $groupFields = [
            'mat_classification',
            'apt_verbal_classification',
            'apt_num_classification',
            'apt_total_classification',
            'gwa_classification'
        ];

        $classificationStats = [];
        foreach ($groupFields as $field) {
            $rows = (clone $baseQuery)
                ->select($field, DB::raw('COUNT(*) as total'))
                ->groupBy($field)
                ->get()
                ->map(function($r) use ($total, $field) {
                    return [
                        'classification' => $r->{$field} ?? 'Unspecified',
                        'total' => (int)$r->total,
                        'percentage' => round(($r->total / $total) * 100, 2)
                    ];
                });

            $classificationStats[$field] = $rows;
        }

        /** ----------------------------
         * PAYMENT STATS
         * --------------------------- */
        $paymentStats = (clone $baseQuery)
            ->select('payment_type', DB::raw('COUNT(*) as total'))
            ->groupBy('payment_type')
            ->get()
            ->map(function($r) use ($total) {
                return [
                    'payment_type' => $r->payment_type ?? 'Unspecified',
                    'total' => (int)$r->total,
                    'percentage' => round(($r->total / $total) * 100, 2)
                ];
            })->values();

        /** ----------------------------
         * ROWS (PAGINATED)
         * --------------------------- */
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

        $rows = (clone $baseQuery)
            ->select($selectFields)
            ->orderBy('nameFamily')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        /** ----------------------------
         * RESPONSE
         * --------------------------- */
        return response()->json([
            'course' => $course,
            'total' => $total,
            'page' => $page,
            'per_page' => $perPage,
            'averages' => $averages,
            'classification_stats' => $classificationStats,
            'payment_stats' => $paymentStats,
            'rows' => $rows
        ]);
    }
}
