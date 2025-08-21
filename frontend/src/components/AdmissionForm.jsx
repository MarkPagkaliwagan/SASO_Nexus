// AdmissionForm.jsx
import React, { useState } from "react";

const AdmissionForm = () => {
  const [applicationType, setApplicationType] = useState("");
  const [transferee, setTransferee] = useState(false);
  const [gradeLevel, setGradeLevel] = useState("");
  const [track, setTrack] = useState("");
  const [consent, setConsent] = useState(false);
  const [formData, setFormData] = useState({
    personalData: {},
    familyBackground: {},
    educationalBackground: {},
    transfereeData: {},
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!consent) {
      alert("Please provide consent to submit.");
      return;
    }
    // Send data to Laravel API
    fetch("/api/admissions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ applicationType, transferee, gradeLevel, track, ...formData }),
    })
      .then((res) => res.json())
      .then((data) => alert("Form submitted successfully!"))
      .catch((err) => console.error(err));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h1 className="text-2xl font-bold mb-4">Admission Form</h1>
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Application Type */}
        <div>
          <label className="block font-semibold mb-1">APPLICATION TYPE</label>
          <select
            value={applicationType}
            onChange={(e) => setApplicationType(e.target.value)}
            className="w-full border rounded p-2"
          >
            <option value="">Select Application Type</option>
            <option value="college">College</option>
            <option value="shs">Senior High School</option>
            <option value="jhs">Junior High School</option>
            <option value="gs">Grade School</option>
          </select>
        </div>

        {/* Conditional Sections */}
        {applicationType === "college" && (
          <div className="p-4 border rounded bg-gray-50">
            <h2 className="font-bold mb-2">College Section</h2>
            <label>Academic Year</label>
            <select className="w-full border rounded p-2 mb-2" name="collegeAcademicYear" onChange={handleChange}>
              <option value="">Select Year</option>
              <option value="2025-2026">2025-2026</option>
              <option value="2026-2027">2026-2027</option>
            </select>
            <label>Semester</label>
            <select className="w-full border rounded p-2 mb-2" name="collegeSemester" onChange={handleChange}>
              <option value="">Select Semester</option>
              <option value="1st">1st</option>
              <option value="2nd">2nd</option>
            </select>
            <label>Transferee</label>
            <select className="w-full border rounded p-2 mb-2" onChange={(e) => setTransferee(e.target.value === "yes")}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
            <label>1st Choice</label>
            <input type="text" className="w-full border rounded p-2 mb-2" name="collegeFirstChoice" onChange={handleChange} />
            <label>2nd Choice</label>
            <input type="text" className="w-full border rounded p-2 mb-2" name="collegeSecondChoice" onChange={handleChange} />
          </div>
        )}

        {applicationType === "shs" && (
          <div className="p-4 border rounded bg-gray-50">
            <h2 className="font-bold mb-2">Senior High School Section</h2>
            <label>Grade Level</label>
            <select className="w-full border rounded p-2 mb-2" onChange={(e) => setGradeLevel(e.target.value)}>
              <option value="">Select Grade Level</option>
              <option value="11">Grade 11</option>
              <option value="12">Grade 12</option>
            </select>
            <label>Transferee</label>
            <select className="w-full border rounded p-2 mb-2" onChange={(e) => setTransferee(e.target.value === "yes")}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
            <label>Track / Strand</label>
            <select className="w-full border rounded p-2 mb-2" onChange={(e) => setTrack(e.target.value)}>
              <optgroup label="GENERAL ACADEMIC TRACK">
                <option value="STEM">STEM</option>
                <option value="HUMSS">HUMSS</option>
                <option value="ABM">ABM</option>
                <option value="GAS">GAS</option>
              </optgroup>
              <optgroup label="TECHNICAL VOCATIONAL AND LIVELIHOOD TRACK">
                <option value="Home Economics">Home Economics</option>
                <option value="ICT">ICT</option>
              </optgroup>
              <optgroup label="ARTS AND DESIGN TRACK">
                <option value="Performing Arts">Performing Arts</option>
                <option value="Art Production">Art Production</option>
              </optgroup>
              <optgroup label="SPORTS TRACK">
                <option value="Sports">Sports</option>
              </optgroup>
            </select>
          </div>
        )}

        {applicationType === "jhs" && (
          <div className="p-4 border rounded bg-gray-50">
            <h2 className="font-bold mb-2">Junior High School Section</h2>
            <label>Grade Level</label>
            <select className="w-full border rounded p-2 mb-2" name="jhsGradeLevel" onChange={handleChange}>
              {[6, 7, 8, 9, 10].map((g) => <option key={g} value={g}>Grade {g}</option>)}
            </select>
            <label>Transferee</label>
            <select className="w-full border rounded p-2 mb-2" onChange={(e) => setTransferee(e.target.value === "yes")}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>
        )}

        {applicationType === "gs" && (
          <div className="p-4 border rounded bg-gray-50">
            <h2 className="font-bold mb-2">Grade School Section</h2>
            <label>Grade Level</label>
            <select className="w-full border rounded p-2 mb-2" name="gsGradeLevel" onChange={handleChange}>
              {["Nursery", "Kinder", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"].map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <label>Transferee</label>
            <select className="w-full border rounded p-2 mb-2" onChange={(e) => setTransferee(e.target.value === "yes")}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>
        )}

        {/* Personal Data */}
        <div className="p-4 border rounded bg-gray-50">
          <h2 className="font-bold mb-2">Personal Data</h2>
          <label>Name (Family, Given, Middle)</label>
          <input type="text" className="w-full border rounded p-2 mb-2" name="name" onChange={handleChange} />
          <label>Gender</label>
          <select className="w-full border rounded p-2 mb-2" name="gender" onChange={handleChange}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <label>Permanent Address</label>
          <textarea className="w-full border rounded p-2 mb-2" name="address" onChange={handleChange}></textarea>
          <label>Tel No.</label>
          <input type="text" className="w-full border rounded p-2 mb-2" name="telNo" onChange={handleChange} />
          <label>Mobile No.</label>
          <input type="text" className="w-full border rounded p-2 mb-2" name="mobileNo" onChange={handleChange} />
          <label>Email</label>
          <input type="email" className="w-full border rounded p-2 mb-2" name="email" onChange={handleChange} />
          <label>Date of Birth</label>
          <input type="date" className="w-full border rounded p-2 mb-2" name="dob" onChange={handleChange} />
          <label>Place of Birth</label>
          <input type="text" className="w-full border rounded p-2 mb-2" name="placeOfBirth" onChange={handleChange} />
          <label>Age</label>
          <input type="number" className="w-full border rounded p-2 mb-2" name="age" onChange={handleChange} />
          <label>Religion</label>
          <input type="text" className="w-full border rounded p-2 mb-2" name="religion" onChange={handleChange} />
          <label>Civil Status</label>
          <input type="text" className="w-full border rounded p-2 mb-2" name="civilStatus" onChange={handleChange} />
          <label>Citizenship</label>
          <input type="text" className="w-full border rounded p-2 mb-2" name="citizenship" onChange={handleChange} />
          <label>Residence</label>
          <select className="w-full border rounded p-2 mb-2" name="residence" onChange={handleChange}>
            <option value="">Select</option>
            <option value="With Parents">With Parents</option>
            <option value="With Relatives">With Relatives</option>
            <option value="Boarding">Boarding</option>
          </select>
        </div>

        {/* Consent */}
        <div>
          <label className="inline-flex items-center">
            <input type="checkbox" className="mr-2" checked={consent} onChange={() => setConsent(!consent)} />
            I have read and fully understood the above declaration and give my consent.
          </label>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default AdmissionForm;
