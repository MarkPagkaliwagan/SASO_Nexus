import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FaCalendarAlt,
  FaFileUpload,
  FaUser,
  FaUniversity,
  FaSpinner,
} from "react-icons/fa";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const INITIAL_FORM = {
  last_name: "",
  middle_name: "",
  first_name: "",
  department: "",
  slot_id: "",
  resume_link: "",
  resume_file: null,
};

export default function ExitSubmission() {
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [date, setDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  // NEW: resume type state - "file" or "url"
  const [resumeType, setResumeType] = useState("file");

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const res = await axios.get("/api/slots");
      setSlots(res.data);
    } catch (err) {
      console.error("Error fetching slots", err);
    }
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setDate(new Date());
    setResumeType("file");
    if (fileInputRef.current) {
      // clear file input
      fileInputRef.current.value = null;
    }
  };

  const submitBooking = async () => {
    // Frontend validation: kailangan may PDF o URL
    if ((!form.resume_file || form.resume_file.size === 0) && !form.resume_link) {
      alert("⚠️ Please upload a PDF or provide a resume link.");
      return;
    }

    const data = new FormData();
    for (let key in form) {
      // Skip empty resume_file
      if (key === "resume_file") {
        if (form.resume_file && form.resume_file.size > 0) {
          data.append(key, form.resume_file);
        }
        continue;
      }

      // Skip resume_link if there's a valid file
      if (key === "resume_link" && form.resume_file && form.resume_file.size > 0) continue;

      data.append(key, form[key]);
    }

    try {
      setIsLoading(true);
      await axios.post("/api/bookings", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("✅ Booking confirmed!");

      // REFRESH slots from server and CLEAR the form
      await fetchSlots();
      resetForm();
    } catch (err) {
      alert(err.response?.data?.error || "Error submitting booking");
    } finally {
      setIsLoading(false);
    }
  };


  const slotsByDate = slots.reduce((acc, slot) => {
    const d = new Date(slot.date).toDateString();
    if (!acc[d]) acc[d] = [];
    acc[d].push(slot);
    return acc;
  }, {});

  const filteredSlots = slotsByDate[date.toDateString()] || [];

  return (
    <div
      className="relative min-h-screen py-8 sm:py-10 px-3 sm:px-4 md:px-6 lg:px-8 text-slate-100 bg-fixed bg-cover bg-center overflow-x-hidden"
      style={{ backgroundImage: "url('/src/images/Campus2.jpg')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-green-950/20 z-0"></div>

      <div className="relative z-10 w-full mx-auto mt-12 sm:mt-16">
        {/* Header */}
        <header className="w-full mb-6 sm:mb-10">
          <div className="bg-black/20 backdrop-blur-sm rounded-xl shadow p-4 sm:p-6 md:p-8 text-center border border-yellow-500/30">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-300 flex flex-wrap items-center justify-center gap-2 mb-3">
              <FaCalendarAlt className="text-yellow-300" /> Exit Interview
              Booking
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-slate-200 leading-relaxed max-w-3xl mx-auto">
              Welcome to the{" "}
              <span className="font-semibold text-yellow-200">
                Exit Interview Scheduling Portal
              </span>
              . Please choose your preferred date and time slot for your exit
              interview. Make sure to upload your updated resume and
              double-check your personal details before submitting.
            </p>

            <p className="mt-3 text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Slots are available on a first-come, first-served basis. Once
              confirmed, your booking will be reserved under your name. You will
              also receive a confirmation notice from the department.
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 w-full max-w-6xl mx-auto">
          {/* Calendar Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-2xl p-5 sm:p-6 md:p-8 text-slate-900 w-full"
          >
            <h2 className="text-lg sm:text-xl font-bold text-green-900 flex items-center gap-2 mb-4">
              <FaCalendarAlt className="text-green-700" /> Select Date
            </h2>
            <Calendar
              onChange={setDate}
              value={date}
              className="w-full text-sm sm:text-base md:text-lg rounded-xl shadow-lg border-2 border-yellow-400 p-2 sm:p-4"
              tileContent={({ date }) => {
                const slotsForDay = slotsByDate[date.toDateString()];
                if (slotsForDay && slotsForDay.length > 0) {
                  const totalAvailable = slotsForDay.reduce(
                    (sum, s) => sum + (s.limit - s.bookings_count),
                    0
                  );
                  return (
                    <div className="text-[10px] sm:text-xs mt-1 text-green-700 font-semibold">
                      {totalAvailable} left
                    </div>
                  );
                }
                return null;
              }}
              tileDisabled={({ date }) =>
                !slotsByDate[date.toDateString()] ||
                slotsByDate[date.toDateString()].every(
                  (s) => s.limit - s.bookings_count <= 0
                )
              }
            />

            <div className="mt-6">
              <h3 className="text-sm sm:text-md font-semibold text-green-800 mb-2">
                Slots on {date.toDateString()}
              </h3>
              {filteredSlots.length > 0 ? (
                <select
                  onChange={(e) =>
                    setForm({ ...form, slot_id: e.target.value })
                  }
                  value={form.slot_id}
                  className="w-full border border-green-300 rounded-lg p-2 sm:p-3 focus:ring-2 focus:ring-green-600 text-sm sm:text-base"
                >
                  <option>Select a slot</option>
                  {filteredSlots.map((slot) => {
                    const booked = slot.bookings_count;
                    const available = slot.limit - booked;
                    return (
                      available > 0 && (
                        <option key={slot.id} value={slot.id}>
                          {slot.time} ({booked}/{slot.limit} booked)
                        </option>
                      )
                    );
                  })}
                </select>
              ) : (
                <p className="text-xs sm:text-sm text-slate-600">
                  No slots available.
                </p>
              )}
            </div>
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 text-slate-900 flex flex-col justify-between w-full"
          >
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-green-900 flex items-center gap-2 mb-6">
                <FaUser className="text-green-700" /> Your Information
              </h2>

              <div className="space-y-4 sm:space-y-5">
                <input
                  placeholder="Last Name"
                  className="w-full border rounded-lg p-3 sm:p-4 text-sm sm:text-base"
                  value={form.last_name}
                  onChange={(e) =>
                    setForm({ ...form, last_name: e.target.value })
                  }
                />
                <input
                  placeholder="Middle Name"
                  className="w-full border rounded-lg p-3 sm:p-4 text-sm sm:text-base"
                  value={form.middle_name}
                  onChange={(e) =>
                    setForm({ ...form, middle_name: e.target.value })
                  }
                />
                <input
                  placeholder="First Name"
                  required
                  className="w-full border rounded-lg p-3 sm:p-4 text-sm sm:text-base"
                  value={form.first_name}
                  onChange={(e) =>
                    setForm({ ...form, first_name: e.target.value })
                  }
                />

                <div className="flex items-center gap-3">
                  <FaUniversity className="text-green-700 text-base sm:text-lg" />
                  <select
                    className="w-full border rounded-lg p-3 sm:p-4 text-sm sm:text-base"
                    value={form.department}
                    onChange={(e) =>
                      setForm({ ...form, department: e.target.value })
                    }
                  >
                    <option>Select Department</option>
                    <option>CCS</option>
                    <option>CED</option>
                    <option>CRT</option>
                    <option>CPT</option>
                    <option>CON</option>
                    <option>CBM</option>
                    <option>CAC</option>
                    <option>CAS</option>
                  </select>
                </div>

                {/* ---------- NEW: Resume type selector (radio) ---------- */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-700">
                    Resume Input Type
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="resumeType"
                        value="file"
                        checked={resumeType === "file"}
                        onChange={() => {
                          setResumeType("file");
                          // when switching to file, clear resume_link
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
                          // when switching to url, clear file and file input
                          setForm((prev) => ({ ...prev, resume_file: null }));
                          if (fileInputRef.current) fileInputRef.current.value = null;
                        }}
                      />
                      URL
                    </label>
                  </div>
                </div>

                {/* ---------- Resume inputs (conditioned by resumeType) ---------- */}
                <div className="flex items-center gap-3">
                  <FaFileUpload className="text-green-700 text-base sm:text-lg" />
                  {/* Show file input only when File is selected */}
                  {resumeType === "file" && (
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      className="w-full text-xs sm:text-sm"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setForm({ ...form, resume_file: file });
                        // if a file is chosen, ensure resumeType is file
                        setResumeType("file");
                      }}
                    />
                  )}

                  {/* Show URL input only when URL is selected */}
                  {resumeType === "url" && (
                    <input
                      placeholder="Paste resume link (https://...)"
                      className="w-full border rounded-lg p-3 sm:p-4 text-sm sm:text-base"
                      value={form.resume_link}
                      onChange={(e) =>
                        setForm({ ...form, resume_link: e.target.value })
                      }
                    />
                  )}
                </div>

                {/* Keep message about disabling link when PDF uploaded (intact behavior) */}
                <div className="flex flex-col gap-1">
                  {/* If there's a file, show hint */}
                  {form.resume_file && (
                    <p className="text-xs text-green-700">
                      Resume link not required when PDF is uploaded.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={submitBooking}
              disabled={isLoading}
              className={`mt-8 bg-green-700 hover:bg-green-800 text-yellow-300 font-semibold px-6 py-3 sm:py-4 rounded-xl w-full shadow-lg transition text-base sm:text-lg flex items-center justify-center gap-2 ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin" /> Processing...
                </>
              ) : (
                "Confirm Booking"
              )}
            </button>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
