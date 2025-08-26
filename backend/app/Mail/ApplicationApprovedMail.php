<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Application;
use App\Models\Schedule;

class ApplicationApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public Application $application;
    public ?Schedule $schedule;

    public function __construct(Application $application, ?Schedule $schedule = null)
    {
        $this->application = $application;
        $this->schedule = $schedule;
    }

    public function build()
    {
        $subject = 'Application Approved — Entrance Exam Schedule (San Pablo Colleges)';
        return $this->subject($subject)
                    ->markdown('emails.application_approved')
                    ->with([
                      'application' => $this->application,
                      'schedule' => $this->schedule,
                    ]);
    }
}
