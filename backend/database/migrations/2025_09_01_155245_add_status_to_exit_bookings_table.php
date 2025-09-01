<?php

// database/migrations/xxxx_xx_xx_add_status_to_exit_bookings_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('exit_bookings', function (Blueprint $table) {
            $table->enum('status', ['pending','finished','no_show'])->default('pending');
        });
    }

    public function down(): void {
        Schema::table('exit_bookings', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};
