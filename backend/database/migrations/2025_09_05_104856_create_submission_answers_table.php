<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSubmissionAnswersTable extends Migration
{
    public function up()
    {
        Schema::create('submission_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('submission_id')->constrained('submissions')->onDelete('cascade');
            $table->foreignId('question_id')->constrained('questions')->onDelete('cascade');
            $table->foreignId('answer_id')->nullable()->constrained('answers')->onDelete('set null');
            $table->boolean('is_correct')->default(false);
            $table->integer('points_awarded')->default(0);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('submission_answers');
    }
}
