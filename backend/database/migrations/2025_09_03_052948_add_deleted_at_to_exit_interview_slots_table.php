<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddDeletedAtToExitInterviewSlotsTable extends Migration
{
    public function up()
    {
        Schema::table('exit_interview_slots', function (Blueprint $table) {
            $table->softDeletes(); // adds deleted_at nullable timestamp
        });
    }

    public function down()
    {
        Schema::table('exit_interview_slots', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
}
