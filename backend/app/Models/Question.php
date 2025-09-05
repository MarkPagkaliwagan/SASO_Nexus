<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    protected $fillable = ['exam_id', 'section_id', 'type', 'content', 'content_preview', 'points', 'order'];

    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    public function answers()
    {
        return $this->hasMany(Answer::class);
    }
}
