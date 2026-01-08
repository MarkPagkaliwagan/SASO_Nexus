<?php

namespace App\Http\Controllers;

use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GradeSchoolAnalyticsController extends Controller
{
    /**
     * ✅ ALLOWED GS GRADE LEVELS ONLY
     */
    private array $allowedGradeLevels = [
        'Grade 5',
        'Grade 4',
        'Grade 3',
        'Grade 2',
        'Grade 1',
        'Kinder',
        'Nursery',
    ];

    /**
     * GET /api/gs-analytics
     * List of grade levels with totals
     */
    public function getGradeLevels()
    {
        $totalAll = Application::whereIn('gradeLevel', $this->allowedGradeLevels)->count();

        $levels = Application::select('gradeLevel', DB::raw('COUNT(*) as total'))
            ->whereIn('gradeLevel', $this->allowedGradeLevels)
            ->groupBy('gradeLevel')
            ->orderByRaw("
                FIELD(
                    gradeLevel,
                    'Grade 5','Grade 4','Grade 3','Grade 2','Grade 1','Kinder','Nursery'
                )
            ")
            ->get()
            ->map(function ($row) use ($totalAll) {
                return [
                    'gradeLevel' => $row->gradeLevel,
                    'totalApplicants' => (int) $row->total,
                    'percent_of_all_applicants' =>
                        $totalAll > 0
                            ? round(($row->total / $totalAll) * 100, 2)
                            : 0
                ];
            });

        return response()->json([
            'total_applicants' => $totalAll,
            'grade_levels' => $levels
        ]);
    }

    /**
     * GET /api/gs-academic-years
     */
    public function getAcademicYears()
    {
        $years = Application::select('academicYear')
            ->whereNotNull('academicYear')
            ->distinct()
            ->orderByDesc('academicYear')
            ->pluck('academicYear');

        return response()->json(['years' => $years]);
    }

    /**
     * GET /api/analytics/gs/{level}
     */
    public function getLevelDetail($level, Request $request)
    {
        // ❌ BLOCK INVALID GRADE LEVEL
        if (!in_array($level, $this->allowedGradeLevels)) {
            return response()->json([
                'message' => 'Invalid Grade Level'
            ], 404);
        }

        $perPage = (int) $request->query('per_page', 50);
        $page = (int) $request->query('page', 1);
        $academicYear = $request->query('academicYear');

        /** ---------------------------
         * BASE QUERY (DO NOT MUTATE)
         * --------------------------*/
        $baseQuery = Application::where('gradeLevel', $level);

        if ($academicYear) {
            $baseQuery->where('academicYear', $academicYear);
        }

        $total = (clone $baseQuery)->count();

        if ($total === 0) {
            return response()->json([
                'gradeLevel' => $level,
                'total' => 0,
                'page' => $page,
                'per_page' => $perPage,
                'rows' => [],
                'categoryStats' => (object) [],
                'payment_stats' => [],
                'averages' => (object) []
            ]);
        }

        /** ---------------------------
         * TABLE ROWS (PAGINATED)
         * --------------------------*/
        $selectFields = [
            'id',
            'nameFamily',
            'nameGiven',
            'nameMiddle',
            'gender',
            'address',
            'academicYear',
            'gradeLevel',
            'last_school_name',
            'vc_rs','vc_pc',
            'vr_rs','vr_pc',
            'fr_rs','fr_pc',
            'qr_rs','qr_pc',
            'verbal_rs','verbal_pc',
            'nonverbal_rs','nonverbal_pc',
            'overall_rs','overall_pc',
            'remarks',
            'payment_type'
        ];

        $rows = (clone $baseQuery)
            ->select($selectFields)
            ->orderBy('nameFamily')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        /** ---------------------------
         * AVERAGES (ALL MATCHING DATA)
         * --------------------------*/
        $avgFields = [
            'overall_rs' => 'overall_rs_avg',
            'overall_pc' => 'overall_pc_avg',
            'verbal_rs'  => 'verbal_rs_avg',
            'verbal_pc'  => 'verbal_pc_avg'
        ];

        $averages = [];
        foreach ($avgFields as $col => $key) {
            $val = (clone $baseQuery)->avg($col);
            $averages[$key] = is_numeric($val) ? round($val, 2) : null;
        }

        /** ---------------------------
         * PAYMENT STATS
         * --------------------------*/
        $paymentStats = (clone $baseQuery)
            ->select('payment_type', DB::raw('COUNT(*) as total'))
            ->groupBy('payment_type')
            ->get()
            ->map(function ($row) use ($total) {
                $count = (int) $row->total;
                return [
                    'payment_type' => $row->payment_type ?? 'Unspecified',
                    'total' => $count,
                    'percentage' =>
                        $total > 0 ? round(($count / $total) * 100, 2) : 0
                ];
            })
            ->values();

        /** ---------------------------
         * CATEGORY STATS (GS ONLY)
         * --------------------------*/
        $categoricalFields = [
            'gender',
            'address',
            'academicYear',
            'gradeLevel',
            'last_school_name',
            'remarks'
        ];

        $categoryStats = [];

        foreach ($categoricalFields as $field) {
            $groups = (clone $baseQuery)
                ->select($field, DB::raw('COUNT(*) as total'))
                ->groupBy($field)
                ->get();

            $map = [];
            foreach ($groups as $g) {
                $key = $g->$field ?? 'Unspecified';
                $map[$key] = (int) $g->total;
            }

            $categoryStats[$field] = $map;
        }

        /** ---------------------------
         * RESPONSE
         * --------------------------*/
        return response()->json([
            'gradeLevel' => $level,
            'total' => $total,
            'page' => $page,
            'per_page' => $perPage,
            'rows' => $rows,
            'categoryStats' => $categoryStats,
            'payment_stats' => $paymentStats,
            'averages' => $averages
        ]);
    }
}
