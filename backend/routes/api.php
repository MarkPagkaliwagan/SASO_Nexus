<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Auth\ForgotPasswordController as AdminForgotPasswordController;
use App\Http\Controllers\Auth\ResetPasswordController as AdminResetPasswordController;
use App\Http\Controllers\StaffAuth\ForgotPasswordController as StaffForgotPasswordController;
use App\Http\Controllers\StaffAuth\ResetPasswordController as StaffResetPasswordController;
use App\Http\Controllers\StaffAuthController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\PersonnelController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\ApplicationController;
// routes/api.php
use App\Http\Controllers\ExitInterviewSlotController;
use App\Http\Controllers\ExitBookingController;
use App\Http\Controllers\ExamController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\SubmissionController;

Route::get('/submissions', [SubmissionController::class, 'index']);


Route::get('/exams', [ExamController::class, 'index']);
Route::post('/exams', [ExamController::class, 'store']);
Route::get('/exams/{id}', [ExamController::class, 'show']);
Route::patch('/exams/{id}/toggle-status', [ExamController::class, 'toggleStatus']);
Route::delete('/exams/{id}', [ExamController::class, 'destroy']);
Route::patch('/exams/{id}', [ExamController::class, 'update']);
Route::post('/exams/{id}/submit', [ExamController::class, 'submit']);

Route::post('/upload', [UploadController::class, 'store']);

Route::get('/slots', [ExitInterviewSlotController::class, 'index']);
Route::post('/slots', [ExitInterviewSlotController::class, 'store']);
Route::delete('/slots/{id}', [ExitInterviewSlotController::class, 'destroy']);

Route::post('/bookings', [ExitBookingController::class, 'store']);
Route::patch('/bookings/{id}/status', [ExitBookingController::class, 'updateStatus']);


// -------------------- Schedules --------------------
Route::apiResource('schedules', ScheduleController::class)
    ->only(['index', 'store', 'destroy']);
Route::post('/applications/{id}/toggle-payment', [ApplicationController::class, 'togglePayment']);

// Optional: manual reserve endpoint (pwede mo iwan or tanggalin)
Route::post('/schedules/{id}/reserve', [ScheduleController::class, 'reserve']);
    

// -------------------- Applications --------------------
Route::apiResource('applications', ApplicationController::class)
    ->only(['index', 'store', 'destroy', 'show']);
Route::post('/applications/{id}/approve', [ApplicationController::class, 'approve']);


// -------------------- Events --------------------
Route::post('/events', [EventController::class, 'store']);
Route::get('/events', [EventController::class, 'index']);


// -------------------- Announcements --------------------
Route::get('/announcements', [AnnouncementController::class, 'index']);
Route::post('/announcements', [AnnouncementController::class, 'store']);
Route::put('/announcements/{id}', [AnnouncementController::class, 'update']);
Route::delete('/announcements/{id}', [AnnouncementController::class, 'destroy']);
Route::post('/announcements/{id}/react', [AnnouncementController::class, 'react']);


// -------------------- Admin Auth Routes --------------------
Route::prefix('admin')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AdminForgotPasswordController::class, 'sendResetLinkEmail']);
    Route::post('/reset-password', [AdminResetPasswordController::class, 'reset']);
});


// -------------------- Personnel Routes --------------------
Route::prefix('personnel')->group(function () {
    Route::post('/', [PersonnelController::class, 'store']);              // Create
    Route::get('/', [PersonnelController::class, 'index']);              // Get all
    Route::get('/unit/{unit}', [PersonnelController::class, 'getByUnit']); // Get by unit
    Route::get('/{id}', [PersonnelController::class, 'show']);           // Get single
    Route::put('/{id}', [PersonnelController::class, 'update']);         // Update
    Route::delete('/{id}', [PersonnelController::class, 'destroy']);     // Delete
});


// -------------------- Staff Auth Routes --------------------
Route::prefix('staff')->group(function () {
    Route::post('/login', [StaffAuthController::class, 'login']);
    Route::post('/forgot-password', [StaffForgotPasswordController::class, 'sendResetLinkEmail']);
    Route::post('/reset-password', [StaffResetPasswordController::class, 'reset']);

    // Protected Staff Routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/', [StaffController::class, 'index']);          // Get all staff
        Route::get('/{id}', [StaffController::class, 'show']);       // Get single staff
        Route::post('/', [StaffController::class, 'store']);         // Create staff
        Route::put('/{id}', [StaffController::class, 'update']);     // Update staff
        Route::delete('/{id}', [StaffController::class, 'destroy']); // Delete staff
    });
});
