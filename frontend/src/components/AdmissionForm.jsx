import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiUpload,
  FiCheckSquare,
  FiTrash2,
  FiChevronDown,
} from "react-icons/fi";
import SPCLogo from "../images/SPC.png"; // place SPC.png in src/images/

// AdmissionForm.jsx - Frontend only, TailwindCSS + Framer Motion + React Icons
// Default export React component

export default function AdmissionForm() {
  const [errors, setErrors] = useState([]);
  const [applicationType, setApplicationType] = useState("");
  const [isTransferee, setIsTransferee] = useState(false);
  const [formData, setFormData] = useState({
    // common
    nameFamily: "",
    nameGiven: "",
    nameMiddle: "",
    gender: "",
    address: "",
    street: "",
    barangay: "",
    city: "",
    zip: "",
    tel: "",
    mobile: "",
    email: "",
    dob: "",
    placeOfBirth: "",
    age: "",
    religion: "",
    civilStatus: "",
    citizenship: "",
    residence: "",

    // transferee fields
    transferee_school_name: "",
    transferee_course: "",
    transferee_major: "",
    transferee_school_address: "",
    transferee_school_year_attended: "",

    // college specific
    academicYear: "",
    semester: "",
    collegeChoices: "",
    firstChoice: "",
    secondChoice: "",

    // shs specific
    shsGradeLevel: "",
    shsStrand: "",

    // jhs/gs
    gradeLevel: "",

    // family
    father_name: "",
    father_address: "",
    father_tel: "",
    father_citizenship: "",
    father_occupation: "",
    father_office_address: "",
    father_office_tel: "",
    father_education: "",
    father_last_school: "",

    mother_name: "",
    mother_address: "",
    mother_tel: "",
    mother_citizenship: "",
    mother_occupation: "",
    mother_office_address: "",
    mother_office_tel: "",
    mother_education: "",
    mother_last_school: "",

    is_parent_alumnus: "",
    parent_alumni_year: "",
    parent_alumni_level_course: "",

    // education
    lrn: "",
    last_school_name: "",
    last_school_address: "",
    track: "",
    strand: "",
    school_year_attended: "",
    date_of_graduation: "",
    honors: "",
    memberships: "",

    // schedule
    schedule_id: "",

    declaration: false,
  });

  // Function to clear fields specific to application type
  const clearTypeSpecificFields = () => {
    setFormData((prev) => ({
      ...prev,
      // College-specific
      academicYear: "",
      semester: "",
      collegeChoices: "",
      firstChoice: "",
      secondChoice: "",

      // Senior High School-specific
      shsGradeLevel: "",
      shsStrand: "",

      // Junior High School / Grade School-specific
      gradeLevel: "",

      // Transferee fields (optional)
      transferee_school_name: "",
      transferee_course: "",
      transferee_major: "",
      transferee_school_address: "",
      transferee_school_year_attended: "",
    }));

    // Optional: also reset transferee checkbox when switching away
    setIsTransferee(false);
  };

  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    fetch("/api/schedules")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setSchedules(data);
      })
      .catch(() => {
        setSchedules([
          { id: 1, date: "2025-09-01", time: "09:00", limit: 10, booked: 0 },
          { id: 2, date: "2025-09-02", time: "13:00", limit: 8, booked: 2 },
        ]);
      });
  }, []);

  useEffect(() => {
    if (!isTransferee) {
      setFormData((s) => ({
        ...s,
        transferee_school_name: "",
        transferee_course: "",
        transferee_major: "",
        transferee_school_address: "",
        transferee_school_year_attended: "",
      }));
    }
  }, [isTransferee]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((s) => ({
      ...s,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePhotoChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setPhotoFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(f);
  };

  const clearForm = () => {
    setApplicationType("");
    setIsTransferee(false);
    setFormData((prev) =>
      Object.keys(prev).reduce((acc, k) => ({ ...acc, [k]: "" }), {})
    );
    setPhotoPreview(null);
    setPhotoFile(null);
  };

  const validateForm = () => {
    if (!applicationType) {
      alert("Please select an Application Type.");
      return false;
    }

    // Common required fields
    const requiredCommon = [
      "nameFamily",
      "nameGiven",
      "nameMiddle",
      "gender",
      "address",
      "barangay",
      "city",
      "zip",
      "mobile",
      "email",
      "dob",
      "placeOfBirth",
      "age",
      "religion",
      "civilStatus",
      "citizenship",
      "residence",
      "tel",
    ];

    // Application type specific
    const typeFields = {
      College: ["academicYear", "semester", "firstChoice", "secondChoice"],
      "Senior High School": ["academicYear", "shsGradeLevel", "shsStrand"],
      "Junior High School": ["academicYear", "gradeLevel"],
      "Grade School": ["academicYear", "gradeLevel"],
    };

    // Family fields
    let familyFields = [
      "father_name",
      "father_address",
      "father_tel",
      "father_citizenship",
      "father_occupation",
      "father_office_address",
      "father_office_tel",
      "father_education",
      "father_last_school",
      "mother_name",
      "mother_address",
      "mother_tel",
      "mother_citizenship",
      "mother_occupation",
      "mother_office_address",
      "mother_office_tel",
      "mother_education",
      "mother_last_school",
    ];

    // Parent alumni conditional
    if (formData.is_parent_alumnus === "yes") {
      familyFields.push("parent_alumni_year", "parent_alumni_level_course");
    }

    // Education fields
    const educationFields = [
      "lrn",
      "last_school_name",
      "last_school_address",
      "track",
      "strand",
      "school_year_attended",
      "date_of_graduation",
      "honors",
    ];

    // Transferee conditional
    const transfereeFields = isTransferee
      ? [
          "transferee_school_name",
          "transferee_course",
          "transferee_major",
          "transferee_school_address",
          "transferee_school_year_attended",
        ]
      : [];

    // Schedule & declaration
    const otherFields = ["schedule_id", "declaration"];

    // Merge all required fields
    const requiredFields = [
      ...requiredCommon,
      ...(typeFields[applicationType] || []),
      ...familyFields,
      ...educationFields,
      ...transfereeFields,
      ...otherFields,
    ];

    // Check empty fields
    const emptyFields = requiredFields.filter((field) => {
      const value = formData[field];
      if (typeof value === "boolean") return !value;
      return !value || value === "";
    });

    // Add photo check
    if (!photoFile) {
      emptyFields.push("photo");
    }

    // Save empty fields in state to highlight them
    setErrors(emptyFields);

    if (emptyFields.length > 0) {
      alert("Please fill all required fields before submitting.");
      console.log("Empty fields:", emptyFields);
      return false;
    }

    // Clear errors if everything is filled
    setErrors([]);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Use the validateForm function
    if (!validateForm()) return; // <- stops submission if validation fails

    const payload = new FormData();
    payload.append("applicationType", applicationType);
    Object.keys(formData).forEach((k) => payload.append(k, formData[k] || ""));
    if (photoFile) payload.append("photo", photoFile);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        body: payload,
      });
      const data = await res.json();
      if (res.ok) {
        alert("Application submitted successfully!");
        clearForm();
      } else {
        alert("Error: " + (data.message || "Failed to submit."));
      }
    } catch (err) {
      alert("Network error: " + err.message);
    }
  };

  const collegeOptions = (
    <>
      <optgroup label="College of Arts and Sciences">
        <option value="BA Communication">BA COMMUNICATION</option>
        <option value="BS Psychology">BS PSYCHOLOGY</option>
        <option value="AB Political Science">AB POLITICAL SCIENCE</option>
        <option value="AB English">AB ENGLISH</option>
      </optgroup>
      <optgroup label="College of Education">
        <option value="BECed">
          Bachelor of Early Childhood Education (BECed)
        </option>
        <option value="BEED">
          Bachelor of Elementary Education (BEED) - Generalist
        </option>
        <option value="CTP-MAPEH">
          Certificate in Teaching Program - MAPEH
        </option>
        <option value="CTP-PE">Certificate in Teaching Program - PE</option>
        <option value="BSED-English">BSED - English</option>
        <option value="BSED-Math">BSED - Mathematics</option>
        <option value="BSED-Filipino">BSED - Filipino</option>
        <option value="BSED-SocialStudies">BSED - Social Studies</option>
        <option value="BSED-Science">BSED - Science</option>
        <option value="BSED-Values">BSED - Values Education</option>
        <option value="BTLE-HomeEc">BTLE - Home Economics</option>
        <option value="BTLE-ICT">BTLE - ICT</option>
        <option value="BS Mathematics">BS Mathematics</option>
        <option value="BPED">BPED</option>
        <option value="BSNED">BSNED</option>
      </optgroup>
      <optgroup label="College of Physical Therapy">
        <option value="BSPT">
          Bachelor of Science in Physical Therapy (BSPT)
        </option>
      </optgroup>
      <optgroup label="College of Radiologic Technology">
        <option value="BSRT">
          Bachelor of Science in Radiologic Technology (BSRT)
        </option>
        <option value="ARadTech">
          Associate in Radiologic Technology (ARadTech)
        </option>
      </optgroup>
      <optgroup label="College of Business and Management">
        <option value="BSBA-HRM">BSBA - HRM</option>
        <option value="BSBA-Marketing">BSBA - Marketing</option>
        <option value="BSBA-FinTech">BSBA - Financial Technology</option>
        <option value="BS Entrep">BS Entrep</option>
        <option value="BS in PubAd">BS in Public Administration</option>
        <option value="BSREM">BSREM</option>
        <option value="BSHM">BSHM</option>
        <option value="AHM">AHM</option>
      </optgroup>
      <optgroup label="College of Accountancy">
        <option value="BSA">BSA</option>
      </optgroup>
      <optgroup label="College of Computer Science">
        <option value="BSCS">BSCS</option>
        <option value="BSIT">BSIT</option>
        <option value="ACT">ACT</option>
      </optgroup>
      <optgroup label="College of Nursing">
        <option value="BSN">BSN</option>
      </optgroup>
    </>
  );
  return (
    <div className="min-h-screen p-6 flex items-start justify-center">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl bg-white shadow-2xl rounded-2xl p-6 md:p-10"
      >
        <header className="flex flex-col items-center text-center mb-6 md:flex-row md:items-center md:justify-center md:gap-6">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img
              src={SPCLogo}
              alt="SPC Logo"
              className="w-24 h-24 md:w-36 md:h-36 object-contain mx-auto md:mx-0"
            />
          </div>

          {/* Text */}
          <div>
            <h1 className="text-2xl md:text-4xl font-bold">
              San Pablo Colleges
            </h1>
            <p className="text-sm md:text-lg font-medium">
              Hermanos Belen St. San Pablo City
            </p>
            <p className="text-sm md:text-lg font-medium">
              Tel. No. (049) 562-4688, 562-8139-40
            </p>
            <p className="text-sm md:text-lg font-medium">
              Website: www.sanpablocolleges.edu.ph
            </p>

            <h2 className="text-xl md:text-3xl font-semibold mt-2">
              Application For Admission
            </h2>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Application Type */}
          <motion.section
            layout
            initial={{ borderRadius: 12 }}
            className="section-card"
          >
            {/* Title + instructions */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <h2 className="text-lg font-semibold">APPLICATION TYPE</h2>
              <div className="text-sm text-slate-500 md:text-right">
                Please fill all required fields. Write N/A for items that do not
                apply. Select a level to show its fields.
              </div>
            </div>

            {/* Buttons grid */}
            <div className="mt-4 fields-2 md:fields-4">
              {[
                { key: "College", label: "College" },
                { key: "Senior High School", label: "Senior high school" },
                { key: "Junior High School", label: "Junior high school" },
                { key: "Grade School", label: "Grade school" },
              ].map((a) => (
                <button
                  type="button"
                  key={a.key}
                  onClick={() => {
                    setApplicationType(a.key);
                    clearTypeSpecificFields();
                  }}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition transform hover:-translate-y-1 hover:shadow-md ${
                    applicationType === a.key
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent"
                      : "bg-white text-slate-700"
                  }`}
                >
                  <FiChevronDown className="w-5 h-5" />
                  <span className="font-medium">{a.label}</span>
                </button>
              ))}
            </div>
          </motion.section>

          {/* Dynamic sections */}
          {applicationType === "College" && (
            <motion.section
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 border rounded-xl"
            >
              <h3 className="font-semibold mb-3">
                This is an application for: College Level
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm">Academic Year</label>
                  <select
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleChange}
                    className={`mt-1 w-full border rounded p-2 ${
                      errors.includes("academicYear")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Academic Year</option>
                    {Array.from({ length: 5 }).map((_, i) => {
                      const start = new Date().getFullYear() + i;
                      const end = start + 1;
                      return (
                        <option key={start} value={`${start}-${end}`}>
                          {start}-{end}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm">Semester</label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    className={`mt-1 w-full border rounded p-2 ${
                      errors.includes("semester")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Semester</option>
                    <option>First Semester</option>
                    <option>Second Semester</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm">
                    Choices (First / Second)
                  </label>
                  <div className="mt-1 flex gap-2">
                    <select
                      name="firstChoice"
                      value={formData.firstChoice}
                      onChange={handleChange}
                      className={`w-1/2 border rounded p-2 ${
                        errors.includes("firstChoice")
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">1st Choice</option>
                      {collegeOptions}
                    </select>
                    <select
                      name="secondChoice"
                      value={formData.secondChoice}
                      onChange={handleChange}
                      className={`w-1/2 border rounded p-2 ${
                        errors.includes("secondChoice")
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">2nd Choice</option>
                      {collegeOptions}
                    </select>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {applicationType === "Senior High School" && (
            <motion.section
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 border rounded-xl"
            >
              <h3 className="font-semibold mb-3">
                This is an application for: Senior High School Level
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm">Academic Year</label>
                  <select
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleChange}
                    className={`mt-1 w-full border rounded p-2 ${
                      errors.includes("academicYear")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Academic Year</option>
                    {Array.from({ length: 5 }).map((_, i) => {
                      const start = new Date().getFullYear() + i;
                      const end = start + 1;
                      return (
                        <option key={start} value={`${start}-${end}`}>
                          {start}-{end}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm">Grade level</label>
                  <select
                    name="shsGradeLevel"
                    value={formData.shsGradeLevel}
                    onChange={handleChange}
                    className={`mt-1 w-full border rounded p-2 ${
                      errors.includes("shsGradeLevel")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Grade</option>
                    <option>Grade 11</option>
                    <option>Grade 12</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm">Strand</label>
                  <select
                    name="shsStrand"
                    value={formData.shsStrand}
                    onChange={handleChange}
                    className={`mt-1 w-full border rounded p-2 ${
                      errors.includes("shsStrand")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Strand</option>
                    <optgroup label="GENERAL ACADEMIC TRACK">
                      <option>STEM</option>
                      <option>HUMSS</option>
                      <option>ABM</option>
                      <option>GAS</option>
                    </optgroup>
                    <optgroup label="TVL">
                      <option>Home Economics (Caregiving, Housekeeping)</option>
                      <option>ICT</option>
                    </optgroup>
                    <optgroup label="ARTS">
                      <option>Performing Arts</option>
                      <option>Art Production</option>
                    </optgroup>
                    <optgroup label="SPORTS">
                      <option>Sports Track</option>
                    </optgroup>
                  </select>
                </div>
              </div>
            </motion.section>
          )}

          {applicationType === "Junior High School" && (
            <motion.section
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 border rounded-xl"
            >
              <h3 className="font-semibold mb-3">
                This is an application for: Junior High School Level
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm">Academic Year</label>
                  <select
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleChange}
                    className={`mt-1 w-full border rounded p-2 ${
                      errors.includes("academicYear")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Academic Year</option>
                    {Array.from({ length: 5 }).map((_, i) => {
                      const start = new Date().getFullYear() + i;
                      const end = start + 1;
                      return (
                        <option key={start} value={`${start}-${end}`}>
                          {start}-{end}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm">Grade level</label>
                  <select
                    name="gradeLevel"
                    value={formData.gradeLevel}
                    onChange={handleChange}
                    className={`mt-1 w-full border rounded p-2 ${
                      errors.includes("gradeLevel")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Grade</option>
                    <option>Grade 6</option>
                    <option>Grade 7</option>
                    <option>Grade 8</option>
                    <option>Grade 9</option>
                    <option>Grade 10</option>
                  </select>
                </div>
              </div>
            </motion.section>
          )}

          {applicationType === "Grade School" && (
            <motion.section
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 border rounded-xl"
            >
              <h3 className="font-semibold mb-3">
                This is an application for: Grade School Level
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm">Academic Year</label>
                  <select
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleChange}
                    className={`mt-1 w-full border rounded p-2 ${
                      errors.includes("academicYear")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Academic Year</option>
                    {Array.from({ length: 5 }).map((_, i) => {
                      const start = new Date().getFullYear() + i;
                      const end = start + 1;
                      return (
                        <option key={start} value={`${start}-${end}`}>
                          {start}-{end}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm">Grade level</label>
                  <select
                    name="gradeLevel"
                    value={formData.gradeLevel}
                    onChange={handleChange}
                    className={`mt-1 w-full border rounded p-2 ${
                      errors.includes("gradeLevel")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Grade</option>
                    <option>Nursery</option>
                    <option>Kinder</option>
                    <option>Grade 1</option>
                    <option>Grade 2</option>
                    <option>Grade 3</option>
                    <option>Grade 4</option>
                    <option>Grade 5</option>
                    <option>Grade 6</option>
                  </select>
                </div>
              </div>
            </motion.section>
          )}

          {/* Directions + 2x2 photo preview */}
          <motion.section layout className="p-4 border rounded-xl bg-slate-50">
            <h3 className="font-semibold">DIRECTIONS</h3>
            <p className="text-sm text-slate-600">
              Fill in all necessary information as accurately as possible. Write
              N/A for items that do not apply to you.
            </p>

            <div className="mt-4 md:flex md:items-start md:gap-6">
              <div className="w-40 h-48 rounded-lg border-2 border-dashed flex flex-col items-center justify-center p-2 bg-white">
                <div className="w-28 h-36 border rounded overflow-hidden flex items-center justify-center">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="2x2 preview"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="text-xs text-slate-400 text-center p-2">
                      2x2 Preview
                      <br />
                      (white background)
                    </div>
                  )}
                </div>
                <label className="mt-3 flex items-center gap-2 text-sm cursor-pointer hover:text-indigo-600">
                  <FiUpload />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className={`hidden ${
                      errors.includes("declaration")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  Upload 2x2
                </label>
              </div>

              <div className="mt-4 md:mt-0 flex-1">
                <h4 className="font-medium">PERSONAL DATA</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                  <div>
                    <label className="block text-sm">Family Name</label>
                    <input
                      name="nameFamily"
                      value={formData.nameFamily}
                      onChange={handleChange}
                      className={`mt-1 w-full border rounded p-2 ${
                        errors.includes("nameFamily")
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm">Given Name</label>
                    <input
                      name="nameGiven"
                      value={formData.nameGiven}
                      onChange={handleChange}
                      className={`mt-1 w-full border rounded p-2 ${
                        errors.includes("nameGiven")
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm">Middle Name</label>
                    <input
                      name="nameMiddle"
                      value={formData.nameMiddle}
                      onChange={handleChange}
                      className={`mt-1 w-full border rounded p-2 ${
                        errors.includes("nameMiddle")
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className={`mt-1 w-full border rounded p-2 ${
                        errors.includes("gender")
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Select</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Prefer not to say</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm">Permanent Address</label>
                    <input
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className={`mt-1 w-full border rounded p-2 ${
                        errors.includes("address")
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="House no., Street"
                    />
                  </div>

                  <div>
                    <label className="block text-sm">Barangay</label>
                    <input
                      name="barangay"
                      value={formData.barangay}
                      onChange={handleChange}
                      className={`mt-1 w-full border rounded p-2 ${
                        errors.includes("barangay")
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm">
                      City/Municipality/Province
                    </label>
                    <input
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`mt-1 w-full border rounded p-2 ${
                        errors.includes("city")
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm">Zip code</label>
                    <input
                      name="zip"
                      value={formData.zip}
                      onChange={handleChange}
                      className={`mt-1 w-full border rounded p-2 ${
                        errors.includes("zip")
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm">Tel. No.</label>
                    <input
                      name="tel"
                      value={formData.tel}
                      onChange={handleChange}
                      className={`mt-1 w-full border rounded p-2 ${
                        errors.includes("tel")
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm">Mobile No.</label>
                    <input
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      className={`mt-1 w-full border rounded p-2 ${
                        errors.includes("mobile")
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm">E-mail Address</label>
                    <input
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`mt-1 w-full border rounded p-2 ${
                        errors.includes("email")
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm">Date of Birth</label>
                    <input
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      type="date"
                      className={`mt-1 w-full border rounded p-2 ${
                        errors.includes("dob")
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm">Place of Birth</label>
                    <input
                      name="placeOfBirth"
                      value={formData.placeOfBirth}
                      onChange={handleChange}
                      className={`mt-1 w-full border rounded p-2 ${
                        errors.includes("placeOfBirth")
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm">Age</label>
                    <input
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      type="number"
                      className={`mt-1 w-full border rounded p-2 ${
                        errors.includes("age")
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm">Religion</label>
                    <select
                      name="religion"
                      value={formData.religion}
                      onChange={handleChange}
                      className={`mt-1 w-full border rounded p-2 ${
                        errors.includes("religion") ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Religion</option>
                      <option value="Roman Catholic">Roman Catholic</option>
                      <option value="Iglesia ni Cristo">Iglesia ni Cristo</option>
                      <option value="Protestant">Protestant</option>
                      <option value="Islam">Islam</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>


                  <div>
                    <label className="block text-sm">Civil Status</label>
                    <select
                      name="civilStatus"
                      value={formData.civilStatus}
                      onChange={handleChange}
                      className={`mt-1 w-full border rounded p-2 ${
                        errors.includes("civilStatus") ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Civil Status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Separated">Separated</option>
                      <option value="Divorced">Divorced</option>
                      {/* Pwede pang magdagdag ng iba pang options */}
                    </select>
                  </div>


                  <div>
                  <label className="block text-sm">Citizenship</label>
                  <select
                    name="citizenship"
                    value={formData.citizenship}
                    onChange={handleChange}
                    className={`mt-1 w-full border rounded p-2 ${
                      errors.includes("citizenship") ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Citizenship</option>
                    <option value="Filipino">Filipino</option>
                    <option value="Foreign">Foreign</option>
                    {/* Pwede kang magdagdag pa ng iba pang options dito */}
                  </select>
                </div>


                  <div>
                    <label className="block text-sm">Residence</label>
                    <select
                      name="residence"
                      value={formData.residence}
                      onChange={handleChange}
                      className={`mt-1 w-full border rounded p-2 ${
                        errors.includes("residence")
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Select</option>
                      <option>With Parents</option>
                      <option>With Relatives</option>
                      <option>Boarding</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Family Background */}
          <motion.section layout className="p-4 border rounded-xl">
            <h3 className="font-semibold mb-3">FAMILY BACKGROUND</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Father Section */}
              <div>
                <h4 className="font-medium">FATHER</h4>
                <div className="mt-2 space-y-2">
                  <input
                    name="father_name"
                    value={formData.father_name}
                    onChange={handleChange}
                    placeholder="Name"
                    className={`w-full border rounded p-2 ${
                      errors.includes("father_name")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <input
                    name="father_address"
                    value={formData.father_address}
                    onChange={handleChange}
                    placeholder="Home Address"
                    className={`w-full border rounded p-2 ${
                      errors.includes("father_address")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <input
                    name="father_tel"
                    value={formData.father_tel}
                    onChange={handleChange}
                    placeholder="Tel/Mobile"
                    className={`w-full border rounded p-2 ${
                      errors.includes("father_tel")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <input
                    name="father_citizenship"
                    value={formData.father_citizenship}
                    onChange={handleChange}
                    placeholder="Citizenship"
                    className={`w-full border rounded p-2 ${
                      errors.includes("father_citizenship")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <input
                    name="father_occupation"
                    value={formData.father_occupation}
                    onChange={handleChange}
                    placeholder="Occupation"
                    className={`w-full border rounded p-2 ${
                      errors.includes("father_occupation")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <input
                    name="father_office_address"
                    value={formData.father_office_address}
                    onChange={handleChange}
                    placeholder="Office Address"
                    className={`w-full border rounded p-2 ${
                      errors.includes("father_office_address")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <input
                    name="father_office_tel"
                    value={formData.father_office_tel}
                    onChange={handleChange}
                    placeholder="Office Tel"
                    className={`w-full border rounded p-2 ${
                      errors.includes("father_office_tel")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <input
                    name="father_education"
                    value={formData.father_education}
                    onChange={handleChange}
                    placeholder="Educational Attainment"
                    className={`w-full border rounded p-2 ${
                      errors.includes("father_education")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <input
                    name="father_last_school"
                    value={formData.father_last_school}
                    onChange={handleChange}
                    placeholder="Last School Attended"
                    className={`w-full border rounded p-2 ${
                      errors.includes("father_last_school")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                </div>

                {/* Question under FATHER */}
                <div className="mt-3">
                  <p className="font-medium text-sm mb-1">
                    Is your father or mother an alumnus of San Pablo Colleges?
                  </p>
                  <div className="flex gap-4 justify-start">
                    <label className="flex items-center gap-1">
                      <input
                        type="radio"
                        name="is_parent_alumnus"
                        value="yes"
                        checked={formData.is_parent_alumnus === "yes"}
                        onChange={handleChange}
                      />
                      Yes
                    </label>
                    <label className="flex items-center gap-1">
                      <input
                        type="radio"
                        name="is_parent_alumnus"
                        value="no"
                        checked={formData.is_parent_alumnus === "no"}
                        onChange={handleChange}
                      />
                      No
                    </label>
                  </div>
                </div>
              </div>

              {/* Mother Section */}
              <div>
                <h4 className="font-medium">MOTHER</h4>
                <div className="mt-2 space-y-2">
                  <input
                    name="mother_name"
                    value={formData.mother_name}
                    onChange={handleChange}
                    placeholder="Name"
                    className={`w-full border rounded p-2 ${
                      errors.includes("mother_name")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <input
                    name="mother_address"
                    value={formData.mother_address}
                    onChange={handleChange}
                    placeholder="Home Address"
                    className={`w-full border rounded p-2 ${
                      errors.includes("mother_address")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <input
                    name="mother_tel"
                    value={formData.mother_tel}
                    onChange={handleChange}
                    placeholder="Tel/Mobile"
                    className={`w-full border rounded p-2 ${
                      errors.includes("mother_tel")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <input
                    name="mother_citizenship"
                    value={formData.mother_citizenship}
                    onChange={handleChange}
                    placeholder="Citizenship"
                    className={`w-full border rounded p-2 ${
                      errors.includes("mother_citizenship")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <input
                    name="mother_occupation"
                    value={formData.mother_occupation}
                    onChange={handleChange}
                    placeholder="Occupation"
                    className={`w-full border rounded p-2 ${
                      errors.includes("mother_occupation")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <input
                    name="mother_office_address"
                    value={formData.mother_office_address}
                    onChange={handleChange}
                    placeholder="Office Address"
                    className={`w-full border rounded p-2 ${
                      errors.includes("mother_office_address")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <input
                    name="mother_office_tel"
                    value={formData.mother_office_tel}
                    onChange={handleChange}
                    placeholder="Office Tel"
                    className={`w-full border rounded p-2 ${
                      errors.includes("mother_office_tel")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <input
                    name="mother_education"
                    value={formData.mother_education}
                    onChange={handleChange}
                    placeholder="Educational Attainment"
                    className={`w-full border rounded p-2 ${
                      errors.includes("mother_education")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <input
                    name="mother_last_school"
                    value={formData.mother_last_school}
                    onChange={handleChange}
                    placeholder="Last School Attended"
                    className={`w-full border rounded p-2 ${
                      errors.includes("mother_last_school")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                </div>

                {/* Show extra inputs under MOTHER if YES */}
                {formData.is_parent_alumnus === "yes" && (
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input
                      name="parent_alumni_year"
                      value={formData.parent_alumni_year}
                      onChange={handleChange}
                      placeholder="School year graduated"
                      className={`w-full border rounded p-2 ${
                        errors.includes("parent_alumni_year")
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    <input
                      name="parent_alumni_level_course"
                      value={formData.parent_alumni_level_course}
                      onChange={handleChange}
                      placeholder="Level/Course"
                      className={`w-full border rounded p-2 ${
                        errors.includes("parent_alumni_level_course")
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.section>

          {/* Educational Background */}
          <motion.section layout className="p-4 border rounded-xl">
            <h3 className="font-semibold mb-3">EDUCATIONAL BACKGROUND</h3>

            {/* Transferee toggle */}
            <label className="flex items-center gap-2 mb-4 text-sm font-medium">
              <input
                type="checkbox"
                checked={isTransferee}
                onChange={(e) => setIsTransferee(e.target.checked)}
                className="w-4 h-4"
              />
              <span>Are you a transferee?</span>
            </label>

            {/* Transferee Fields */}
            {isTransferee && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2 text-slate-600">
                  Transferee Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    name="transferee_school_name"
                    value={formData.transferee_school_name}
                    onChange={handleChange}
                    placeholder="Name of School Last Attended"
                    className={`w-full border rounded p-2 ${
                      errors.includes("transferee_school_name")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <input
                    name="transferee_course"
                    value={formData.transferee_course}
                    onChange={handleChange}
                    placeholder="Course/Degree"
                    className={`w-full border rounded p-2 ${
                      errors.includes("transferee_course")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <input
                    name="transferee_major"
                    value={formData.transferee_major}
                    onChange={handleChange}
                    placeholder="Major"
                    className={`w-full border rounded p-2 ${
                      errors.includes("transferee_major")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <input
                    name="transferee_school_address"
                    value={formData.transferee_school_address}
                    onChange={handleChange}
                    placeholder="School Address"
                    className={`w-full border rounded p-2 ${
                      errors.includes("transferee_school_address")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <input
                    name="transferee_school_year_attended"
                    value={formData.transferee_school_year_attended}
                    onChange={handleChange}
                    placeholder="School Year Attended"
                    className={`w-full border rounded p-2 ${
                      errors.includes("transferee_school_year_attended")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                </div>
              </div>
            )}

            {/* General Educational Background */}
            <h4 className="text-sm font-semibold mb-2 text-slate-600">
              General Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
              <input
                name="lrn"
                value={formData.lrn}
                onChange={handleChange}
                placeholder="LRN No."
                className={`w-full border rounded p-2 ${
                  errors.includes("last_school_name")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              <input
                name="last_school_name"
                value={formData.last_school_name}
                onChange={handleChange}
                placeholder="Name of School Last Attended"
                className={`w-full border rounded p-2 ${
                  errors.includes("last_school_name")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              <input
                name="last_school_address"
                value={formData.last_school_address}
                onChange={handleChange}
                placeholder="School Address"
                className={`w-full border rounded p-2 ${
                  errors.includes("last_school_address")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <input
                name="track"
                value={formData.track}
                onChange={handleChange}
                placeholder="Track"
                className={`w-full border rounded p-2 ${
                  errors.includes("track")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              <input
                name="strand"
                value={formData.strand}
                onChange={handleChange}
                placeholder="Strand"
                className={`w-full border rounded p-2 ${
                  errors.includes("strand")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              <input
                name="school_year_attended"
                value={formData.school_year_attended}
                onChange={handleChange}
                placeholder="School Year Attended"
                className={`w-full border rounded p-2 ${
                  errors.includes("school_year_attended")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                name="date_of_graduation"
                value={formData.date_of_graduation}
                onChange={handleChange}
                placeholder="Date of Graduation"
                className={`w-full border rounded p-2 ${
                  errors.includes("date_of_graduation")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              <input
                name="honors"
                value={formData.honors}
                onChange={handleChange}
                placeholder="List of Honors/Awards"
                className={`w-full border rounded p-2 ${
                  errors.includes("honors")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
            </div>
          </motion.section>

          {/* Schedule Selection - uses schedules loaded earlier */}
          <motion.section layout className="p-4 border rounded-xl bg-slate-50">
            <h3 className="font-semibold">Please choose your Schedule</h3>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
              <select
                name="schedule_id"
                value={formData.schedule_id}
                onChange={handleChange}
                className={`w-full border rounded p-2 ${
                  errors.includes("schedule_id")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              >
                <option value="">Select date & time</option>
                {schedules.map((s) => (
                  <option
                    key={s.id}
                    value={s.id}
                    disabled={s.booked >= s.limit} // disable kapag puno na
                  >
                    {s.date} - {s.time}{" "}
                    {s.booked >= s.limit
                      ? "(Full)"
                      : `(${s.booked}/${s.limit} booked)`}
                  </option>
                ))}
              </select>

              <div className="text-sm text-slate-600">
                Note: Schedule list comes from your backend
                (ScheduleController). This selects a date/time you prefer for
                interview/processing.
              </div>
            </div>
            {errors.includes("schedule_id") && (
              <p className="text-red-500 text-sm mt-1">Schedule is required.</p>
            )}
          </motion.section>

          {/* Declaration */}
          <motion.section layout className="p-4 border rounded-xl">
            <h3 className="font-semibold">DECLARATION OF CONSENT</h3>
            <p className="text-sm text-slate-600 mt-2">
              I express consent for the school to collect, store, and process my
              personal data. I understand that my consent does not preclude the
              existence of other criteria for lawful processing of personal
              data, and does not waive any of my rights under the Data Privacy
              Act of 2012 and other applicable laws. Furthermore, I certify that
              the information given herein is correct and complete.
            </p>

            <label className="flex items-center gap-2 mt-4">
              <input
                name="declaration"
                type="checkbox"
                checked={formData.declaration}
                onChange={handleChange}
                className={`w-4 h-4 ${
                  errors.includes("declaration")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              <span>
                I have read and fully understood the above declaration and give
                my consent.
              </span>
            </label>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={clearForm}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-red-50 transition"
              >
                <FiTrash2 /> Clear
              </button>

              <button
                type="submit"
                className="ml-auto inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-indigo-600 text-white hover:scale-105 transition-transform"
              >
                <FiCheckSquare /> Submit Application
              </button>
            </div>
          </motion.section>
        </form>

        <footer className="mt-6 text-sm text-slate-500">SASO NEXUS</footer>
      </motion.div>
    </div>
  );
}
