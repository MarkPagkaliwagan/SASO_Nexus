import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  FaUserGraduate,
  FaClipboardList,
  FaCheckCircle,
  FaArrowRight,
  FaArrowLeft,
  FaEye,
  FaLock,
} from "react-icons/fa";

export default function ExamTake() {
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(1); // 1 = Details, 2 = Preview, 3 = Exam, 4 = Submitted
  const [details, setDetails] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    gender: "",
    date_of_birth: "",
    address: "",

    // New fields for education application
    application_level: "", // college | shs | jhs | gs

    // College
    college_academic_year: "",
    college_semester: "",
    college_choice_1: "",
    college_choice_2: "",

    // SHS
    shs_grade_level: "",
    shs_strand: "",

    // Junior High
    jhs_grade_level: "",

    // Grade School
    gs_grade_level: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [examClosed, setExamClosed] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);

  // Program lists (from user's spec)
  const collegePrograms = [
    { group: "College of Arts and Sciences", items: [
      "BA COMMUNICATION",
      "BS PSYCHOLOGY",
      "AB POLITICAL SCIENCE",
      "AB ENGLISH",
    ]},
    { group: "College of Education", items: [
      "Bachelor of Early Childhood Education (BECed)",
      "Bachelor of Elementary Education (BEED) - Generalist",
      "Certificate in Teaching Program (CTP) - MAPEH",
      "Certificate in Teaching Program (CTP) - PE",
      "Bachelor of Secondary Education (BSED) - English",
      "Bachelor of Secondary Education (BSED) - Mathematics",
      "Bachelor of Secondary Education (BSED) - Filipino",
      "Bachelor of Secondary Education (BSED) - Social Studies",
      "Bachelor of Secondary Education (BSED) - Science",
      "Bachelor of Secondary Education (BSED) - Values Education",
      "Bachelor of Technology and Livelihood Education (BTLE) - Home Economics",
      "Bachelor of Technology and Livelihood Education (BTLE) - ICT",
      "Bachelor of Science in Mathematics (BS Mathematics)",
      "Bachelor of Physical Education (BPED)",
      "Bachelor of Special Needs Education (BSNED)",
    ]},
    { group: "College of Physical Therapy", items: ["Bachelor of Science in Physical Therapy (BSPT)"]},
    { group: "College of Radiologic Technology", items: [
      "Bachelor of Science in Radiologic Technology (BSRT)",
      "Associate in Radiologic Technology (ARadTech - 3 years)",
    ]},
    { group: "College of Business and Management", items: [
      "BSBA - Human Resources Management",
      "BSBA - Marketing Management",
      "BSBA - Financial Technology",
      "Bachelor of Science in Entrepreneurship (BS Entrep)",
      "Bachelor of Science in Public Administration (BS in PubAd)",
      "Bachelor of Science in Real Estate Management (BSREM)",
    ]},
    { group: "College of Accountancy", items: ["Bachelor of Science in Accountancy (BSA)"]},
    { group: "College of Hospitality and Management", items: [
      "Bachelor of Science in Hospitality Management (BSHM)",
      "Associate in Hospitality and Management (AHM - 2 years)",
    ]},
    { group: "College of Computer Science", items: [
      "Bachelor of Science in Computer Science (BSCS)",
      "Bachelor of Science in Information Technology (BSIT)",
      "Associate in Computer Technology (ACT - 2 years)",
    ]},
    { group: "College of Nursing", items: ["Bachelor of Science in Nursing (BSN)"]},
  ];

  const shsStrands = [
    "Science and Technology, Engineering and Mathematics (STEM)",
    "Humanities and Social Sciences (HUMSS)",
    "Accountancy, Business & Management (ABM)",
    "General Academic Strand (GAS)",
    "Home Economics (Caregiving, Housekeeping)",
    "Information & Communication Technology (ICT)",
    "Performing Arts",
    "Art Production",
    "Sports Track",
  ];

  // 🔀 Shuffle helper
  const shuffle = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  useEffect(() => {
    let mounted = true;
    const fetchExam = async () => {
      setLoading(true);
      setError(null);
      setExamClosed(false);
      try {
        const res = await fetch(`/api/exams/${id}`);
        if (res.status === 403) {
          const data = await res.json();
          if (mounted) {
            setExamClosed(true);
            setError(data.message || "This exam is closed.");
            setLoading(false);
          }
          return;
        }
        if (!res.ok) throw new Error(`Failed to fetch exam (${res.status})`);
        const data = await res.json();

        // 🔀 Randomize questions & answers
        if (data.sections_enabled && Array.isArray(data.sections)) {
          data.sections = data.sections.map((s) => ({
            ...s,
            questions: shuffle(
              (s.questions || []).map((q) => ({
                ...q,
                answers: shuffle(q.answers || []),
              }))
            ),
          }));
        } else {
          data.questions = shuffle(
            (data.questions || []).map((q) => ({
              ...q,
              answers: shuffle(q.answers || []),
            }))
          );
        }

        if (mounted) {
          setExam(data);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching exam:", err);
        if (mounted) {
          setError(err.message || "Unable to load exam. Please try again later.");
          setLoading(false);
        }
      }
    };
    fetchExam();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleAnswerChange = (qId, value) =>
    setAnswers((prev) => ({ ...prev, [qId]: value }));

  // ✅ Safe stringify
  const safeContent = (val) => {
    if (!val) return "";
    if (typeof val === "object") {
      try {
        return JSON.stringify(val);
      } catch {
        return String(val);
      }
    }
    let clean = String(val).trim();
    if (
      (clean.startsWith('"') && clean.endsWith('"')) ||
      (clean.startsWith("'") && clean.endsWith("'"))
    ) {
      clean = clean.slice(1, -1);
    }
    return clean;
  };

  const renderQuestion = (q, index) => {
    if (!q) return null;
    const questionContent = safeContent(q.final_content);
    const isImageQuestion =
      questionContent &&
      (questionContent.startsWith("http") ||
        questionContent.startsWith("data:image"));

    return (
      <div
        key={q.id}
        className="bg-white shadow rounded-xl p-6 border border-gray-200 "
      >
        <div className="mb-3 ">
          <p className="text-lg font-semibold text-green-800 flex items-center gap-2">
            <FaClipboardList className="text-yellow-500" />
            Question {index + 1}
          </p>
          {isImageQuestion ? (
            <img
              src={questionContent}
              alt={`Question ${index + 1}`}
              className="max-h-48 mx-auto mt-3 rounded border"
            />
          ) : (
            <p className="mt-2 text-gray-700">{questionContent}</p>
          )}
        </div>
        <div className="space-y-3">
          {Array.isArray(q.answers) && q.answers.length > 0 ? (
            q.answers.map((a) => {
              const answerContent = safeContent(a.final_content);
              const isImageAnswer =
                answerContent &&
                (answerContent.startsWith("http") ||
                  answerContent.startsWith("data:image"));
              return (
                <label
                  key={a.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-green-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    value={a.id}
                    checked={String(answers[q.id] || "") === String(a.id)}
                    onChange={() => handleAnswerChange(q.id, a.id)}
                    className="h-4 w-4 text-green-600"
                  />
                  {isImageAnswer ? (
                    <img
                      src={answerContent}
                      alt={`Answer for question ${index + 1}`}
                      className="max-h-20 rounded border"
                    />
                  ) : (
                    <span className="text-gray-700">
                      {answerContent || "No content"}
                    </span>
                  )}
                </label>
              );
            })
          ) : (
            <div className="text-sm text-gray-500">No answers available.</div>
          )}
        </div>
      </div>
    );
  };

  // 🔀 Sections vs fallback
  const sections = exam
    ? exam.sections_enabled
      ? Array.isArray(exam.sections)
        ? exam.sections
        : []
      : [
          {
            title: "All Questions",
            questions: Array.isArray(exam.questions) ? exam.questions : [],
          },
        ]
    : [];

  const currentSectionObj =
    sections[currentSection] || { title: "", questions: [] };
  const totalSections = sections.length;

  // Basic required fields
  const baseRequiredFilled = [
    "first_name",
    "last_name",
    "email",
    "phone",
    "gender",
    "date_of_birth",
    "address",
  ].every((k) => String(details[k] || "").trim() !== "");

  // Level-specific validation
  const areDetailsValid = () => {
    if (!baseRequiredFilled) return false;
    const level = details.application_level;
    if (!level) return false;

    if (level === "college") {
      const collegeFields = [
        "college_academic_year",
        "college_semester",
        "college_choice_1",
      ];
      return collegeFields.every((k) => String(details[k] || "").trim() !== "");
    }

    if (level === "shs") {
      return (
        String(details.shs_grade_level || "").trim() !== "" &&
        String(details.shs_strand || "").trim() !== ""
      );
    }

    if (level === "jhs") {
      return String(details.jhs_grade_level || "").trim() !== "";
    }

    if (level === "gs") {
      return String(details.gs_grade_level || "").trim() !== "";
    }

    return false;
  };

  // ✅ Check if current section is fully answered
  const isCurrentSectionComplete = currentSectionObj.questions.every(
    (q) => answers[q.id]
  );

  // ✅ Check if full exam is answered
  const isExamComplete = sections.every((s) =>
    s.questions.every((q) => answers[q.id])
  );

  const handleSubmit = async () => {
    if (submitting) return;

    setSubmitting(true);
    try {
      const payload = { details, answers };
      const res = await fetch(`/api/exams/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Submit failed (${res.status})`);
      await res.json(); // ✅ ignore score, no alert
      setStep(4); // move to thank you page
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to submit exam. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600 text-lg">Loading exam...</div>
      </div>
    );
  }

  // Closed Exam
  if (examClosed) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-lg">
          <FaLock className="text-red-500 text-6xl mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-red-600 mb-2">Exam Closed</h2>
          <p className="text-gray-700">{error}</p>
          <p className="text-sm text-gray-500 mt-4 italic">
            Please contact the administrator for further assistance.
          </p>
        </div>
      </div>
    );
  }

  // Not Found
  if (!exam) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Exam not found.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 text-gray-900 mt-[5%]">
      <div className="text-center mb-10">
        <FaUserGraduate className="text-green-700 text-6xl mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-green-800 uppercase">
          Entrance Examination
        </h1>
        <h2 className="text-lg font-semibold text-yellow-600 mt-2">
          San Pablo Colleges
        </h2>
        <p className="text-sm text-gray-600 italic">
          Office of Student Affairs and Services – “Building dreams, shaping
          futures.”
        </p>
      </div>

      {/* Step 1: Details */}
      {step === 1 && (
        <div className="bg-white p-8 rounded-2xl shadow-md border border-green-200">
          <h2 className="text-2xl font-semibold mb-6 text-green-800">
            Examinee Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              name="first_name"
              placeholder="First Name"
              value={details.first_name}
              onChange={handleDetailChange}
              className="border rounded-lg p-3 w-full"
              required
            />
            <input
              name="last_name"
              placeholder="Last Name"
              value={details.last_name}
              onChange={handleDetailChange}
              className="border rounded-lg p-3 w-full"
              required
            />
            <input
              name="email"
              placeholder="Email"
              type="email"
              value={details.email}
              onChange={handleDetailChange}
              className="border rounded-lg p-3 w-full"
              required
            />
            <input
              name="phone"
              placeholder="Phone"
              value={details.phone}
              onChange={handleDetailChange}
              className="border rounded-lg p-3 w-full"
              required
            />
            <select
              name="gender"
              value={details.gender}
              onChange={handleDetailChange}
              className="border rounded-lg p-3 w-full"
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <input
              name="date_of_birth"
              type="date"
              value={details.date_of_birth}
              onChange={handleDetailChange}
              className="border rounded-lg p-3 w-full"
              required
            />
          </div>
          <textarea
            name="address"
            placeholder="Address"
            value={details.address}
            onChange={handleDetailChange}
            className="border rounded-lg p-3 w-full mt-6"
            required
          />

          {/* Application Level */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              This is an application for:
            </label>
            <select
              name="application_level"
              value={details.application_level}
              onChange={handleDetailChange}
              className="border rounded-lg p-3 w-full max-w-md"
            >
              <option value="">Select Level</option>
              <option value="college">College Level</option>
              <option value="shs">Senior High School (SHS)</option>
              <option value="jhs">Junior High School</option>
              <option value="gs">Grade School</option>
            </select>
          </div>

          {/* College Section */}
          {details.application_level === "college" && (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-semibold text-green-800 mb-3">College Section</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  name="college_academic_year"
                  value={details.college_academic_year}
                  onChange={handleDetailChange}
                  className="border rounded-lg p-3 w-full"
                >
                  <option value="">Select Academic Year</option>
                  <option value="2024-2025">2024-2025</option>
                  <option value="2025-2026">2025-2026</option>
                  <option value="2026-2027">2026-2027</option>
                </select>

                <select
                  name="college_semester"
                  value={details.college_semester}
                  onChange={handleDetailChange}
                  className="border rounded-lg p-3 w-full"
                >
                  <option value="">Select Semester</option>
                  <option value="1">1st Semester</option>
                  <option value="2">2nd Semester</option>
                </select>

                <div className="flex items-center">
                  <div className="text-sm text-gray-600">(Optional) You may change choices later</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-sm font-medium">1st Choice</label>
                  <select
                    name="college_choice_1"
                    value={details.college_choice_1}
                    onChange={handleDetailChange}
                    className="border rounded-lg p-3 w-full"
                  >
                    <option value="">Select First Choice</option>
                    {collegePrograms.map((g) => (
                      <optgroup key={g.group} label={g.group}>
                        {g.items.map((it) => (
                          <option key={it} value={it}>{it}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">2nd Choice</label>
                  <select
                    name="college_choice_2"
                    value={details.college_choice_2}
                    onChange={handleDetailChange}
                    className="border rounded-lg p-3 w-full"
                  >
                    <option value="">Select Second Choice (optional)</option>
                    {collegePrograms.map((g) => (
                      <optgroup key={g.group+"-2"} label={g.group}>
                        {g.items.map((it) => (
                          <option key={it+"-2"} value={it}>{it}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* SHS Section */}
          {details.application_level === "shs" && (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-semibold text-green-800 mb-3">Senior High School Section</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  name="shs_grade_level"
                  value={details.shs_grade_level}
                  onChange={handleDetailChange}
                  className="border rounded-lg p-3 w-full"
                >
                  <option value="">Select Grade Level</option>
                  <option value="11">Grade 11</option>
                  <option value="12">Grade 12</option>
                </select>

                <select
                  name="shs_strand"
                  value={details.shs_strand}
                  onChange={handleDetailChange}
                  className="border rounded-lg p-3 w-full"
                >
                  <option value="">Select Strand</option>
                  {shsStrands.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Junior High Section */}
          {details.application_level === "jhs" && (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-semibold text-green-800 mb-3">Junior High School Section</h3>
              <select
                name="jhs_grade_level"
                value={details.jhs_grade_level}
                onChange={handleDetailChange}
                className="border rounded-lg p-3 w-full max-w-xs"
              >
                <option value="">Select Grade Level</option>
                <option value="6">Grade 6</option>
                <option value="7">Grade 7</option>
                <option value="8">Grade 8</option>
                <option value="9">Grade 9</option>
                <option value="10">Grade 10</option>
              </select>
            </div>
          )}

          {/* Grade School Section */}
          {details.application_level === "gs" && (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-semibold text-green-800 mb-3">Grade School Section</h3>
              <select
                name="gs_grade_level"
                value={details.gs_grade_level}
                onChange={handleDetailChange}
                className="border rounded-lg p-3 w-full max-w-xs"
              >
                <option value="">Select Grade Level</option>
                <option value="Nursery">Nursery</option>
                <option value="Kinder">Kinder</option>
                <option value="1">Grade 1</option>
                <option value="2">Grade 2</option>
                <option value="3">Grade 3</option>
                <option value="4">Grade 4</option>
                <option value="5">Grade 5</option>
                <option value="6">Grade 6</option>
              </select>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Reset
            </button>

            <button
              onClick={() => setStep(2)}
              disabled={!areDetailsValid()}
              className={`mt-2 flex items-center gap-2 px-6 py-3 rounded-lg ${areDetailsValid()
                ? "bg-green-700 text-white hover:bg-green-800"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
            >
              <FaEye /> Preview
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Preview */}
      {step === 2 && (
        <div className="bg-white p-8 rounded-2xl shadow-md border border-green-200">
          <h2 className="text-2xl font-semibold mb-6 text-green-800">Preview Details</h2>
          <ul className="space-y-2 text-gray-700">
            <li>
              <b>Name:</b> {details.first_name} {details.last_name}
            </li>
            <li>
              <b>Email:</b> {details.email}
            </li>
            <li>
              <b>Phone:</b> {details.phone}
            </li>
            <li>
              <b>Gender:</b> {details.gender}
            </li>
            <li>
              <b>Date of Birth:</b> {details.date_of_birth}
            </li>
            <li>
              <b>Address:</b> {details.address}
            </li>
            <li>
              <b>Application Level:</b> {details.application_level || "-"}
            </li>

            {details.application_level === "college" && (
              <>
                <li><b>Academic Year:</b> {details.college_academic_year}</li>
                <li><b>Semester:</b> {details.college_semester}</li>
                <li><b>1st Choice:</b> {details.college_choice_1}</li>
                <li><b>2nd Choice:</b> {details.college_choice_2 || "-"}</li>
              </>
            )}

            {details.application_level === "shs" && (
              <>
                <li><b>Grade Level:</b> {details.shs_grade_level}</li>
                <li><b>Strand:</b> {details.shs_strand}</li>
              </>
            )}

            {details.application_level === "jhs" && (
              <li><b>Grade Level:</b> {details.jhs_grade_level}</li>
            )}

            {details.application_level === "gs" && (
              <li><b>Grade Level:</b> {details.gs_grade_level}</li>
            )}
          </ul>
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-500 text-white hover:bg-gray-600"
            >
              <FaArrowLeft /> Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-700 text-white hover:bg-green-800"
            >
              Proceed to Exam <FaArrowRight />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Exam */}
      {step === 3 && totalSections > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-green-800 mb-6">
            Section {currentSection + 1}: {currentSectionObj.title}
          </h2>
          <div className="space-y-6">
            {currentSectionObj.questions.map((q, idx) => renderQuestion(q, idx))}
          </div>
          <div className="flex justify-end mt-8">
            {currentSection < totalSections - 1 ? (
              <button
                onClick={() => setCurrentSection((s) => s + 1)}
                disabled={!isCurrentSectionComplete}
                className={`px-6 py-3 rounded-lg flex items-center gap-2 ${isCurrentSectionComplete
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
                }`}
              >
                Next Section <FaArrowRight />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!isExamComplete || submitting}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg ${!isExamComplete || submitting
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-yellow-500 text-white hover:bg-yellow-600"
                }`}
              >
                <FaCheckCircle /> {submitting ? "Submitting..." : "Submit Exam"}
              </button>
            )}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="bg-white p-8 rounded-2xl shadow-md border border-green-200 text-center">
          <h3 className="text-xl font-semibold text-green-800">Submission Received</h3>
          <p className="mt-3 text-gray-700">
            Thank you for completing the exam. Please wait for the administrator to announce the results.
          </p>
        </div>
      )}

    </div>
  );
}
