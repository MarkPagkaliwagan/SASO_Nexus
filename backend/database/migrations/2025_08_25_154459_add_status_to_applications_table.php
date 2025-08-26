<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->string('status')->default('pending')->after('updated_at');
            $table->timestamp('approved_at')->nullable()->after('status');
            // schedule_id exists per your list. If not, add:
            // $table->unsignedBigInteger('schedule_id')->nullable()->after('approved_at');
        });
    }

    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->dropColumn(['status', 'approved_at']);
        });
    }
};
