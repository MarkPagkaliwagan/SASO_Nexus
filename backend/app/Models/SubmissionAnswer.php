<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubmissionAnswer extends Model
{
    protected $fillable = ['submission_id', 'question_id', 'answer_id', 'is_correct', 'points_awarded'];

    protected $casts = [
        'is_correct' => 'boolean',
    ];

    public function submission()
    {
        return $this->belongsTo(Submission::class);
    }
}
