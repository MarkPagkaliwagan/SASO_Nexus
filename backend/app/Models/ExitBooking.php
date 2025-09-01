<?php

// app/Models/ExitBooking.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExitBooking extends Model {
    protected $fillable = [
        'slot_id','last_name','middle_name','first_name',
        'department','resume_link','resume_file','status'
    ];

    public function slot() {
        return $this->belongsTo(ExitInterviewSlot::class, 'slot_id');
    }
}
