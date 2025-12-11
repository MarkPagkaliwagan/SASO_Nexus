import React, { useEffect, useState } from "react";
import {
  FiPlus,
  FiTrash2,
  FiCalendar,
  FiClock,
  FiUsers,
  FiSearch,
  FiCheck,
  FiEye,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function AdminSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [applications, setApplications] = useState([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [limit, setLimit] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // search & sort
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("");
  const [approvingId, setApprovingId] = useState(null); // visual state while approving
  const navigate = useNavigate();

  useEffect(() => {
    fetchSchedules();
    fetchApplications();
  }, []);

  async function fetchSchedules() {
    setLoading(true);
    try {
      const res = await fetch("/api/schedules");
      if (!res.ok) throw new Error("Failed to load schedules");
      const data = await res.json();
      setSchedules(data);
    } catch (err) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  async function fetchApplications() {
    try {
      const res = await fetch("/api/applications");
      if (!res.ok) throw new Error("Failed to load applications");
      const data = await res.json();
      setApplications(data);
    } catch (err) {
      console.error(err.message);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    if (!date || !time || !limit || isNaN(Number(limit))) {
      setError("Please provide valid date, time and numeric limit.");
      return;
    }

    const payload = { date, time, limit: Number(limit) };
    try {
      setLoading(true);
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to add");
      }
      const created = await res.json();
      setSchedules((s) => [created, ...s]);
      setDate("");
      setTime("");
      setLimit(1);
    } catch (err) {
      setError(err.message || "Add failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this schedule?")) return;
    try {
      const res = await fetch(`/api/schedules/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setSchedules((s) => s.filter((x) => x.id !== id));
    } catch (err) {
      alert(err.message || "Could not delete");
    }
  }
  async function togglePayment(appId) {
    try {
      const res = await fetch(`/api/applications/${appId}/toggle-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to toggle payment type");
      const updated = await res.json();
      setApplications((prev) =>
        prev.map((a) =>
          a.id === appId ? { ...a, payment_type: updated.payment_type } : a
        )
      );
    } catch (err) {
      alert(err.message || "Error toggling payment");
    }
  }

  async function handleDeleteApplication(id) {
    if (!confirm("Delete this application?")) return;
    try {
      const res = await fetch(`/api/applications/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setApplications((a) => a.filter((x) => x.id !== id));
    } catch (err) {
      alert(err.message || "Could not delete");
    }
  }

  // Approve action: use applicant's chosen schedule (server checks schedule_id)
  async function confirmApprove(appId) {
    if (!confirm("Approve this application and send email?")) return;
    setApprovingId(appId);
    try {
      const res = await fetch(`/api/applications/${appId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // no body: server will use application's schedule_id
      });
      const data = await res.json();
      if (!res.ok) {
        // server returns helpful message if applicant has no schedule
        throw new Error(data.message || "Approve failed");
      }
      // update local state: set status to approved
      setApplications((prev) =>
        prev.map((a) =>
          a.id === appId
            ? {
                ...a,
                status: "approved",
                approved_at: new Date().toISOString(),
              }
            : a
        )
      );
      // feedback
// --- MODERN FEEDBACK ---
const msg = `🎉 Application approved!\n📨 Confirmation email has been sent.`;
if (window?.toast) {
  window.toast(msg, { type: "success" });
} else {
  alert(msg);
}

    } catch (err) {
      const errMsg = `❌ Approval failed: ${err.message || "Unknown error"}`;
if (window?.toast) {
  window.toast(errMsg, { type: "error" });
} else {
  alert(errMsg);
}

    } finally {
      setApprovingId(null);
    }
  }

  // Filter & sort
  const filteredAndSortedApplications = applications
    .filter(
      (a) =>
        a.nameFamily?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.nameGiven?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.applicationType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(a.id || "").includes(searchQuery)
    )
    .sort((a, b) => {
      if (!sortField) return 0;
      if (a[sortField] < b[sortField]) return -1;
      if (a[sortField] > b[sortField]) return 1;
      return 0;
    });

  // --- SAFER DATE/TIME RENDERER ---
  function renderScheduleText(app) {
    const sched =
      app.schedule ?? schedules.find((s) => s.id === app.schedule_id);
    if (!sched)
      return <span className="text-xs text-gray-400">No schedule</span>;

    // 1) sanitize raw values
    const rawDate = (sched.date ?? "").toString().trim(); // expect: YYYY-MM-DD or DD/MM/YYYY, etc.
    const rawTime = (sched.time ?? "").toString().trim(); // accept: "08:00", "8:00 AM", etc.

    // 2) convert time to 24h if may AM/PM
    const to24h = (t) => {
      if (!t) return "";
      const m = t.match(/^(\d{1,2})(?::?(\d{2}))?\s*(AM|PM)$/i);
      if (!m) return t; // already 24h or unknown format
      let h = parseInt(m[1], 10);
      const min = m[2] ? m[2] : "00";
      const ap = m[3].toUpperCase();
      if (ap === "PM" && h < 12) h += 12;
      if (ap === "AM" && h === 12) h = 0;
      return `${String(h).padStart(2, "0")}:${min}`;
    };

    const time24 = to24h(rawTime);

    // 3) try safest ISO combination first: YYYY-MM-DDTHH:mm
    let d = null;
    if (rawDate && (time24 || rawTime)) {
      d = new Date(`${rawDate}T${time24 || rawTime}`);
      if (isNaN(d?.getTime())) d = new Date(`${rawDate} ${time24 || rawTime}`); // secondary try
    } else if (rawDate) {
      d = new Date(rawDate);
    }

    // 4) fallback parse for DD/MM/YYYY (convert to ISO)
    if ((!d || isNaN(d.getTime())) && rawDate.includes("/")) {
      const parts = rawDate.split("/").map((p) => p.trim());
      if (parts.length === 3) {
        // assume DD/MM/YYYY
        const [dd, mm, yyyy] = parts;
        const iso = `${yyyy}-${String(mm).padStart(2, "0")}-${String(
          dd
        ).padStart(2, "0")}${time24 ? "T" + time24 : ""}`;
        d = new Date(iso);
      }
    }

    // 5) final guard: kung invalid pa rin, huwag mag-format—ipakita na lang raw
    if (!d || isNaN(d.getTime())) {
      return (
        <div className="text-sm min-w-0">
          <div className="font-medium truncate">
            {rawDate || "Unknown date"}
          </div>
          <div className="text-xs text-gray-500 truncate">
            {rawTime || "Unknown time"}
          </div>
        </div>
      );
    }

    // 6) pretty format
    const dateStr = d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const timeStr = d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });

    return (
      <div className="text-sm min-w-0 max-w-[140px]">
        <div className="font-medium truncate">{dateStr}</div>
        <div className="text-xs text-gray-500 truncate">{timeStr}</div>
      </div>
    );
  }

  return (
    <div className="p-4 w-full mx-auto text-black">
      {/* SCHEDULE CARD */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-transparent">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-5 border-b">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-300 to-yellow-200 shadow-inner">
              <FiCalendar className="text-yellow-800" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Admission Schedule
              </h3>
              <p className="text-sm text-gray-500">
                Manage admission date & time slots
              </p>
            </div>
          </div>
        </div>

        {/* FORM */}
        <div className="px-6 py-6">
          <form
            onSubmit={handleAdd}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {/* Date */}
            <div className="w-full">
              <label className="text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
            </div>

            {/* Time */}
            <div className="w-full">
              <label className="text-sm font-medium text-gray-700">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
            </div>

            {/* Limit */}
            <div className="w-full">
              <label className="text-sm font-medium text-gray-700">Limit</label>
              <input
                type="number"
                min={1}
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
            </div>

            {/* Add Button */}
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition transform hover:-translate-y-0.5 whitespace-nowrap"
              >
                <FiPlus /> Add
              </button>
            </div>
          </form>

          <div className="my-6 border-t" />

          {/* Schedule List */}
          <div className="space-y-3">
            {loading && schedules.length === 0 ? (
              <div className="text-center text-gray-500 py-6">Loading...</div>
            ) : schedules.length === 0 ? (
              <div className="text-center text-gray-500 py-6">
                No schedules yet. Add one above.
              </div>
            ) : (
              schedules.map((s) => {
                const available = (s.limit ?? 0) - (s.booked ?? 0);
                return (
                  <div
                    key={s.id}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-center bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition"
                  >
                    {/* Date */}
                    <div className="flex items-center gap-3 col-span-4">
                      <FiCalendar className="text-yellow-500" />
                      <div>
                        <div className="font-semibold text-gray-800">
                          {s.date}
                        </div>
                      </div>
                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-2 text-gray-700 col-span-2">
                      <FiClock /> <span className="font-medium">{s.time}</span>
                    </div>

                    {/* Limit */}
                    <div className="flex items-center gap-2 text-gray-700 col-span-2">
                      <FiUsers /> <span className="font-medium">{s.limit}</span>
                    </div>

                    {/* Availability */}
                    <div className="col-span-2 text-sm text-gray-600">
                      {s.booked ?? 0} booked •{" "}
                      <span className="text-xs text-gray-400">
                        {available} available
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex sm:justify-end">
                      <button
                        type="button"
                        onClick={() => handleDelete(s.id)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-white border border-red-100 text-red-600 hover:bg-red-50 transition whitespace-nowrap"
                        title="Delete schedule"
                      >
                        <FiTrash2 /> Delete
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="px-6 py-3 border-t text-sm text-gray-500">
          Tip: gold accents for focus, green for success. Hover rows for subtle
          shadow.
        </div>
      </div>

      {/* Applicants card */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-transparent mt-8">
        <div className="px-6 py-5 border-b flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">
              Scheduled Applicants
            </h3>
            <p className="text-sm text-gray-500">
              List of applicants who booked an entrance exam
            </p>
          </div>
        </div>

        {/* search & sort */}
        <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="relative md:col-span-2">
            <FiSearch className="absolute left-3 top-3 text-black" />
            <input
              type="text"
              placeholder="Search by name, type or id..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 w-full rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-300"
            />
          </div>

          <div className="flex items-center justify-end">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-300"
              title="Sort by"
            >
              <option value="">Sort by...</option>
              <option value="nameFamily">Family Name</option>
              <option value="nameGiven">Given Name</option>
              <option value="applicationType">Application Type</option>
              <option value="id">ID</option>
            </select>
          </div>
        </div>

        {/* table */}
        <div className="px-6 py-6">
          <div className="hidden md:grid grid-cols-12 gap-4 text-sm text-gray-600 font-medium px-2 py-2 border-b">
            <div className="col-span-1">ID</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Family Name</div>
            <div className="col-span-2">Given Name</div>
            <div className="col-span-1">Middle</div>
            <div className="col-span-1">Gender</div>
            <div className="col-span-1">Schedule</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <div className="space-y-3 mt-2">
            {filteredAndSortedApplications.length === 0 ? (
              <div className="text-center text-gray-500 py-10">
                No applicants found.
              </div>
            ) : (
              filteredAndSortedApplications.map((a) => {
                const isApproved = a.status === "approved";
                return (
                  <div
                    key={a.id}
                    className={`group bg-white rounded-xl p-4 border hover:shadow-lg transition grid grid-cols-1 md:grid-cols-12 gap-4 items-start min-w-0`}
                    style={{
                      borderLeft: isApproved
                        ? "6px solid #16a34a"
                        : "6px solid transparent",
                    }}
                  >
                    {/* Desktop cells */}
                    <div className="hidden md:flex md:items-center md:col-span-1 text-sm text-gray-700 min-w-0">
                      {a.id}
                    </div>
                    <div className="hidden md:flex md:items-center md:col-span-2 text-sm text-gray-700 min-w-0">
                      {a.applicationType}
                    </div>
                    <div className="hidden md:flex md:items-center md:col-span-2 text-sm font-semibold text-gray-900 min-w-0">
                      {a.nameFamily}
                    </div>
                    <div className="hidden md:flex md:items-center md:col-span-2 text-sm text-gray-800 min-w-0">
                      {a.nameGiven}
                    </div>
                    <div className="hidden md:flex md:items-center md:col-span-1 text-sm text-gray-700 min-w-0">
                      {a.nameMiddle}
                    </div>
                    <div className="hidden md:flex md:items-center md:col-span-1 text-sm text-gray-700 min-w-0">
                      {a.gender}
                    </div>

                    {/* Schedule: visible only on md+ (reduced to 1 col to free space for actions) */}
                    <div className="hidden md:flex md:items-center md:col-span-1 text-sm text-gray-600 min-w-0 justify-end">
                      <FiCalendar className="mr-3 text-yellow-500" />
                      <div className="min-w-0">{renderScheduleText(a)}</div>
                    </div>

                    {/* Actions cell for desktop (prevents overlap, aligns right) */}
                    <div className="hidden md:flex md:col-span-2 justify-end min-w-0">
                      <div className="flex flex-wrap items-center justify-end gap-2 gap-y-2 max-w-full">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/view-form/${a.id}`)}
                          className="px-3 py-1 rounded-md text-xs bg-white border border-gray-200 hover:bg-gray-50 transition flex items-center gap-2 whitespace-nowrap shrink-0"
                          title="View form"
                        >
                          <FiEye /> View
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteApplication(a.id)}
                          className="px-3 py-1 rounded-md text-xs bg-white border border-red-100 text-red-600 hover:bg-red-50 transition flex items-center gap-2 whitespace-nowrap shrink-0"
                          title="Delete application"
                        >
                          <FiTrash2 /> Delete
                        </button>
<div className="flex items-center gap-1">
  {/* Switch */}
  <div
    onClick={() => togglePayment(a.id)}
    className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300
      ${a.payment_type === "paid" ? "bg-blue-500" : "bg-green-500"}`}
  >
    <div
      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300
        ${a.payment_type === "paid" ? "translate-x-5" : "translate-x-0"}`}
    />
  </div>

  {/* Label */}
  <span className={`text-[11px] font-medium ${
    a.payment_type === "paid" ? "text-blue-600" : "text-green-600"
  }`}>
    {a.payment_type === "paid" ? "Paid" : "Free"}
  </span>
</div>


                        <button
                          type="button"
                          onClick={() => confirmApprove(a.id)}
                          disabled={isApproved || approvingId === a.id}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition flex items-center gap-2 whitespace-nowrap shrink-0
                            ${
                              isApproved
                                ? "bg-green-600 text-white"
                                : "bg-red-500 text-white hover:opacity-95"
                            }`}
                          title={
                            isApproved
                              ? "Already approved"
                              : "Approve application"
                          }
                        >
                          {approvingId === a.id ? (
                            "Approving..."
                          ) : isApproved ? (
                            <>
                              <FiCheck /> Approved
                            </>
                          ) : (
                            "Approve"
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Mobile stacked view (NO schedule shown on mobile per request) */}
                    <div className="md:hidden w-full">
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-semibold">
                          {a.nameFamily}, {a.nameGiven}
                        </div>
                        <div className="text-xs text-gray-400">ID {a.id}</div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-700 mt-2">
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-gray-500">
                            {a.applicationType}
                          </div>
                          <div className="text-xs text-gray-400">•</div>
                          <div className="text-xs text-gray-500">
                            {a.gender}
                          </div>
                        </div>

                        <div className="text-xs text-gray-500">{a.mobile}</div>
                      </div>

                      {/* NOTE: schedule intentionally omitted on mobile */}
                      <div className="flex items-center justify-between mt-3">
                        {/* Mobile actions group: consistent sizing and order */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/view-form/${a.id}`)}
                            className="px-2 py-1 rounded-md text-xs bg-white border border-gray-200 hover:bg-gray-50 transition flex items-center gap-1 whitespace-nowrap"
                            title="View form"
                          >
                            <FiEye />
                            <span className="hidden sm:inline">View</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteApplication(a.id)}
                            className="px-2 py-1 rounded-md text-xs bg-white border border-red-100 text-red-600 hover:bg-red-50 transition flex items-center gap-1 whitespace-nowrap"
                            title="Delete application"
                          >
                            <FiTrash2 />
                            <span className="hidden sm:inline">Delete</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => confirmApprove(a.id)}
                            disabled={isApproved || approvingId === a.id}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition flex items-center gap-2 whitespace-nowrap
                              ${
                                isApproved
                                  ? "bg-green-600 text-white"
                                  : "bg-red-500 text-white hover:opacity-95"
                              }`}
                            title={
                              isApproved
                                ? "Already approved"
                                : "Approve application"
                            }
                          >
                            {approvingId === a.id ? (
                              "Approving..."
                            ) : isApproved ? (
                              <>
                                <FiCheck /> Approved
                              </>
                            ) : (
                              "Approve"
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="px-6 py-3 border-t text-sm text-gray-500">
          Tip: Use the search and sort to quickly find applicants. Approved rows
          get a green accent on the left border.
        </div>
      </div>
    </div>
  );
}
