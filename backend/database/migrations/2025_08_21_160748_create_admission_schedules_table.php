<?php
// database/migrations/xxxx_xx_xx_create_admission_schedules_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('admission_schedules', function (Blueprint $table) {
            $table->id();
            $table->dateTime('date_time'); // store date and time
            $table->integer('limit');      // integer limit for admission
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admission_schedules');
    }
};
