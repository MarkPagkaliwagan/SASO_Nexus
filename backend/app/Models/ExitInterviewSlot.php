<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ExitInterviewSlot extends Model {
    use SoftDeletes;

    protected $fillable = ['date','time','limit','department'];
    protected $dates = ['deleted_at'];

    public function bookings() {
        return $this->hasMany(ExitBooking::class, 'slot_id');
    }
}
