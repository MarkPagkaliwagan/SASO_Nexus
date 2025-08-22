<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    protected $fillable = ['date','time','limit','booked'];

    protected $casts = [
        'date' => 'date',
        'time' => 'string',
        'limit' => 'integer',
        'booked' => 'integer',
    ];
}
