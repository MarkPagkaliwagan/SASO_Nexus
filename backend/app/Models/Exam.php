<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Exam extends Model
{
    protected $fillable = ['title', 'description', 'sections_enabled', 'status'];

    protected $casts = [
        'sections_enabled' => 'boolean',
    ];

    public function sections()
    {
        return $this->hasMany(Section::class)->orderBy('order');
    }

    public function questions()
    {
        return $this->hasMany(Question::class)->orderBy('order');
    }

    public function submissions()
    {
        return $this->hasMany(Submission::class);
    }
}
