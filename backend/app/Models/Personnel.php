<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Personnel extends Model
{
    use HasFactory;

    protected $fillable = [
        'fullName',
        'email',
        'contact',
        'position',
        'unit',
        'profile'
    ];

    // Automatic full URL for profile
    public function getProfileAttribute($value)
    {
        if (!$value) {
            return null;
        }
        return asset('storage/' . $value);
    }
}
