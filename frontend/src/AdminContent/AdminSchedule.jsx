import React, { useEffect, useState } from "react";
import { FiPlus, FiTrash2, FiCalendar, FiClock, FiUsers } from "react-icons/fi";

export default function AdminSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [limit, setLimit] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSchedules();
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

  return (
    <div className="p-2 max-w-5x5 mx-auto">
      <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl text-white shadow-md">
              <FiCalendar size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Admission Schedule</h2>
              <p className="text-sm text-gray-500">
                Manage admission date & time slots
              </p>
            </div>
          </div>
          <button
            onClick={fetchSchedules}
            className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 transition px-3 py-1.5 rounded-md text-sm"
          >
            Refresh
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {/* Add form */}
          <form
            onSubmit={handleAdd}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
          >
            <div className="col-span-1 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Limit</label>
              <input
                type="number"
                min={1}
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            <div className="md:col-span-4 flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:scale-105 transform hover:bg-indigo-700 transition text-white px-4 py-2 rounded-lg shadow"
              >
                <FiPlus /> Add Schedule
              </button>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </form>

          {/* Divider */}
          <div className="my-6 border-t" />

          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 text-sm text-gray-600 font-medium px-2 py-2">
            <div className="col-span-4">Date</div>
            <div className="col-span-2">Time</div>
            <div className="col-span-2">Limit</div>
            <div className="col-span-2">Booked</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* Rows */}
          <div className="space-y-3 mt-2">
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
                    className="group grid grid-cols-12 gap-4 items-center bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 rounded-xl p-4 transition-shadow shadow-sm"
                  >
                    <div className="col-span-4 flex items-center gap-3">
                      <FiCalendar />
                      <div>
                        <div className="font-semibold">{s.date}</div>
                      </div>
                    </div>

                    <div className="col-span-2 flex items-center gap-2">
                      <FiClock />
                      <span className="font-medium">{s.time}</span>
                    </div>

                    <div className="col-span-2 flex items-center gap-2">
                      <FiUsers />
                      <span className="font-medium">{s.limit}</span>
                    </div>

                    <div className="col-span-2">
                      <div className="text-sm">{s.booked ?? 0} booked</div>
                      <div className="text-xs text-gray-500">
                        {available} available
                      </div>
                    </div>

                    <div className="col-span-2 text-right">
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 border border-transparent hover:border-red-100 transition"
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

        {/* Footer */}
        <div className="px-6 py-3 border-t text-sm text-gray-500">
          Tip: Hover rows to reveal actions. Responsive layout — try resizing.
        </div>
      </div>
    </div>
  );
}
