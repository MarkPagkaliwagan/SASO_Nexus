<?php

// database/migrations/xxxx_xx_xx_create_exit_interview_slots_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('exit_interview_slots', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->time('time');
            $table->integer('limit');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('exit_interview_slots');
    }
};

