<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class StaffResetPasswordNotification extends Notification
{
    public $token;

    public function __construct($token)
    {
        $this->token = $token;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $frontendUrl = config('app.frontend_url') ?: 'http://localhost:5173';

        $url = $frontendUrl . '/reset-password?token=' . $this->token . '&email=' . urlencode($notifiable->getEmailForPasswordReset());

        return (new MailMessage)
            ->subject('Staff Password Reset Request')
            ->greeting('Hello!')
            ->line('You are receiving this email because we received a password reset request for your staff account.')
            ->action('Reset Password', $url)
            ->line('If you did not request a password reset, no further action is required.')
            ->salutation('Regards, Laravel')
            ->line('')
            ->line("If you're having trouble clicking the \"Reset Password\" button, copy and paste the URL below into your web browser:")
            ->line($url);
    }
}