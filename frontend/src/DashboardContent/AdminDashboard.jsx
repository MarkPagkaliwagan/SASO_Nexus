import React, { useState } from "react";
import axios from "axios";

const generateAcademicYears = (start = 2010, end = 2030) => {
  const years = [];
  for (let y = start; y <= end; y++) {
    years.push(`${y}-${y + 1}`);
  }
  return years;
};

const academicYears = generateAcademicYears();

const departments = [
  "Guidance Office",
  "Student Formation and Development Unit (SFDU)",
  "School Clinic",
  "Campus Ministry",
  "Sports Development Unit",
];

export default function AdminDashboard() {
  const [academicYear, setAcademicYear] = useState("");
  const [department, setDepartment] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!academicYear || !department || !eventDesc) {
      return alert("Please fill in all required fields!");
    }

    const formData = new FormData();
    formData.append("academic_year", academicYear);
    formData.append("department", department);
    formData.append("description", eventDesc);
    if (image) formData.append("image", image);

    try {
      setLoading(true);
      const response = await axios.post(
        "http://127.0.0.1:8000/api/events",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert(response.data.message);

      // Reset form
      setAcademicYear("");
      setDepartment("");
      setEventDesc("");
      setImage(null);
    } catch (error) {
      console.error(error);
      alert("Failed to post event!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-2">
      {/* Full-width Card */}
      <div className="w-full bg-white rounded-3xl shadow-xl border border-gray-200 p-4 flex flex-wrap gap-4">

        {/* Academic Year */}
        <select
          className="flex-1 min-w-[150px] p-3 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500"
          value={academicYear}
          onChange={(e) => setAcademicYear(e.target.value)}
        >
          <option value="">Select Academic Year</option>
          {academicYears.map((year, idx) => (
            <option key={idx} value={year}>{year}</option>
          ))}
        </select>

        {/* Department */}
        <select
          className="flex-1 min-w-[180px] p-3 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          <option value="">Select Department</option>
          {departments.map((dept, idx) => (
            <option key={idx} value={dept}>{dept}</option>
          ))}
        </select>

        {/* Event Description */}
        <input
          type="text"
          placeholder="Describe the event..."
          className="flex-2 min-w-[250px] flex-grow p-3 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500"
          value={eventDesc}
          onChange={(e) => setEventDesc(e.target.value)}
        />

        {/* Upload Image */}
        <input
          type="file"
          accept="image/*"
          className="flex-1 min-w-[150px] p-2 border border-gray-300 rounded-xl text-sm md:text-lg"
          onChange={(e) => setImage(e.target.files[0])}
        />

        {/* Post Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-none bg-blue-600 text-white py-3 px-6 rounded-xl text-lg font-semibold hover:bg-blue-700 transition duration-200 shadow-md disabled:opacity-50"
        >
          {loading ? "Posting..." : "POST"}
        </button>

      </div>
    </div>
  );
}
