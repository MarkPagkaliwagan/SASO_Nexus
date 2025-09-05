<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Section extends Model
{
    protected $fillable = ['exam_id', 'title', 'order'];

    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    public function questions()
    {
        return $this->hasMany(Question::class)->orderBy('order');
    }
}
