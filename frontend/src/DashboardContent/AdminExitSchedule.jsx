// src/pages/AdminExitSchedule.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiPlus, FiTrash2, FiUsers, FiCalendar } from "react-icons/fi";

export default function AdminExitSchedule() {
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState({ date: "", time: "", limit: 1, department: "" });

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    const res = await axios.get("/api/slots");
    setSlots(res.data);
  };

  const addSlot = async () => {
    if (!form.date || !form.time || !form.limit || !form.department) {
      alert("Fill in all fields");
      return;
    }
    await axios.post("/api/slots", form);
    setForm({ date: "", time: "", limit: 1, department: "" });
    fetchSlots();
  };

  const deleteSlot = async (id) => {
    if (window.confirm("Are you sure you want to delete this slot?")) {
      await axios.delete(`/api/slots/${id}`);
      fetchSlots();
    }
  };

  const updateStatus = async (id, status) => {
    await axios.patch(`/api/bookings/${id}/status`, { status });
    fetchSlots();
  };

  return (
    <div className="relative p-4 sm:p-8 min-h-screen text-gray-800 bg-transparent">
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-100/60 to-yellow-100/60 -z-10"></div>

      {/* Page Title & Description */}
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-4xl font-bold text-green-700 flex items-center justify-center gap-2 mb-3">
          <FiCalendar className="text-green-600" /> Exit Interview Schedule
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
          Manage available interview slots and track employee bookings in real
          time. Assign statuses and monitor attendance efficiently.
        </p>
      </div>

      {/* Manage Slots Card */}
      <div className="bg-white/70 backdrop-blur-md border border-green-300 shadow-lg rounded-2xl p-4 sm:p-6 mb-8">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2 text-green-700">
          <FiPlus /> Manage Slots
        </h3>

        {/* Add Slot Form */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            className="flex-1 min-w-[120px] border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 bg-white/80"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
          >
            <option value="">Select Department</option>
            <option value="College">College</option>
            <option value="SHS">SHS</option>
            <option value="JHS">JHS</option>
            <option value="GS">GS</option>
          </select>

          <input
            type="date"
            className="flex-1 min-w-[120px] border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 bg-white/80"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <input
            type="time"
            className="flex-1 min-w-[100px] border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 bg-white/80"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
          />
          <input
            type="number"
            min="1"
            className="flex-1 min-w-[80px] border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 bg-white/80"
            value={form.limit}
            onChange={(e) => setForm({ ...form, limit: e.target.value })}
          />
          <button
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow flex items-center justify-center gap-2 transition"
            onClick={addSlot}
          >
            <FiPlus /> Add Slot
          </button>
        </div>

        {/* Slots Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-300 rounded-lg">
            <thead className="bg-green-100">
              <tr>
                <th className="p-3 border">Department</th>
                <th className="p-3 border">Date</th>
                <th className="p-3 border">Time</th>
                <th className="p-3 border">Limit</th>
                <th className="p-3 border">Booked</th>
                <th className="p-3 border">Available</th>
                <th className="p-3 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => {
                const booked = slot.bookings_count;
                const available = slot.limit - booked;

                return (
                  <tr
                    key={slot.id}
                    className="hover:bg-green-50 transition text-center"
                  >
                    <td className="p-3 border">{slot.department}</td>
                    <td className="p-3 border">{slot.date}</td>
                    <td className="p-3 border">{slot.time}</td>
                    <td className="p-3 border">{slot.limit}</td>
                    <td className="p-3 border">{booked}</td>
                    <td className="p-3 border text-green-600 font-semibold">
                      {available}
                    </td>
                    <td className="p-3 border">
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg shadow flex items-center gap-1 mx-auto"
                        onClick={() => deleteSlot(slot.id)}
                      >
                        <FiTrash2 /> Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bookings per Slot */}
      <div className="grid gap-6">
        {slots.map(
          (slot) =>
            slot.bookings.length > 0 && (
              <div
                key={slot.id}
                className="bg-white/70 backdrop-blur-md border border-yellow-300 rounded-2xl shadow-md p-4 sm:p-6"
              >
                <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2 text-green-700">
                  <FiUsers className="text-yellow-500" />
                  Bookings for {slot.department} – {slot.date} – {slot.time} (
                  {slot.bookings.length})
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-gray-300 rounded-lg">
                    <thead className="bg-yellow-100">
                      <tr>
                        <th className="p-2 border">Name</th>
                        <th className="p-2 border">Department</th>
                        <th className="p-2 border">Resume</th>
                        <th className="p-2 border">Booked At</th>
                        <th className="p-2 border">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {slot.bookings.map((b) => (
                        <tr
                          key={b.id}
                          className="hover:bg-yellow-50 transition text-center"
                        >
                          <td className="p-2 border">
                            {b.first_name} {b.middle_name} {b.last_name}
                          </td>
                          <td className="p-2 border">{b.department}</td>
                          <td className="p-2 border">
                            {b.resume_link ? (
                              <a
                                href={b.resume_link}
                                target="_blank"
                                className="text-green-700 underline"
                              >
                                Link
                              </a>
                            ) : b.resume_file ? (
                              <a
                                href={`/storage/${b.resume_file}`}
                                target="_blank"
                                className="text-green-700 underline"
                              >
                                PDF
                              </a>
                            ) : (
                              "N/A"
                            )}
                          </td>
                          <td className="p-2 border">
                            {new Date(b.created_at).toLocaleString()}
                          </td>
                          <td className="p-2 border">
                            <div className="flex flex-col sm:flex-row justify-center gap-2">
                              <button
                                onClick={() => updateStatus(b.id, "finished")}
                                className={`px-3 py-1 rounded-lg text-xs font-medium shadow transition ${
                                  b.status === "finished"
                                    ? "bg-green-600 text-white"
                                    : "bg-gray-200 hover:bg-green-500 hover:text-white"
                                }`}
                              >
                                Finished
                              </button>
                              <button
                                onClick={() => updateStatus(b.id, "no_show")}
                                className={`px-3 py-1 rounded-lg text-xs font-medium shadow transition ${
                                  b.status === "no_show"
                                    ? "bg-red-500 text-white"
                                    : "bg-gray-200 hover:bg-red-500 hover:text-white"
                                }`}
                              >
                                No Show
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
        )}
      </div>
    </div>
  );
}
