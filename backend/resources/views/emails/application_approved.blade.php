<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Application Approved</title>
</head>

<body style="font-family: Arial, sans-serif; background:#f7f7f7; padding: 30px;">

    <table width="100%" cellspacing="0" cellpadding="0">
        <tr>
            <td align="center">

                <!-- CARD WRAPPER -->
                <table width="650" cellpadding="0" cellspacing="0" style="background:white; border-radius:12px; padding:30px;">

                    <!-- HEADER -->
                    <tr>
                        <td align="center" style="padding:25px; background:#E8F7E8; border:2px solid #FFD944; border-radius:12px;">
                            <h1 style="color:#1B6B1B; font-size:32px; margin:0;">
                                ✔ Application Approved
                            </h1>
                            <p style="margin:5px 0 0 0; color:#444;">
                                San Pablo Colleges — Student Affairs and Service Office
                            </p>
                        </td>
                    </tr>

                    <!-- GREETING -->
                    <tr>
                        <td style="padding-top:25px; font-size:16px; color:#444;">
                            Dear <strong>{{ $application->nameGiven }} {{ $application->nameFamily }}</strong>,
                        </td>
                    </tr>

                    <tr>
                        <td style="padding-top:10px; font-size:16px; color:#444;">
                            Congratulations — your application to 
                            <strong style="color:#1B6B1B;">San Pablo Colleges</strong>
                            has been 
                            <strong style="color:#2E8B2E;">approved</strong>.
                        </td>
                    </tr>

                    <!-- SCHEDULE PANEL -->
                    @if($schedule)
                    <tr>
                        <td style="padding-top:25px;">
                            <div style="background:#F0F7FF; border-left:6px solid #FFD944; padding:18px 20px; border-radius:10px;">
                                <h3 style="margin:0 0 10px 0; color:#1B6B1B;">
                                    📅 Assigned Entrance Exam Schedule
                                </h3>

                                <p style="margin:6px 0;"><strong>Date:</strong> {{ \Carbon\Carbon::parse($schedule->date)->toFormattedDateString() }}</p>
                                <p style="margin:6px 0;"><strong>Time:</strong> {{ \Carbon\Carbon::parse($schedule->time)->format('h:i A') }}</p>
                                <p style="margin:6px 0;"><strong>Venue:</strong> Student Affairs and Service Office — Main Campus</p>
                                <p style="margin:6px 0;"><strong>Room:</strong> {{ $schedule->room ?? 'To be announced' }}</p>
                            </div>
                        </td>
                    </tr>
                    @else
                    <tr>
                        <td style="padding-top:25px;">
                            <div style="background:#FAFAFA; border-left:6px solid #FFD944; padding:18px 20px; border-radius:10px;">
                                A schedule will be assigned to you and communicated shortly.
                            </div>
                        </td>
                    </tr>
                    @endif

                    <!-- DIVIDER -->
                    <tr>
                        <td>
                            <hr style="border-top:2px solid #FFD944; margin:35px 0;">
                        </td>
                    </tr>

                    <!-- PAYMENT -->
                    <tr>
                        <td>
                            <h2 style="color:#1B6B1B; margin:0 0 10px 0;">⚠ Important — Payment Requirement</h2>
                            <p style="font-size:16px; color:#444;">
                                Before taking the entrance exam, you are required to pay 
                                <strong style="color:#1B6B1B;">₱200.00</strong>
                                at the <strong>Main Cashier (San Pablo Colleges)</strong>.
                            </p>
                            <p style="font-size:16px; color:#444;">
                                Please make the payment <strong>before your exam</strong> and obtain the official receipt.
                                Admission will <strong style="color:red;">not be permitted</strong> without it.
                            </p>
                        </td>
                    </tr>

                    <!-- BUTTON -->
                    <tr>
                        <td align="center" style="padding-top:10px;">
                            <a href="#" style="
                                background:#1B6B1B;
                                color:white;
                                padding:12px 22px;
                                border-radius:8px;
                                text-decoration:none;
                                font-weight:bold;
                                display:inline-block;">
                                Bring Your Official Receipt on Exam Day
                            </a>
                        </td>
                    </tr>

                    <!-- DIVIDER -->
                    <tr>
                        <td>
                            <hr style="border-top:2px solid #FFD944; margin:35px 0;">
                        </td>
                    </tr>

                    <!-- NOTES -->
                    <tr>
                        <td style="font-size:16px; color:#444;">
                            See you at the exam!  
                            We wish you the best in your upcoming assessment. 🎓
                        </td>
                    </tr>

                    <!-- CONTACT BOX -->
                    <tr>
                        <td style="padding-top:20px;">
                            <div style="background:#FFF8D6; padding:18px 22px; border-radius:10px;">
                                <p style="margin:6px 0;"><strong>Office Hours:</strong> Monday – Saturday, 8:00 AM – 5:00 PM</p>
                                <p style="margin:6px 0;"><strong>Email:</strong> student.affairs@spc.edu.ph</p>
                                <p style="margin:6px 0;"><strong>Phone:</strong> (049) 562-3456</p>
                            </div>
                        </td>
                    </tr>

                    <!-- SIGNATURE -->
                    <tr>
                        <td style="padding-top:30px; font-size:16px; color:#444;">
                            Sincerely,<br>
                            <strong>Student Affairs and Service Office</strong><br>
                            San Pablo Colleges
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>

</body>
</html>
