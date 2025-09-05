<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Submission extends Model
{
    protected $fillable = ['exam_id', 'details', 'score', 'max_score'];

    protected $casts = [
        'details' => 'array',
    ];

    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    public function answers()
    {
        return $this->hasMany(SubmissionAnswer::class);
    }
}
