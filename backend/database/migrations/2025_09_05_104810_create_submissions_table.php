<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSubmissionsTable extends Migration
{
    public function up()
    {
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained('exams')->onDelete('cascade');
            $table->json('details')->nullable(); // examinee details
            $table->integer('score')->default(0);
            $table->integer('max_score')->default(0);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('submissions');
    }
}
