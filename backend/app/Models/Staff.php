<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use App\Notifications\StaffResetPasswordNotification; // Add this import

class Staff extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $table = 'staffs';

    protected $fillable = [
        'name', 'email', 'password', 'position',
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected $visible = [
        'id', 'name', 'email',
    ];

    // Override the method to send password reset notification
    public function sendPasswordResetNotification($token)
    {
        $this->notify(new StaffResetPasswordNotification($token));
    }
}
