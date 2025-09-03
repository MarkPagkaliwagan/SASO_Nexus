<?php

// app/Models/ExitInterviewSlot.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExitInterviewSlot extends Model {
    protected $fillable = ['date','time','limit','department'];

    public function bookings() {
        return $this->hasMany(ExitBooking::class, 'slot_id');
    }
}
