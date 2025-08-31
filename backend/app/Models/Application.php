<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    protected $fillable = [
        "applicationType","nameFamily","nameGiven","nameMiddle","gender","address","street","barangay","city","zip","tel","mobile","email","dob","placeOfBirth","age","religion","civilStatus","citizenship","residence",
        "transferee_school_name","transferee_course","transferee_major","transferee_school_address","transferee_school_year_attended",
        "academicYear","semester","firstChoice","secondChoice","shsGradeLevel","shsStrand","gradeLevel",
        "father_name","father_address","father_tel","father_citizenship","father_occupation","father_office_address","father_office_tel","father_education","father_last_school",
        "mother_name","mother_address","mother_tel","mother_citizenship","mother_occupation","mother_office_address","mother_office_tel","mother_education","mother_last_school",
        "is_parent_alumnus","parent_alumni_year","parent_alumni_level_course",
        "lrn","last_school_name","last_school_address","track","strand","school_year_attended","date_of_graduation","honors","memberships",
        "schedule_id","photo_path","declaration",'status', 'approved_at','payment_type',

    ];

    protected $casts = [
        'declaration' => 'boolean', // ✅ dito dapat ilagay
        'approved_at' => 'datetime'

    ];

    public function schedule()
{
    return $this->belongsTo(Schedule::class);
}

}
