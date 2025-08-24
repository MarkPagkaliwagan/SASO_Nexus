<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->id();

            // Application
            $table->string('applicationType')->nullable();

            // Personal Data
            $table->string('nameFamily')->nullable();
            $table->string('nameGiven')->nullable();
            $table->string('nameMiddle')->nullable();
            $table->string('gender')->nullable();
            $table->string('address')->nullable();
            $table->string('street')->nullable();
            $table->string('barangay')->nullable();
            $table->string('city')->nullable();
            $table->string('zip')->nullable();
            $table->string('tel')->nullable();
            $table->string('mobile')->nullable();
            $table->string('email')->nullable();
            $table->date('dob')->nullable();
            $table->string('placeOfBirth')->nullable();
            $table->integer('age')->nullable();
            $table->string('religion')->nullable();
            $table->string('civilStatus')->nullable();
            $table->string('citizenship')->nullable();
            $table->string('residence')->nullable();

            // Transferee
            $table->string('transferee_school_name')->nullable();
            $table->string('transferee_course')->nullable();
            $table->string('transferee_major')->nullable();
            $table->string('transferee_school_address')->nullable();
            $table->string('transferee_school_year_attended')->nullable();

            // College / SHS / GS
            $table->string('academicYear')->nullable();
            $table->string('semester')->nullable();
            $table->string('firstChoice')->nullable();
            $table->string('secondChoice')->nullable();
            $table->string('shsGradeLevel')->nullable();
            $table->string('shsStrand')->nullable();
            $table->string('gradeLevel')->nullable();

            // Family
            $table->string('father_name')->nullable();
            $table->string('father_address')->nullable();
            $table->string('father_tel')->nullable();
            $table->string('father_citizenship')->nullable();
            $table->string('father_occupation')->nullable();
            $table->string('father_office_address')->nullable();
            $table->string('father_office_tel')->nullable();
            $table->string('father_education')->nullable();
            $table->string('father_last_school')->nullable();

            $table->string('mother_name')->nullable();
            $table->string('mother_address')->nullable();
            $table->string('mother_tel')->nullable();
            $table->string('mother_citizenship')->nullable();
            $table->string('mother_occupation')->nullable();
            $table->string('mother_office_address')->nullable();
            $table->string('mother_office_tel')->nullable();
            $table->string('mother_education')->nullable();
            $table->string('mother_last_school')->nullable();

            $table->string('is_parent_alumnus')->nullable();
            $table->string('parent_alumni_year')->nullable();
            $table->string('parent_alumni_level_course')->nullable();

            // Education
            $table->string('lrn')->nullable();
            $table->string('last_school_name')->nullable();
            $table->string('last_school_address')->nullable();
            $table->string('track')->nullable();
            $table->string('strand')->nullable();
            $table->string('school_year_attended')->nullable();
            $table->string('date_of_graduation')->nullable();
            $table->string('honors')->nullable();
            $table->text('memberships')->nullable();

            // Schedule
            $table->foreignId('schedule_id')->nullable()->constrained();

            // Photo
            $table->string('photo_path')->nullable();

            $table->boolean('declaration')->default(false);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
