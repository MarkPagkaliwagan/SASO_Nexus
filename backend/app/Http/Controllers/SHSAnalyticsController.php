<?php

namespace App\Http\Controllers;

use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SHSAnalyticsController extends Controller
{
    // Get all grade levels with totals
    public function getGradeLevels()
    {
        $totalAll = Application::count();

        $levels = Application::select('shsGradeLevel', DB::raw('COUNT(*) as total'))
            ->whereNotNull('shsGradeLevel')
            ->groupBy('shsGradeLevel')
            ->orderByDesc('total')
            ->get()
            ->map(function($row) use ($totalAll) {
                return [
                    'shsGradeLevel' => $row->shsGradeLevel,
                    'totalApplicants' => (int)$row->total,
                    'percent_of_all_applicants' => $totalAll > 0 ? round(($row->total / $totalAll) * 100, 2) : 0
                ];
            });

        return response()->json([
            'total_applicants' => $totalAll,
            'grade_levels' => $levels
        ]);
    }
public function getAcademicYears()
{
    $years = Application::select('academicYear')
        ->whereNotNull('academicYear')
        ->distinct()
        ->orderByDesc('academicYear')
        ->pluck('academicYear');

    return response()->json([
        'years' => $years
    ]);
}

 public function getLevelDetail($level, Request $request)
{
    $perPage = (int) $request->query('per_page', 50);
    $page = (int) $request->query('page', 1);
    $academicYear = $request->query('academicYear', null);

    // Base query for ALL matching rows (used for counts / aggregates)
    $baseQuery = Application::where('shsGradeLevel', $level);
    if ($academicYear) {
        $baseQuery->where('academicYear', $academicYear);
    }

    $total = $baseQuery->count();

    if ($total === 0) {
        return response()->json([
            'shsGradeLevel' => $level,
            'total' => 0,
            'page' => $page,
            'per_page' => $perPage,
            'rows' => [],
            'categoryStats' => [],
            'payment_stats' => [],
            'classification_stats' => [],
            'averages' => (object) []
        ]);
    }

    // --- Paginated rows for the table (what the UI shows) ---
    $selectFields = [
        'id',
        'nameFamily','nameGiven','nameMiddle','gender','address','academicYear','shsGradeLevel','shsStrand','last_school_name',
        'track','strand','status',
        'cfit_rs','cfit_iq','cfit_pc','cfit_classification',
        'olsat_verbal_rs','olsat_verbal_ss','olsat_verbal_percentile','olsat_verbal_stanine','olsat_verbal_classification',
        'olsat_nonverbal_rs','olsat_nonverbal_ss','olsat_nonverbal_pc','olsat_nonverbal_stanine','olsat_nonverbal_classification',
        'olsat_total_rs','olsat_total_ss','olsat_total_pc','olsat_total_stanine','olsat_total_classification',
        'remarks','payment_type'
    ];

    $rows = $baseQuery->select($selectFields)
        ->orderBy('nameFamily')
        ->skip(($page - 1) * $perPage)
        ->take($perPage)
        ->get();

    // --- Averages for key numeric fields across ALL matching rows ---
    $avgFields = [
        'cfit_iq' => 'cfit_iq_avg',
        'cfit_rs' => 'cfit_rs_avg',
        'olsat_total_ss' => 'olsat_total_ss_avg',
        'olsat_verbal_ss' => 'olsat_verbal_ss_avg'
    ];

    $averages = [];
    foreach ($avgFields as $col => $key) {
        $val = $baseQuery->avg($col);
        $averages[$key] = is_numeric($val) ? round($val, 2) : null;
    }

    // --- Payment stats (group by payment_type) across ALL matching rows ---
    $paymentGroups = $baseQuery->select('payment_type', DB::raw('COUNT(*) as total'))
        ->groupBy('payment_type')
        ->get()
        ->map(function ($r) use ($total) {
            $count = (int) $r->total;
            return [
                'payment_type' => $r->payment_type ?? 'Unspecified',
                'total' => $count,
                'percentage' => $total > 0 ? round(($count / $total) * 100, 2) : 0
            ];
        })->values();

    // --- Classification stats for olsat_total_classification (and you can add others) ---
    $classificationGroups = $baseQuery->select('olsat_total_classification', DB::raw('COUNT(*) as total'))
        ->groupBy('olsat_total_classification')
        ->get()
        ->map(function ($r) use ($total) {
            $name = $r->olsat_total_classification ?? 'Unspecified';
            $count = (int) $r->total;
            return [
                'classification' => $name,
                'total' => $count,
                'percentage' => $total > 0 ? round(($count / $total) * 100, 2) : 0
            ];
        })->values();

    // --- Category stats for chosen categorical fields (counts across ALL matching rows) ---
    $categoricalFields = [
        'gender', 'address', 'academicYear', 'shsGradeLevel', 'shsStrand',
        'last_school_name', 'track', 'strand', 'status'
    ];

    $categoryStats = [];
    foreach ($categoricalFields as $field) {
        $groups = $baseQuery->select($field, DB::raw('COUNT(*) as total'))
            ->groupBy($field)
            ->get();

        $map = [];
        foreach ($groups as $g) {
            $key = $g->$field ?? 'Unspecified';
            $map[$key] = (int) $g->total;
        }
        $categoryStats[$field] = $map;
    }

    // --- Return combined response ---
    return response()->json([
        'shsGradeLevel' => $level,
        'total' => $total,
        'page' => $page,
        'per_page' => $perPage,
        'rows' => $rows,
        'categoryStats' => $categoryStats,
        'payment_stats' => $paymentGroups,
        'classification_stats' => [
            'olsat_total_classification' => $classificationGroups
        ],
        'averages' => $averages
    ]);
}

}
