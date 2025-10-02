<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
public function up(): void
{
    Schema::create('reports', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('staff_id'); // kung sino nag submit
        $table->string('department'); // Guidance, SFDU, Clinic, etc.
        $table->text('message')->nullable(); // optional message
        $table->string('file_path')->nullable(); // uploaded file
        $table->timestamps();

        $table->foreign('staff_id')->references('id')->on('staffs')->onDelete('cascade');
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
