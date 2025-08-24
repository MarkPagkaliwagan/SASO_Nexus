<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    protected $fillable = ['date','time','limit']; // tanggal na booked

    protected $casts = [
        'date' => 'date',
        'time' => 'string',
        'limit' => 'integer',
    ];

    // Relation sa applications
    public function applications()
    {
        return $this->hasMany(Application::class);
    }
}
