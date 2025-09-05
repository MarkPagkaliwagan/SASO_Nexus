<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateQuestionsTable extends Migration
{
    public function up()
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->nullable()->constrained('exams')->onDelete('cascade');
            $table->foreignId('section_id')->nullable()->constrained('sections')->onDelete('cascade');
            $table->string('type')->default('text'); // text|figure
            $table->text('content')->nullable();
            $table->text('content_preview')->nullable(); // store image URL or data URI
            $table->integer('points')->default(1);
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('questions');
    }
}
