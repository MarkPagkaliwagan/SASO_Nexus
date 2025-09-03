import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  FiPlus,
  FiTrash2,
  FiUsers,
  FiCalendar,
  FiSearch,
  FiInfo,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";

export default function AdminExitSchedule() {
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState({ date: "", time: "", limit: 1, department: "" });
  const [searchQueries, setSearchQueries] = useState({}); // per-slot search
  const [filterDepartment, setFilterDepartment] = useState("All"); // for Manage Slots table
  const [selectedDeptBookings, setSelectedDeptBookings] = useState("All"); // for unified Bookings card
  const [expandedSlots, setExpandedSlots] = useState({}); // track which slot panels are open

  // canonical department order and display names + color palette for titles
  const departmentOrder = ["College", "SHS", "JHS", "GS"];
  const deptDisplay = {
    College: "College",
    SHS: "Senior High School",
    JHS: "Junior High School",
    GS: "Grade School",
  };
  const deptPalette = {
    College: "from-blue-50 to-blue-100 text-blue-800 bg-gradient-to-r",
    SHS: "from-purple-50 to-purple-100 text-purple-800 bg-gradient-to-r",
    JHS: "from-yellow-50 to-yellow-100 text-yellow-800 bg-gradient-to-r",
    GS: "from-green-50 to-green-100 text-green-800 bg-gradient-to-r",
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const res = await axios.get("/api/slots");
      const data = (res.data || []).map((s) => ({ ...s, bookings: s.bookings || [] }));

      data.forEach((slot) => {
        slot.bookings.sort((a, b) => {
          if (a.department === b.department) {
            const nameA = `${a.first_name || ""} ${a.last_name || ""}`.toLowerCase();
            const nameB = `${b.first_name || ""} ${b.last_name || ""}`.toLowerCase();
            return nameA.localeCompare(nameB);
          }
          return (a.department || "").localeCompare(b.department || "");
        });
      });

      data.sort((a, b) => {
        const da = departmentOrder.indexOf(a.department);
        const db = departmentOrder.indexOf(b.department);
        if (da !== db) return da - db;
        if (a.date !== b.date) return new Date(a.date) - new Date(b.date);
        return a.time.localeCompare(b.time);
      });

      setSlots(data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch slots");
    }
  };

  const addSlot = async () => {
    if (!form.date || !form.time || !form.limit || !form.department) {
      alert("Fill in all fields");
      return;
    }
    try {
      await axios.post("/api/slots", form);
      setForm({ date: "", time: "", limit: 1, department: "" });
      fetchSlots();
    } catch (err) {
      console.error(err);
      alert("Failed to add slot");
    }
  };

  const deleteSlot = async (id) => {
    if (window.confirm("Are you sure you want to delete this slot?")) {
      try {
        await axios.delete(`/api/slots/${id}`);
        fetchSlots();
      } catch (err) {
        console.error(err);
        alert("Failed to delete slot");
      }
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`/api/bookings/${id}/status`, { status });
      fetchSlots();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const handleSearchChange = (slotId, value) => {
    setSearchQueries((s) => ({ ...s, [slotId]: value }));
  };

  const grouped = useMemo(() => {
    const g = {};
    departmentOrder.forEach((d) => (g[d] = []));
    slots.forEach((s) => {
      if (!g[s.department]) g[s.department] = [];
      g[s.department].push(s);
    });
    Object.keys(g).forEach((k) => {
      g[k].sort((a, b) => {
        if (a.date !== b.date) return new Date(a.date) - new Date(b.date);
        return a.time.localeCompare(b.time);
      });
    });
    return g;
  }, [slots]);

  const getFilteredBookings = (slot) => {
    const q = (searchQueries[slot.id] || "").trim().toLowerCase();
    const bookings = slot.bookings || [];
    if (!q) return bookings;
    return bookings.filter((b) => {
      const name = `${b.first_name || ""} ${b.middle_name || ""} ${b.last_name || ""}`.toLowerCase();
      const dept = (b.department || "").toLowerCase();
      const email = (b.email || "").toLowerCase();
      const resume = (b.resume_link || b.resume_file || "").toLowerCase();
      const created = (b.created_at || "").toLowerCase();
      return (
        name.includes(q) || dept.includes(q) || email.includes(q) || resume.includes(q) || created.includes(q)
      );
    });
  };

  const manageSlots = useMemo(() => {
    if (!slots) return [];
    // only show active (non-deleted) slots in Manage Slots table
    const active = slots.filter((s) => !s.deleted_at);
    if (filterDepartment === "All") return active;
    return active.filter((s) => s.department === filterDepartment);
  }, [slots, filterDepartment]);

  const deptCounts = useMemo(() => {
    const c = { All: slots.length };
    departmentOrder.forEach((d) => (c[d] = 0));
    slots.forEach((s) => {
      c[s.department] = (c[s.department] || 0) + 1;
    });
    return c;
  }, [slots]);

  // toggle expand slot panel
  const toggleSlot = (slotId) => {
    setExpandedSlots((s) => ({ ...s, [slotId]: !s[slotId] }));
  };

  return (
    <div className="relative p-4 sm:p-8 min-h-screen text-gray-800 bg-transparent">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white -z-10" />

      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-4xl font-bold flex items-center justify-center gap-2 mb-2 text-gray-800">
          <FiCalendar className="text-green-600" /> Exit Interview Schedule
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
          Manage interview slots and bookings. Manage Slots stays in its own card; all booking-related interactions are grouped inside the unified
          "Bookings" card for faster admin workflows.
        </p>
      </div>

      {/* Manage Slots Card - unchanged logic but small hover/UX polish */}
      <div className="bg-white/80 backdrop-blur-md border border-gray-200 shadow-lg rounded-2xl p-4 sm:p-6 mb-8">
        <h3 className="text-lg sm:text-xl font-semibold mb-3 flex items-center gap-2 text-gray-800">
          <FiPlus /> Manage Slots
        </h3>

        <div className="flex flex-wrap gap-3 mb-4">
          <select
            className="flex-1 min-w-[140px] border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-indigo-300 bg-white"
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
            className="flex-1 min-w-[140px] border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-indigo-300 bg-white"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <input
            type="time"
            className="flex-1 min-w-[120px] border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-indigo-300 bg-white"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
          />
          <input
            type="number"
            min="1"
            className="flex-1 min-w-[80px] border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-indigo-300 bg-white"
            value={form.limit}
            onChange={(e) => setForm({ ...form, limit: e.target.value })}
          />
          <button
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg shadow flex items-center justify-center gap-2 transition"
            onClick={addSlot}
          >
            <FiPlus /> Add Slot
          </button>
        </div>

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setFilterDepartment("All")}
            className={`px-3 py-1 rounded-full border ${filterDepartment === "All" ? "bg-indigo-600 text-white" : "bg-white"}`}
          >
            All ({deptCounts.All})
          </button>

          {departmentOrder.map((d) => (
            <button
              key={d}
              onClick={() => setFilterDepartment(d)}
              className={`px-3 py-1 rounded-full border flex items-center gap-2 ${filterDepartment === d ? "ring-2 ring-offset-1" : "bg-white"}`}
            >
              <span
                className={`w-3 h-3 rounded-full ${
                  d === "College" ? "bg-blue-400" : d === "SHS" ? "bg-purple-400" : d === "JHS" ? "bg-yellow-400" : "bg-green-400"
                }`}
              />
              {deptDisplay[d]} ({deptCounts[d] || 0})
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 rounded-lg">
            <thead className="bg-indigo-50">
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
              {manageSlots.map((slot) => {
                const booked = slot.bookings_count ?? (slot.bookings ? slot.bookings.length : 0);
                const available = slot.limit - booked;

                return (
                  <tr key={slot.id} className="hover:bg-indigo-50 transition text-center transform hover:scale-[1.01]">
                    <td className="p-3 border">{deptDisplay[slot.department] || slot.department}</td>
                    <td className="p-3 border">{slot.date}</td>
                    <td className="p-3 border">{slot.time}</td>
                    <td className="p-3 border">{slot.limit}</td>
                    <td className="p-3 border">{booked}</td>
                    <td className="p-3 border text-indigo-600 font-semibold">{available}</td>
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

              {manageSlots.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-3 text-center text-gray-500">
                    No slots for the selected department.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unified Bookings Card - ALL booking-related UI in this single card
          NOTE: Deleted slots are intentionally still shown here (muted and marked "Deleted") so their booking records remain accessible. */}
      <div className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-2xl rounded-2xl p-4 sm:p-6 mb-12">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg sm:text-2xl font-semibold flex items-center gap-2">
              <FiUsers /> Bookings
            </h3>
            <p className="text-sm text-gray-600 max-w-xl">
              All booking lists, searches, and status actions are grouped here by department and slot for a faster admin workflow. Deleted slots are
              still visible here so you can view their past bookings.
            </p>
          </div>

          {/* Simple admin guide/help */}
          <div className="w-full sm:w-1/3">
            <div className="border rounded-lg p-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FiInfo /> Guide for Admins
                </div>
                <div className="text-xs text-gray-500">Quick tips</div>
              </div>

              <ul className="mt-2 text-xs text-gray-600 list-disc list-inside space-y-1">
                <li>Use the department chips to filter booking lists quickly.</li>
                <li>Click a slot to expand its bookings. Use the search for per-slot filtering.</li>
                <li>Mark attendees as Finished or No Show to update attendance.</li>
                <li>Deleted slots are shown here (muted) so past bookings remain accessible.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Department chips for Bookings card */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setSelectedDeptBookings("All")}
            className={`px-3 py-1 rounded-full border ${selectedDeptBookings === "All" ? "bg-indigo-600 text-white" : "bg-white"}`}
          >
            All ({deptCounts.All})
          </button>

          {departmentOrder.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDeptBookings(d)}
              className={`px-3 py-1 rounded-full border flex items-center gap-2 ${selectedDeptBookings === d ? "ring-2" : "bg-white"}`}
            >
              <span
                className={`w-3 h-3 rounded-full ${
                  d === "College" ? "bg-blue-400" : d === "SHS" ? "bg-purple-400" : d === "JHS" ? "bg-yellow-400" : "bg-green-400"
                }`}
              />
              {deptDisplay[d]} ({deptCounts[d] || 0})
            </button>
          ))}
        </div>

        {/* Slots list for the selected booking department (or all) */}
        <div className="grid gap-4">
          {(selectedDeptBookings === "All"
            ? slots
            : slots.filter((s) => s.department === selectedDeptBookings)
          ).map((slot) => {
            // show deleted slots too, but mark them visually
            const isDeleted = !!slot.deleted_at;
            const booked = slot.bookings_count ?? (slot.bookings ? slot.bookings.length : 0);
            const available = slot.limit - booked;

            return (
              <div
                key={slot.id}
                className={`bg-white shadow-md rounded-2xl border p-4 transition-transform duration-150 ${
                  isDeleted ? "opacity-70 border-dashed bg-red-50" : "hover:shadow-xl hover:-translate-y-1"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-gray-500">{deptDisplay[slot.department] || slot.department} • Slot</div>
                      {isDeleted && (
                        <div className="text-xs text-red-600 font-semibold bg-red-100 px-2 py-0.5 rounded-full">Deleted</div>
                      )}
                    </div>

                    <div className={`text-base sm:text-lg font-semibold ${isDeleted ? "line-through text-gray-500" : "text-gray-900"}`}>
                      {slot.date} • {slot.time}
                    </div>
                    <div className="text-xs text-gray-500">Limit: {slot.limit} • Booked: {booked} • Available: {available}</div>
                    {isDeleted && slot.deleted_at && (
                      <div className="text-xs text-gray-500 mt-1">Deleted on: {new Date(slot.deleted_at).toLocaleString()}</div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-600 mr-2 hidden sm:block">Search in this slot</div>
                    <div className="relative">
                      <input
                        placeholder="Search name, dept, email, resume..."
                        className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 w-64"
                        value={searchQueries[slot.id] || ""}
                        onChange={(e) => handleSearchChange(slot.id, e.target.value)}
                      />
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>

                    <button
                      onClick={() => toggleSlot(slot.id)}
                      className="px-3 py-2 rounded-lg border flex items-center gap-2 text-sm"
                      aria-expanded={!!expandedSlots[slot.id]}
                    >
                      {expandedSlots[slot.id] ? <FiChevronUp /> : <FiChevronDown />} {expandedSlots[slot.id] ? 'Collapse' : 'View'}
                    </button>
                  </div>
                </div>

                {/* Collapsible bookings table */}
                {expandedSlots[slot.id] && (
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-sm border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="p-2 border text-left">Name</th>
                          <th className="p-2 border">Department</th>
                          <th className="p-2 border">Resume</th>
                          <th className="p-2 border">Booked At</th>
                          <th className="p-2 border">Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {getFilteredBookings(slot).length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-3 text-center text-gray-500">
                              No bookings match your search or no bookings yet.
                            </td>
                          </tr>
                        )}

                        {getFilteredBookings(slot).map((b) => (
                          <tr key={b.id} className="hover:bg-gray-50 transition text-center">
                            <td className="p-2 border text-left">{b.first_name} {b.middle_name} {b.last_name}</td>
                            <td className="p-2 border">{deptDisplay[b.department] || b.department}</td>
                            <td className="p-2 border">
                              {b.resume_link ? (
                                <a href={b.resume_link} target="_blank" rel="noreferrer" className="underline">
                                  Link
                                </a>
                              ) : b.resume_file ? (
                                <a href={`/storage/${b.resume_file}`} target="_blank" rel="noreferrer" className="underline">
                                  PDF
                                </a>
                              ) : (
                                "N/A"
                              )}
                            </td>
                            <td className="p-2 border">{new Date(b.created_at).toLocaleString()}</td>
                            <td className="p-2 border">
                              <div className="flex flex-col sm:flex-row justify-center gap-2">
                                <button
                                  onClick={() => updateStatus(b.id, "finished")}
                                  className={`px-3 py-1 rounded-lg text-xs font-medium shadow transition ${
                                    b.status === "finished" ? "bg-green-600 text-white" : "bg-gray-100 hover:bg-green-500 hover:text-white"
                                  }`}
                                >
                                  Finished
                                </button>
                                <button
                                  onClick={() => updateStatus(b.id, "no_show")}
                                  className={`px-3 py-1 rounded-lg text-xs font-medium shadow transition ${
                                    b.status === "no_show" ? "bg-red-500 text-white" : "bg-gray-100 hover:bg-red-500 hover:text-white"
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
                )}
              </div>
            );
          })}

          {/* fallback if no slots in selected department */}
          {((selectedDeptBookings === "All" ? slots : slots.filter((s) => s.department === selectedDeptBookings)) || []).filter(Boolean).length === 0 && (
            <div className="text-sm text-gray-500 px-3">No slots for the selected department.</div>
          )}
        </div>
      </div>
    </div>
  );
}
