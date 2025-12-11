import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FaCalendarAlt,
  FaFileUpload,
  FaUser,
  FaUniversity,
  FaSpinner,
  FaExclamationTriangle,
  FaClock,
  FaEdit,
} from "react-icons/fa";

// Enhanced ExitSubmission with: live-search for existing booking by name,
// "finished" check (shows message), "no_show" flow (auto-fill + reschedule + reason),
// update existing booking via PUT to /api/bookings/:id, and create via POST /api/bookings.

const INITIAL_FORM = {
  last_name: "",
  middle_name: "",
  first_name: "",
  department: "",
  course: "",
  slot_id: "",
  resume_link: "",
  resume_file: null,
};

const REASONS = [
  "Sick / Illness",
  "Family emergency",
  "Transport problem",
  "Exam / Class conflict",
  "Forgot schedule",
  "Weather (e.g., typhoon)",
  "Other",
];

export default function ExitSubmission() {
  const [confirmation, setConfirmation] = useState(null);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [date, setDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const [resumeType, setResumeType] = useState("file");

  // validation errors
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  // --- search / existing booking handling ---
  const [existingBooking, setExistingBooking] = useState(null);
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef(null);

  // no_show specific fields
  const [reason, setReason] = useState("");
  const [otherReasonText, setOtherReasonText] = useState("");

  // Friendly full-labels for UI
  const departmentLabels = {
    College: "College",
    SHS: "Senior High School",
    JHS: "Junior High School",
    GS: "Grade School",
  };

  const departmentColors = {
    College: "bg-blue-400 text-white",
    SHS: "bg-yellow-400 text-black",
    JHS: "bg-green-400 text-white",
    GS: "bg-red-400 text-white",
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const res = await axios.get("/api/slots");
      const normalized = (res.data || []).map((s) => ({
        ...s,
        bookings_count: s.bookings_count || (s.bookings ? s.bookings.length : 0),
      }));
      setSlots(normalized);
    } catch (err) {
      console.error("Error fetching slots", err);
    }
  };

  // ----------------- live-search ------------------
  // call search when last/mid/first names are populated (at least last & first)
  useEffect(() => {
    // clear previous timer
    if (searchTimer.current) clearTimeout(searchTimer.current);

    const ln = (form.last_name || "").trim();
    const mn = (form.middle_name || "").trim();
    const fn = (form.first_name || "").trim();

    // only search if we have last and first (middle optional)
    if (!ln || !fn) {
      setExistingBooking(null);
      return;
    }

    setSearching(true);
    searchTimer.current = setTimeout(() => {
      performSearch(ln, mn, fn);
    }, 400); // debounce

    return () => clearTimeout(searchTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.last_name, form.middle_name, form.first_name]);

  const performSearch = async (last_name, middle_name, first_name) => {
    try {
      const res = await axios.get("/api/bookings/search", {
        params: { last_name, middle_name, first_name },
      });

      if (res.data) {
        setExistingBooking(res.data);
        // autofill some fields using existing booking
        setForm((prev) => ({
          ...prev,
          department: res.data.department || prev.department,
          course: res.data.course || prev.course,
          resume_link: res.data.resume_link || prev.resume_link,
          // don't set resume_file (can't populate file inputs) — instead show link
        }));

        // set resume type for UI convenience
        if (res.data.resume_file) setResumeType("file-existing");
        else if (res.data.resume_link) setResumeType("url");
      } else {
        setExistingBooking(null);
      }
    } catch (err) {
      if (err.response && err.response.status === 404) setExistingBooking(null);
      else console.error("Search error", err);
    } finally {
      setSearching(false);
    }
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setDate(new Date());
    setResumeType("file");
    setErrors({});
    setApiError("");
    setExistingBooking(null);
    setReason("");
    setOtherReasonText("");
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const submitBooking = async () => {
    setApiError("");
    const newErrors = {};

    if (!form.first_name || !form.first_name.trim())
      newErrors.first_name = "First name is required.";

    if (!form.department) newErrors.department = "Please select your department.";

    if (form.department === "College" && !form.course)
      newErrors.course = "Please select your course (required for College).";

    if (!form.slot_id) newErrors.slot_id = "Please select a slot from the calendar.";

    if ((!form.resume_file || form.resume_file.size === 0) && !form.resume_link)
      newErrors.resume = "Please upload a PDF or provide a resume link.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      try {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (e) {}
      return;
    }

    setErrors({});

    const data = new FormData();
    for (let key in form) {
      if (key === "resume_file") {
        if (form.resume_file && form.resume_file.size > 0) data.append(key, form.resume_file);
        continue;
      }
      if (key === "resume_link" && form.resume_file && form.resume_file.size > 0) continue;
      data.append(key, form[key]);
    }

    try {
      setIsLoading(true);
      await axios.post("/api/bookings", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const bookedSlot = slots.find((s) => s.id === Number(form.slot_id));

      setConfirmation({
        last_name: form.last_name,
        middle_name: form.middle_name,
        first_name: form.first_name,
        department: form.department,
        course: form.course,
        slotDate: bookedSlot ? new Date(bookedSlot.date).toDateString() : "N/A",
        slotTime: bookedSlot?.time || "N/A",
        venue: "Guidance office, EALA Building, 2nd Floor",
      });

      await fetchSlots();
      resetForm();
      setConfirmChecked(false);
    } catch (err) {
      const message = err.response?.data?.error || "Error submitting booking";
      setApiError(message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- Update existing booking (no_show flow) ----------------
 const updateExistingBooking = async () => {
  if (!existingBooking) return;

  const newErrors = {};
  if (!form.slot_id) newErrors.slot_id = "Please select a new slot for rescheduling.";
  if (!reason) newErrors.reason = "Please choose a reason for no_show.";
  if (reason === "Other" && !otherReasonText.trim())
    newErrors.otherReason = "Please provide other reason text.";

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  const data = new FormData();
  data.append("_method", "PUT"); // method override inside FormData (reliable for multipart)
  data.append("slot_id", form.slot_id);
  data.append("department", form.department || existingBooking.department || "");
  data.append("course", form.course || existingBooking.course || "");
  data.append("status", "no_show");
  data.append("reason", reason === "Other" ? otherReasonText : reason);

  if (form.resume_file && form.resume_file.size > 0) {
    data.append("resume_file", form.resume_file);
  } else {
    // send resume_link if present (or existing)
    data.append("resume_link", form.resume_link || existingBooking.resume_link || "");
  }

  try {
    setIsLoading(true);
    // Post with multipart/form-data; Laravel will read _method from the body
    const res = await axios.post(`/api/bookings/${existingBooking.id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
      },
    });

    // success: populate confirmation from response
    setConfirmation({
      last_name: res.data.last_name,
      middle_name: res.data.middle_name,
      first_name: res.data.first_name,
      department: res.data.department,
      course: res.data.course,
      slotDate: new Date(res.data.slot.date).toDateString(),
      slotTime: res.data.slot.time,
      venue: "Guidance office, EALA Building, 2nd Floor",
    });

    await fetchSlots();
    resetForm();
    setExistingBooking(null);
  } catch (err) {
    console.error("Update booking error response:", err.response?.data ?? err.message);
    // If validation error (Laravel returns 422 + { errors: { field: [msg] } })
    if (err.response?.status === 422) {
      const resp = err.response.data || {};
      // map Laravel errors to your errors state (take first message for each field)
      const mapped = {};
      if (resp.errors) {
        Object.entries(resp.errors).forEach(([k, v]) => {
          mapped[k] = Array.isArray(v) ? v[0] : v;
        });
      }
      setErrors(mapped);
      setApiError(resp.message || "Validation failed. Please fix the fields.");
    } else {
      const message = err.response?.data?.error || err.message || "Error updating booking";
      setApiError(message);
    }
  } finally {
    setIsLoading(false);
  }
};

  // ---------------- GROUPED SLOT MAPS ----------------
  const slotsByDateAll = slots.reduce((acc, slot) => {
    const d = new Date(slot.date).toDateString();
    if (!acc[d]) acc[d] = [];
    acc[d].push(slot);
    return acc;
  }, {});

  const slotsByDateActive = slots.reduce((acc, slot) => {
    if (slot.deleted_at) return acc;
    const d = new Date(slot.date).toDateString();
    if (!acc[d]) acc[d] = [];
    acc[d].push(slot);
    return acc;
  }, {});

  const filteredSlots = (slotsByDateActive[date.toDateString()] || []).filter(
    (slot) => !form.department || slot.department === form.department
  );

  // ---------------- Custom Calendar UI ----------------
  function CustomCalendar({ selected, onChange }) {
    const [currentMonth, setCurrentMonth] = useState(
      new Date(selected.getFullYear(), selected.getMonth(), 1)
    );

    useEffect(() => {
      setCurrentMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
    }, [selected]);

    const startOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    );

    const startDayIndex = startOfMonth.getDay();
    const totalCells = startDayIndex + endOfMonth.getDate();
    const rows = Math.ceil(totalCells / 7);

    const days = [];
    for (let i = 0; i < rows * 7; i++) {
      const dayNumber = i - startDayIndex + 1;
      const inMonth = dayNumber >= 1 && dayNumber <= endOfMonth.getDate();
      const cellDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        inMonth ? dayNumber : 1
      );
      days.push({ inMonth, dayNumber, date: cellDate });
    }

    const prevMonth = () =>
      setCurrentMonth(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
      );
    const nextMonth = () =>
      setCurrentMonth(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
      );

    const isPastDate = (d) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return d < today;
    };

    const renderDayCell = (cell) => {
      if (!cell.inMonth) {
        return (
          <div className="p-2 text-xs text-slate-400 h-20 flex flex-col">
            <div className="text-right">&nbsp;</div>
          </div>
        );
      }

      const cellKey = cell.date.toDateString();
      const slotsForDayAll = slotsByDateAll[cellKey] || [];

      const departmentFilteredSlots = slotsForDayAll.filter(
        (s) => !form.department || s.department === form.department
      );

      const anyActive = departmentFilteredSlots.some((s) => !s.deleted_at);
      const anyActiveAvailable = departmentFilteredSlots.some(
        (s) => !s.deleted_at && s.limit - (s.bookings_count || 0) > 0
      );
      const anyArchived = departmentFilteredSlots.some((s) => !!s.deleted_at);

      let dayBadge = "";
      if (anyActiveAvailable) dayBadge = "Available";
      else if (anyActive) dayBadge = "Full";
      else if (anyArchived) dayBadge = "Archived";
      else dayBadge = "No slot";

      const badgeClass =
        dayBadge === "Available"
          ? "text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800"
          : dayBadge === "Full"
          ? "text-[10px] px-2 py-0.5 rounded-full bg-rose-200 text-rose-800"
          : dayBadge === "Archived"
          ? "text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700"
          : "text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700";

      const past = isPastDate(cell.date);

      return (
        <button
          onClick={() => {
            if (past) return; // disable selecting past dates
            onChange(
              new Date(
                cell.date.getFullYear(),
                cell.date.getMonth(),
                cell.dayNumber
              )
            );
          }}
          className={`w-full h-20 p-2 text-left rounded-lg transition border ${
            selected.toDateString() ===
            new Date(
              cell.date.getFullYear(),
              cell.date.getMonth(),
              cell.dayNumber
            ).toDateString()
              ? "ring-2 ring-yellow-400 bg-yellow-50"
              : "hover:bg-slate-50"
          } ${past ? "opacity-50 cursor-not-allowed" : ""} flex flex-col justify-between`}
          title={
            departmentFilteredSlots.length
              ? departmentFilteredSlots
                  .map((s) => {
                    const available = s.limit - (s.bookings_count || 0);
                    const arch = s.deleted_at ? " (Archived)" : "";
                    return `${departmentLabels[s.department] || s.department} ${s.time} (${available} avail)${arch}`;
                  })
                  .join("\n")
              : "No slot"
          }
          disabled={past}
        >
          <div className="flex items-center justify-between">
            <div className={`text-sm font-semibold ${past ? "text-slate-400" : ""}`}>{cell.dayNumber}</div>
            <div className={badgeClass}>{dayBadge}</div>
          </div>

          <div className="flex flex-wrap gap-1">
            {departmentFilteredSlots.slice(0, 3).map((slot) => {
              const available = slot.limit - (slot.bookings_count || 0);
              const colorClass =
                departmentColors[slot.department] || "bg-gray-300 text-black";

              if (slot.deleted_at) {
                return (
                  <span
                    key={slot.id}
                    className={`text-[10px] px-1 rounded-md font-semibold bg-slate-100 text-slate-600 opacity-70 border border-slate-200`}
                    style={{ lineHeight: 1 }}
                  >
                    {slot.department[0]} Arch
                  </span>
                );
              }

              return (
                <span
                  key={slot.id}
                  className={`${available > 0 ? colorClass : "bg-rose-100 text-rose-800 border border-rose-200"} text-[10px] px-1 rounded-md font-semibold ${past ? "opacity-50" : ""}`}
                  style={{ lineHeight: 1 }}
                >
                  {slot.department[0]} {available > 0 ? available : "Full"}
                </span>
              );
            })}
            {departmentFilteredSlots.length > 3 && (
              <span className="text-[10px] px-1 rounded-md bg-slate-200 text-slate-800">
                +{departmentFilteredSlots.length - 3}
              </span>
            )}
          </div>
        </button>
      );
    };

    return (
      <div className="w-full text-sm sm:text-base md:text-lg rounded-xl shadow-lg border-2 border-yellow-400 p-2 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs text-slate-600">
              {currentMonth.toLocaleString(undefined, { month: "long" })} {currentMonth.getFullYear()}
            </div>
            <div className="text-sm font-semibold">
              {departmentLabels[form.department] || "All Departments"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="px-3 py-1 rounded-lg border">◀</button>
            <button onClick={nextMonth} className="px-3 py-1 rounded-lg border">▶</button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-[12px]">
          { ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
            <div key={d} className="text-center text-[11px] font-medium text-slate-600 py-1">{d}</div>
          ))}

          {days.map((cell, idx) => (
            <div key={idx} className="p-0">{renderDayCell(cell)}</div>
          ))}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------

  return (
    <div
      className="relative min-h-screen py-8 sm:py-10 px-3 sm:px-4 md:px-6 lg:px-8 text-slate-100 bg-fixed bg-cover bg-center overflow-x-hidden"
      style={{ backgroundImage: "url('/src/images/Campus2.jpg')" }}
    >
      <div className="absolute inset-0 bg-green-950/20 z-0"></div>

      <div className="relative z-10 w-full mx-auto mt-12 sm:mt-16">
        {/* Header */}
        <header className="w-full mb-6 sm:mb-10">
          <div className="bg-black/20 backdrop-blur-sm rounded-xl shadow p-4 sm:p-6 md:p-8 text-center border border-yellow-500/30">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-300 flex flex-wrap items-center justify-center gap-2 mb-3">
              <FaCalendarAlt className="text-yellow-300" /> Exit Interview Booking
            </h1>
          </div>
        </header>

        {/* Main */}
        <main className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 w-full max-w-7xl mx-auto">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-2xl p-5 sm:p-6 md:p-8 text-slate-900 w-full md:col-span-2"
          >
            {/* Top inline error banner (user-friendly) */}
            {Object.keys(errors).length > 0 && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800">
                <strong>Fix the following:</strong>
                <ul className="mt-1 text-sm list-disc list-inside">
                  {Object.entries(errors).map(([k, v]) => (
                    <li key={k}>{v}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* API error banner */}
            {apiError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-100 border border-rose-300 text-rose-900">
                {apiError}
              </div>
            )}

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-green-900 flex items-center gap-2 mb-6">
                <FaUser className="text-green-700" /> Your Information
              </h2>

              <div className="space-y-4 sm:space-y-5">
                <input
                  placeholder="Last Name"
                  className={`w-full border rounded-lg p-3 sm:p-4 text-sm sm:text-base ${errors.last_name ? "border-red-500" : ""}`}
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                />

                <input
                  placeholder="Middle Name"
                  className={`w-full border rounded-lg p-3 sm:p-4 text-sm sm:text-base ${errors.middle_name ? "border-red-500" : ""}`}
                  value={form.middle_name}
                  onChange={(e) => setForm({ ...form, middle_name: e.target.value })}
                />

                <input
                  placeholder="First Name"
                  required
                  className={`w-full border rounded-lg p-3 sm:p-4 text-sm sm:text-base ${errors.first_name ? "border-red-500" : ""}`}
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                />

                {/* If searching, show spinner */}
                {searching && (
                  <div className="text-sm text-slate-500 flex items-center gap-2"><FaSpinner className="animate-spin"/> Checking existing booking...</div>
                )}

                {/* If existing booking found */}
                {existingBooking && (
                  <div className="p-3 rounded-lg border border-yellow-200 bg-yellow-50 mt-2 flex items-start gap-3">
                    <div className="text-yellow-700 text-xl pt-1"><FaExclamationTriangle/></div>
                    <div>
                      <div className="font-semibold">Record found</div>
                      <div className="text-sm">Status: <strong>{existingBooking.status}</strong></div>

                      {existingBooking.status === 'finished' && (
                        <div className="mt-2 p-2 bg-green-100 border border-green-200 rounded">
                          ✅ <strong>Already finished exit interview</strong>
                        </div>
                      )}

                      {existingBooking.status === 'no_show' && (
                        <div className="mt-2 p-2 bg-rose-50 border border-rose-100 rounded">
                          ⚠️ <strong>This student was marked as NO_SHOW.</strong>
                          <div className="text-xs mt-1">Auto-filled fields are shown below; choose a new schedule and reason to reschedule.</div>
                        </div>
                      )}

                      {/* Show link to existing resume if available */}
                      <div className="mt-2 text-xs">
                        {existingBooking.resume_link && (
                          <div>Resume link: <a href={existingBooking.resume_link} target="_blank" rel="noreferrer" className="underline">Open</a></div>
                        )}
                        {existingBooking.resume_file && (
                          <div>Stored resume file: <a href={`/storage/${existingBooking.resume_file}`} target="_blank" rel="noreferrer" className="underline">Open file</a></div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <FaUniversity className="text-green-700 text-base sm:text-lg" />
                  <select
                    className={`w-full border rounded-lg p-3 sm:p-4 text-sm sm:text-base ${errors.department ? "border-red-500" : ""}`}
                    value={form.department}
                    onChange={(e) => {
                      const dept = e.target.value;
                      setForm({
                        ...form,
                        department: dept,
                        course: dept === "College" ? form.course : "",
                      });
                    }}
                  >
                    <option value="">Select Department</option>
                    <option value="College">College</option>
                    <option value="SHS">SHS</option>
                    <option value="JHS">JHS</option>
                    <option value="GS">GS</option>
                  </select>
                </div>

                {form.department === "College" && (
                  <div className="flex items-center gap-3 mt-3">
                    <FaUniversity className="text-green-700 text-base sm:text-lg" />
                    <select
                      className={`w-full border rounded-lg p-3 sm:p-4 text-sm sm:text-base ${errors.course ? "border-red-500" : ""}`}
                      value={form.course || ""}
                      onChange={(e) => setForm({ ...form, course: e.target.value })}
                    >
                      <option value="">Select Department Course</option>
                      <option value="CCS">CCS</option>
                      <option value="CED">CED</option>
                      <option value="CPT">CPT</option>
                      <option value="CRT">CRT</option>
                      <option value="CON">CON</option>
                      <option value="CAC">CAC</option>
                      <option value="CBM">CBM</option>
                      <option value="CAS">CAS</option>
                    </select>
                  </div>
                )}

                {/* Resume Type */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-700">Resume Input Type</label>
                  <div className="flex items-center gap-4">
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="resumeType"
                        value="file"
                        checked={resumeType === "file"}
                        onChange={() => {
                          setResumeType("file");
                          setForm((prev) => ({ ...prev, resume_link: "" }));
                        }}
                      />
                      File
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="resumeType"
                        value="url"
                        checked={resumeType === "url"}
                        onChange={() => {
                          setResumeType("url");
                          setForm((prev) => ({ ...prev, resume_file: null }));
                          if (fileInputRef.current) fileInputRef.current.value = null;
                        }}
                      />
                      URL
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="resumeType"
                        value="file-existing"
                        checked={resumeType === "file-existing"}
                        onChange={() => setResumeType("file-existing")}
                      />
                      Use previously uploaded
                    </label>
                  </div>
                </div>

                {/* Resume Inputs */}
                <div className="flex items-center gap-3">
                  <FaFileUpload className="text-green-700 text-base sm:text-lg" />
                  {resumeType === "file" && (
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      className={`w-full text-xs sm:text-sm ${errors.resume ? "border-red-500" : ""}`}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setForm({ ...form, resume_file: file });
                        setResumeType("file");
                      }}
                    />
                  )}
                  {resumeType === "url" && (
                    <input
                      placeholder="Paste resume link (https://...)"
                      className={`w-full border rounded-lg p-3 sm:p-4 text-sm sm:text-base ${errors.resume ? "border-red-500" : ""}`}
                      value={form.resume_link}
                      onChange={(e) => setForm({ ...form, resume_link: e.target.value })}
                    />
                  )}

                  {resumeType === "file-existing" && existingBooking && existingBooking.resume_file && (
                    <div className="text-xs">
                      Using previously uploaded file. <a href={`/storage/${existingBooking.resume_file}`} target="_blank" rel="noreferrer" className="underline">Open</a>
                    </div>
                  )}
                </div>
                {errors.resume && <p className="text-xs text-rose-600">{errors.resume}</p>}

                {form.resume_file && (
                  <p className="text-xs text-green-700">Resume link not required when PDF is uploaded.</p>
                )}

                {/* If existing booking is no_show, show additional reschedule fields */}
                {existingBooking && existingBooking.status === 'no_show' && (
                  <div className="mt-4 p-4 border rounded-lg bg-rose-50">
                    <div className="flex items-center gap-2 mb-2">
                      <FaClock/> <div className="font-semibold">Reschedule (NO_SHOW)</div>
                    </div>

                    <div className="mb-3">
                      <label className="text-sm block mb-1">Reason for not attending</label>
                      <select className="w-full p-2 border rounded" value={reason} onChange={(e) => setReason(e.target.value)}>
                        <option value="">Select reason</option>
                        {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                      {reason === 'Other' && (
                        <input placeholder="Type other reason" className="mt-2 w-full p-2 border rounded" value={otherReasonText} onChange={(e) => setOtherReasonText(e.target.value)} />
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="text-sm block mb-1">Choose new schedule</label>
                      {filteredSlots.length > 0 ? (
                        <select onChange={(e) => setForm({ ...form, slot_id: e.target.value })} value={form.slot_id} className="w-full p-2 border rounded">
                          <option value="">Select a new slot</option>
                          {filteredSlots.map((slot) => {
                            const booked = slot.bookings_count || 0;
                            const available = slot.limit - booked;
                            const isArchived = !!slot.deleted_at;
                            const today = new Date();
                            today.setHours(0,0,0,0);
                            const slotDate = new Date(slot.date); slotDate.setHours(0,0,0,0);
                            const isPast = slotDate < today;

                            return (
                              <option key={slot.id} value={slot.id} disabled={available <= 0 || isArchived || isPast}>
                                {new Date(slot.date).toDateString()} {slot.time} ({booked}/{slot.limit} booked)
                              </option>
                            );
                          })}
                        </select>
                      ) : (
                        <div className="text-xs text-slate-600">No available slots on selected date</div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button onClick={updateExistingBooking} disabled={isLoading} className={`px-4 py-2 rounded ${isLoading ? 'opacity-60' : 'bg-yellow-500 text-white'}`}>
                        {isLoading ? <><FaSpinner className="animate-spin mr-2"/> Updating...</> : 'Save & Reschedule'}
                      </button>

                      <button onClick={() => { setExistingBooking(null); setReason(''); setOtherReasonText(''); }} className="px-4 py-2 rounded border">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Calendar */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="bg-white rounded-2xl shadow-2xl p-5 sm:p-6 md:p-8 text-slate-900 w-full md:col-span-2">
            <h2 className="text-lg sm:text-xl font-bold text-green-900 flex items-center gap-2 mb-4"><FaCalendarAlt className="text-green-700"/> Select Date</h2>
            <div className="mt-3 flex gap-3 flex-wrap text-xs sm:text-sm">
              {Object.entries(departmentColors).map(([dept, colorClass]) => (
                <div key={dept} className="flex items-center gap-1">
                  <span className={`w-3 h-3 ${colorClass} rounded-full`}></span>
                  <span>{dept}</span>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <CustomCalendar selected={date} onChange={(d) => setDate(d)} />
            </div>

            <div className="mt-6">
              <h3 className="text-sm sm:text-md font-semibold text-green-800 mb-2">Slots on {date.toDateString()}</h3>

              {/* IMPORTANT CHANGE: hide the general "Slots on {date}" select when the user has an existing NO_SHOW booking
                  because the reschedule UI already provides a "Choose new schedule" control. This prevents duplicate/redundant
                  selects appearing at the same time. */}

              {!(existingBooking && existingBooking.status === 'no_show') ? (
                filteredSlots.length > 0 ? (
                  <select onChange={(e) => setForm({ ...form, slot_id: e.target.value })} value={form.slot_id} className={`w-full border border-green-300 rounded-lg p-2 sm:p-3 focus:ring-2 focus:ring-green-600 text-sm sm:text-base ${errors.slot_id ? "border-red-500" : ""}`}>
                    <option value="">Select a slot</option>
                    {filteredSlots.map((slot) => {
                      const booked = slot.bookings_count || 0;
                      const available = slot.limit - booked;
                      const isArchived = !!slot.deleted_at;

                      const today = new Date(); today.setHours(0,0,0,0);
                      const slotDate = new Date(slot.date); slotDate.setHours(0,0,0,0);
                      const isPast = slotDate < today;

                      return (
                        <option key={slot.id} value={slot.id} disabled={available <= 0 || isArchived || isPast} className={isPast ? "text-slate-400" : ""}>
                          {slot.time} ({booked}/{slot.limit} booked){isArchived ? " — Archived" : available > 0 ? ` - Available (${available})` : ` - Full`}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <p className="text-xs sm:text-sm text-slate-600">No slot</p>
                )
              ) : (
                <p className="text-xs text-slate-500">Choose new schedule is shown above for NO_SHOW records.</p>
              )}

              {errors.slot_id && <p className="text-xs text-rose-600">{errors.slot_id}</p>}
            </div>

            {/* If no existing booking or not no_show, show normal confirm button */}
            {!existingBooking && (
              <button onClick={submitBooking} disabled={isLoading} className={`mt-8 bg-green-700 hover:bg-green-800 text-yellow-300 font-semibold px-6 py-3 sm:py-4 rounded-xl w-full shadow-lg transition text-base sm:text-lg flex items-center justify-center gap-2 ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}>
                {isLoading ? (<><FaSpinner className="animate-spin"/> Processing...</>) : ("Confirm Booking")}
              </button>
            )}

          </motion.div>
        </main>

      </div>

      {/* Confirmation Modal */}
      {confirmation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-[90%] max-w-xl text-slate-900 relative animate-fadeIn">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-100 p-3 rounded-full">✅</div>
              <h2 className="text-2xl font-extrabold text-green-800">Successfully Confirmed!</h2>
            </div>

            <h3 className="text-lg font-semibold text-slate-700 mb-3 border-b pb-2">Booking Details</h3>
            <div className="text-base space-y-2">
              <p><strong>Last Name:</strong> {confirmation.last_name}</p>
              <p><strong>Middle Name:</strong> {confirmation.middle_name}</p>
              <p><strong>First Name:</strong> {confirmation.first_name}</p>
              <p><strong>Department:</strong> {confirmation.department}</p>

              {confirmation.department === "College" && <p><strong>Course:</strong> {confirmation.course}</p>}
              <p><strong>Schedule:</strong> {confirmation.slotDate} at {confirmation.slotTime}</p>
              <p><strong>Venue:</strong> {confirmation.venue}</p>
            </div>

            <div className="mt-6 flex items-center gap-3 bg-slate-50 p-3 rounded-lg">
              <input type="checkbox" id="confirmCheck" checked={confirmChecked} onChange={() => setConfirmChecked(!confirmChecked)} className="w-4 h-4 accent-green-700" />
              <label htmlFor="confirmCheck" className="text-sm text-slate-700">I have screenshot this for proof</label>
            </div>

            <button onClick={() => setConfirmation(null)} disabled={!confirmChecked} className={`mt-6 w-full py-3 rounded-xl text-lg font-semibold transition ${confirmChecked ? "bg-green-700 text-yellow-200 hover:bg-green-800 shadow-md" : "bg-green-200 text-slate-400 cursor-not-allowed"}`}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
