@props(['application', 'schedule'])

<x-mail::message>
# Application Approved

Dear {{ $application->nameGiven }} {{ $application->nameFamily }},

Congratulations — your application to **San Pablo Colleges** has been **approved** by the Student Affairs and Service Office.

@if(!empty($schedule))
<x-mail::panel>
**Assigned Entrance Exam Schedule**  
**Date:** {{ \Carbon\Carbon::parse($schedule->date)->toFormattedDateString() }}  
**Time:** {{ \Carbon\Carbon::parse($schedule->time)->format('h:i A') }}  
**Venue:** Student Affairs and Service Office — Main Campus  
**Room:** {{ $schedule->room ?? 'To be announced' }}
</x-mail::panel>
@else
<x-mail::panel>
A schedule will be assigned to you and communicated shortly.
</x-mail::panel>
@endif

---

**Important — Payment Requirement**

Before taking the entrance exam, you are required to pay **₱200.00** at the **Main Cashier (San Pablo Colleges)**.  
Please make the payment **prior** to your exam and obtain the official receipt.

<x-mail::button url="#">
Bring your Official Receipt on Exam Day
</x-mail::button>

Admission to the exam will **not** be permitted without the receipt.

---

See you at the exam!  
We wish you the best in your upcoming exam. 🎓

**Need to reschedule or have questions?**  
Contact Student Affairs and Service Office as soon as possible.

**Office Hours:** Monday – Saturday, 8:00 AM – 5:00 PM  
**Email:** student.affairs@spc.edu.ph  
**Phone:** (049) 562-3456  

Sincerely,  
**Student Affairs and Service Office**  
San Pablo Colleges
</x-mail::message>
