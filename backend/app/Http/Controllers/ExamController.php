<?php

namespace App\Http\Controllers;

use App\Models\{Exam, Section, Question, Answer, Submission, SubmissionAnswer};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ExamController extends Controller
{
    /**
     * Normalize payload keys coming from frontend:
     * - contentPreview -> content_preview
     * - isCorrect -> is_correct
     * - sectionsEnabled -> sections_enabled
     * Works recursively for arrays of sections/questions/answers.
     */
    private function normalizePayloadKeys(array $data): array
    {
        $map = [
            'contentPreview' => 'content_preview',
            'isCorrect' => 'is_correct',
            'sectionsEnabled' => 'sections_enabled',
            // also allow answer/content camelCase -> snake_case
            'contentPreview' => 'content_preview',
        ];

        $normalizeKey = function ($key) use ($map) {
            return $map[$key] ?? $key;
        };

        $normalize = function ($value) use (&$normalize, $normalizeKey) {
            if (is_array($value)) {
                $new = [];
                foreach ($value as $k => $v) {
                    // if numeric key (list), keep index
                    if (is_int($k)) {
                        $new[$k] = $normalize($v);
                    } else {
                        $nk = $normalizeKey($k);
                        $new[$nk] = $normalize($v);
                    }
                }
                return $new;
            }
            return $value;
        };

        return $normalize($data);
    }

    /**
     * Flatten questions (from sections or top-level) into a Collection
     */
    private function flattenQuestions(Exam $exam)
    {
        $collection = collect([]);
        if ($exam->sections_enabled) {
            foreach ($exam->sections as $sec) {
                foreach ($sec->questions as $q) $collection->push($q);
            }
        } else {
            foreach ($exam->questions as $q) $collection->push($q);
        }
        return $collection;
    }

    /**
     * Safely convert content values to sanitized strings or JSON strings
     */
    private function safeContent($value)
    {
        if (is_null($value)) return null;

        if (is_array($value) || is_object($value)) {
            return json_encode($value, JSON_UNESCAPED_UNICODE);
        }

        $clean = trim((string) $value);
        // remove surrounding quotes if present
        if ((str_starts_with($clean, '"') && str_ends_with($clean, '"')) ||
            (str_starts_with($clean, "'") && str_ends_with($clean, "'"))) {
            $clean = substr($clean, 1, -1);
        }

        return $clean;
    }

    /**
     * GET /api/exams
     */
    public function index()
    {
$exams = Exam::with([
    'sections' => function ($q) { $q->orderBy('id'); },
    'sections.questions' => function ($q) { $q->orderBy('id'); },
    'sections.questions.answers' => function ($q) { $q->orderBy('id'); },
    'questions' => function ($q) { $q->orderBy('id'); },
    'questions.answers' => function ($q) { $q->orderBy('id'); },
])->get();


        return response()->json($exams);
    }

    /**
     * GET /api/exams/{id}
     * Returns exam with processed final_content and final_type for questions & answers
     */
    public function show($id)
    {
    $exam = Exam::with([
        'sections' => fn($q) => $q->orderBy('id'),
        'sections.questions' => fn($q) => $q->orderBy('id'),
        'sections.questions.answers' => fn($q) => $q->orderBy('id'),
        'questions' => fn($q) => $q->orderBy('id'),
        'questions.answers' => fn($q) => $q->orderBy('id'),
    ])->findOrFail($id);

        $processQuestion = function ($q) {
            // choose preview first, then content
            $raw = $q->content_preview ?: $q->content;
            $q->final_content = $this->safeContent($raw);

            // normalize question type names, frontend can use 'figure' or 'image'
            $qType = strtolower($q->type ?? 'text');
            $q->final_type = in_array($qType, ['figure', 'image']) ? 'image' : 'text';

            // answers
            $q->answers->each(function ($a) {
                $rawA = $a->content_preview ?: $a->content;
                $a->final_content = $this->safeContent($rawA);

                $aType = strtolower($a->type ?? 'text');
                $a->final_type = in_array($aType, ['figure', 'image']) ? 'image' : 'text';

                // if image type and final_content is not an absolute URL or data:image,
                // assume it's a storage path and convert to asset URL
                if ($a->final_type === 'image' && $a->final_content) {
                    if (!str_starts_with($a->final_content, 'http') && !str_starts_with($a->final_content, 'data:image')) {
                        $a->final_content = asset('storage/' . ltrim($a->final_content, '/'));
                    }
                }
            });

            // for question image
            if ($q->final_type === 'image' && $q->final_content) {
                if (!str_starts_with($q->final_content, 'http') && !str_starts_with($q->final_content, 'data:image')) {
                    $q->final_content = asset('storage/' . ltrim($q->final_content, '/'));
                }
            }
        };

        // process section questions
        $exam->sections->each(function ($section) use ($processQuestion) {
            $section->questions->each(function ($q) use ($processQuestion) {
                $processQuestion($q);
            });
        });

        // process top-level questions
        $exam->questions->each(function ($q) use ($processQuestion) {
            $processQuestion($q);
        });

        return response()->json($exam);
    }

    /**
     * POST /api/exams
     * Accepts both camelCase and snake_case keys due to normalization.
     */
    public function store(Request $request)
    {
        // normalize incoming keys to snake_case for the keys we expect
        $payload = $this->normalizePayloadKeys($request->all());

        // validation rules — minimal but enforce at least 1 answer per question
        $rules = [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'sections_enabled' => 'nullable|boolean',
            'sections' => 'nullable|array',
            'sections.*.title' => 'required_with:sections|string|max:255',
            'sections.*.questions' => 'nullable|array',
            'sections.*.questions.*.type' => 'required_with:sections.*.questions|string',
            'sections.*.questions.*.content' => 'nullable',
            'sections.*.questions.*.content_preview' => 'nullable',
            'sections.*.questions.*.points' => 'nullable|integer',
            'sections.*.questions.*.answers' => 'required_with:sections.*.questions|array|min:1',
            'sections.*.questions.*.answers.*.type' => 'required|string',
            'sections.*.questions.*.answers.*.content' => 'nullable',
            'sections.*.questions.*.answers.*.content_preview' => 'nullable',
            'questions' => 'nullable|array',
            'questions.*.type' => 'required_with:questions|string',
            'questions.*.content' => 'nullable',
            'questions.*.content_preview' => 'nullable',
            'questions.*.points' => 'nullable|integer',
            'questions.*.answers' => 'required_with:questions|array|min:1',
            'questions.*.answers.*.type' => 'required|string',
            'questions.*.answers.*.content' => 'nullable',
            'questions.*.answers.*.content_preview' => 'nullable',
        ];

        $validator = Validator::make($payload, $rules);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::transaction(function () use ($payload) {
                $exam = Exam::create([
                    'title' => $payload['title'],
                    'description' => $payload['description'] ?? null,
                    'sections_enabled' => (bool)($payload['sections_enabled'] ?? false),
                ]);

                // sections + questions + answers (preserve order)
                foreach ($payload['sections'] ?? [] as $sIndex => $sectionData) {
                    $section = $exam->sections()->create([
                        'title' => $sectionData['title'] ?? 'Untitled Section',
                        'order' => $sIndex,
                    ]);

                    foreach ($sectionData['questions'] ?? [] as $qIndex => $qData) {
                        $question = $section->questions()->create([
                            'exam_id' => $exam->id,
                            'type' => $qData['type'] ?? 'text',
                            'content' => $qData['content'] ?? null,
                            'content_preview' => $qData['content_preview'] ?? null,
                            'points' => $qData['points'] ?? 1,
                            'order' => $qIndex,
                        ]);

                        foreach ($qData['answers'] ?? [] as $aIndex => $aData) {
                            $question->answers()->create([
                                'type' => $aData['type'] ?? 'text',
                                'content' => $aData['content'] ?? null,
                                'content_preview' => $aData['content_preview'] ?? null,
                                'is_correct' => !empty($aData['is_correct']),
                                'order' => $aIndex,
                            ]);
                        }
                    }
                }

                // direct top-level questions (when sections not used)
                foreach ($payload['questions'] ?? [] as $qIndex => $qData) {
                    $question = $exam->questions()->create([
                        'type' => $qData['type'] ?? 'text',
                        'content' => $qData['content'] ?? null,
                        'content_preview' => $qData['content_preview'] ?? null,
                        'points' => $qData['points'] ?? 1,
                        'order' => $qIndex,
                    ]);

                    foreach ($qData['answers'] ?? [] as $aIndex => $aData) {
                        $question->answers()->create([
                            'type' => $aData['type'] ?? 'text',
                            'content' => $aData['content'] ?? null,
                            'content_preview' => $aData['content_preview'] ?? null,
                            'is_correct' => !empty($aData['is_correct']),
                            'order' => $aIndex,
                        ]);
                    }
                }
            });

            return response()->json(['message' => 'Exam created successfully!'], 201);
        } catch (\Throwable $e) {
            Log::error('Exam store failed: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Failed to create exam'], 500);
        }
    }

    /**
     * PATCH /api/exams/{id}/toggle-status
     */
    public function toggleStatus($id)
    {
        $exam = Exam::findOrFail($id);
        $exam->status = $exam->status === 'open' ? 'close' : 'open';
        $exam->save();

        return response()->json(['message' => 'Status updated!', 'status' => $exam->status]);
    }

    /**
     * PUT/PATCH /api/exams/{id}
     */
    public function update(Request $request, $id)
    {
        $exam = Exam::findOrFail($id);
        $payload = $this->normalizePayloadKeys($request->all());

        $fields = [];
        if (array_key_exists('title', $payload)) $fields['title'] = $payload['title'];
        if (array_key_exists('description', $payload)) $fields['description'] = $payload['description'];
        if (array_key_exists('sections_enabled', $payload)) $fields['sections_enabled'] = (bool)$payload['sections_enabled'];

        if (!empty($fields)) $exam->update($fields);

        return response()->json(['message' => 'Exam updated!', 'exam' => $exam]);
    }

    /**
     * DELETE /api/exams/{id}
     */
    public function destroy($id)
    {
        $exam = Exam::findOrFail($id);
        $exam->delete();
        return response()->json(['message' => 'Exam deleted']);
    }

    /**
     * POST /api/exams/{id}/submit
     * Payload: { details: {...}, answers: { [questionId]: answerId } }
     */
    public function submit(Request $request, $id)
    {
        $exam = Exam::with(['sections.questions.answers', 'questions.answers'])->findOrFail($id);

        $payload = $request->validate([
            'details' => 'nullable|array',
            'answers' => 'nullable|array',
        ]);

        $answersMap = $payload['answers'] ?? [];

        DB::beginTransaction();
        try {
            $questions = $this->flattenQuestions($exam);
            $totalMax = $questions->sum(fn($q) => intval($q->points ?? 0));
            $score = 0;
            $breakdown = [];

            $submission = Submission::create([
                'exam_id' => $exam->id,
                'details' => $payload['details'] ?? null,
                'score' => 0,
                'max_score' => $totalMax,
            ]);

            foreach ($questions as $q) {
                $selectedAnswerId = array_key_exists($q->id, $answersMap) ? $answersMap[$q->id] : null;
                $isCorrect = false;
                $pointsAwarded = 0;

                if ($selectedAnswerId) {
                    // find the selected answer among q->answers
                    $selected = $q->answers->firstWhere('id', $selectedAnswerId);
                    if ($selected && $selected->is_correct) {
                        $isCorrect = true;
                        $pointsAwarded = intval($q->points ?? 0);
                        $score += $pointsAwarded;
                    }
                }

                $breakdown[] = [
                    'question_id' => $q->id,
                    'answer_id' => $selectedAnswerId,
                    'is_correct' => $isCorrect,
                    'points_awarded' => $pointsAwarded,
                ];

                SubmissionAnswer::create([
                    'submission_id' => $submission->id,
                    'question_id' => $q->id,
                    'answer_id' => $selectedAnswerId,
                    'is_correct' => $isCorrect,
                    'points_awarded' => $pointsAwarded,
                ]);
            }

            $submission->update(['score' => $score, 'max_score' => $totalMax]);
            DB::commit();

            return response()->json([
                'score' => $score,
                'max_score' => $totalMax,
                'breakdown' => $breakdown,
                'submission_id' => $submission->id,
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Submit failed: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Submit failed'], 500);
        }
    }
}
