<?php

// app/Models/AdmissionSchedule.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdmissionSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'date_time',
        'limit',
    ];
}
