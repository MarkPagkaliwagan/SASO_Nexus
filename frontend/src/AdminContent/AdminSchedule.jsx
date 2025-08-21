import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminSchedule = () => {
  const [dateTime, setDateTime] = useState("");
  const [limit, setLimit] = useState("");
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    const res = await axios.get("/api/schedules");
    setSchedules(res.data);
  };

  const addSchedule = async () => {
    if (!dateTime || !limit) return alert("All fields are required");

    const res = await axios.post("/api/schedules", { date_time: dateTime, limit });
    setSchedules([...schedules, res.data]);
    setDateTime("");
    setLimit("");
  };

  const deleteSchedule = async (id) => {
    await axios.delete(`/api/schedules/${id}`);
    setSchedules(schedules.filter((s) => s.id !== id));
  };

  return (
    <div className="max-w-xl0 mx-auto p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Admission Schedule</h2>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="datetime-local"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
          className="flex-1 p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Limit"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          className="w-24 p-2 border rounded"
        />
        <button
          onClick={addSchedule}
          className="bg-blue-500 text-white px-4 rounded hover:bg-blue-600 transition"
        >
          Add Schedule
        </button>
      </div>

      <div>
        {schedules.map((s) => (
          <div key={s.id} className="flex justify-between items-center p-2 border-b">
            <span>{new Date(s.date_time).toLocaleString()} (Limit: {s.limit})</span>
            <button
              onClick={() => deleteSchedule(s.id)}
              className="text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSchedule;
