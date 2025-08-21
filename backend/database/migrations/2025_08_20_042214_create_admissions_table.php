<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAdmissionsTable extends Migration
{
    public function up()
    {
        Schema::create('admissions', function (Blueprint $table) {
            $table->id();
            $table->string('application_type')->nullable();
            $table->string('semester')->nullable();
            $table->string('academic_year')->nullable();
            $table->string('course_choice1')->nullable();
            $table->string('course_choice2')->nullable();
            $table->string('strand')->nullable();
            $table->string('grade_level')->nullable();

            // personal
            $table->string('name');
            $table->string('address');
            $table->string('residence')->nullable();
            $table->string('tel_no')->nullable();
            $table->string('mobile_no');
            $table->string('email');
            $table->date('birth_date');
            $table->string('birth_place');
            $table->integer('age');
            $table->string('religion');
            $table->string('civil_status');
            $table->string('citizenship');

            // father
            $table->string('father_name');
            $table->string('father_address');
            $table->string('father_contact');
            $table->string('father_citizenship');
            $table->string('father_occupation');
            $table->string('father_office_address');
            $table->string('father_office_tel');
            $table->string('father_education');
            $table->string('father_last_school');

            // mother
            $table->string('mother_name');
            $table->string('mother_address');
            $table->string('mother_contact');
            $table->string('mother_citizenship');
            $table->string('mother_occupation');
            $table->string('mother_office_address');
            $table->string('mother_office_tel');
            $table->string('mother_education');
            $table->string('mother_last_school');

            // educational
            $table->string('lrn_no');
            $table->string('last_school');
            $table->string('last_school_address');
            $table->string('shs_strand')->nullable();
            $table->string('school_year_attended');
            $table->date('graduation_date');

            // alumni
            $table->string('alumni_parent');
            $table->string('alumni_year');
            $table->string('alumni_course');

            // transferee
            $table->string('transferee_school')->nullable();
            $table->string('transferee_course')->nullable();
            $table->string('transferee_major')->nullable();
            $table->string('transferee_school_address')->nullable();
            $table->string('transferee_school_year')->nullable();

            // achievements
            $table->text('honors_awards')->nullable();
            $table->text('organizations')->nullable();

            $table->boolean('consent')->default(false);

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('admissions');
    }
}
