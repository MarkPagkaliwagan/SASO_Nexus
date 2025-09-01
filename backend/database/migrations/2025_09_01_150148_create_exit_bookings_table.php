<?php
// database/migrations/xxxx_xx_xx_create_exit_bookings_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('exit_bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('slot_id')->constrained('exit_interview_slots')->onDelete('cascade');
            $table->string('last_name');
            $table->string('middle_name')->nullable();
            $table->string('first_name');
            $table->string('department');
            $table->string('resume_link')->nullable();
            $table->string('resume_file')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('exit_bookings');
    }
};