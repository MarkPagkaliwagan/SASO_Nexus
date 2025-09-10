<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    protected $fillable = [
        "applicationType","nameFamily","nameGiven","nameMiddle","gender","address","barangay","city","zip","tel","mobile","email","dob","placeOfBirth","age","religion","civilStatus","citizenship","residence",
        "transferee_school_name","transferee_course","transferee_major","transferee_school_address","transferee_school_year_attended",
        "academicYear","semester","firstChoice","secondChoice","shsGradeLevel","shsStrand","gradeLevel",
        "father_name","father_address","father_tel","father_citizenship","father_occupation","father_office_address","father_office_tel","father_education","father_last_school",
        "mother_name","mother_address","mother_tel","mother_citizenship","mother_occupation","mother_office_address","mother_office_tel","mother_education","mother_last_school",
        "is_parent_alumnus","parent_alumni_year","parent_alumni_level_course",
        "lrn","last_school_name","last_school_address","track","strand","school_year_attended","date_of_graduation","honors","memberships",
        "schedule_id","photo_path","declaration",'status', 'approved_at','payment_type',
        'mat_rs','mat_iq','mat_percentile','mat_classification',
        'apt_verbal_rs','apt_verbal_percentile','apt_verbal_classification',
        'apt_num_rs','apt_num_percentile','apt_num_classification',
        'apt_total_rs','apt_total_percentile','apt_total_classification',
        'gwa_percentile','gwa_classification',

        'cfit_rs','cfit_iq','cfit_pc','cfit_classification',
        'olsat_verbal_rs','olsat_verbal_ss','olsat_verbal_percentile','olsat_verbal_stanine','olsat_verbal_classification',
        'olsat_nonverbal_rs','olsat_nonverbal_ss','olsat_nonverbal_pc','olsat_nonverbal_stanine','olsat_nonverbal_classification',
        'olsat_total_rs','olsat_total_ss','olsat_total_pc','olsat_total_stanine','olsat_total_classification',

        'vc_rs','vc_pc','vr_rs','vr_pc','fr_rs','fr_pc','qr_rs','qr_pc',
        'verbal_rs','verbal_pc','nonverbal_rs','nonverbal_pc','overall_rs','overall_pc',

    'remarks'
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
