<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Admission extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_type','semester','academic_year','course_choice1','course_choice2','strand','grade_level',
        'name','address','tel_no','mobile_no','email','birth_date','birth_place','age','religion','civil_status','citizenship','residence',
        'father_name','father_address','father_contact','father_citizenship','father_occupation','father_office_address','father_office_tel','father_education','father_last_school',
        'mother_name','mother_address','mother_contact','mother_citizenship','mother_occupation','mother_office_address','mother_office_tel','mother_education','mother_last_school',
        'alumni_parent','alumni_year','alumni_course',
        'lrn_no','last_school','last_school_address','shs_strand','school_year_attended','graduation_date',
        'transferee_school','transferee_course','transferee_major','transferee_school_address','transferee_school_year',
        'honors_awards','organizations','consent'
    ];

    protected $casts = [
        'consent' => 'boolean',
        'birth_date' => 'date',
        'graduation_date' => 'date',
        'age' => 'integer',
    ];
}
