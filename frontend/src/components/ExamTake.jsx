import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  FaUserGraduate,
  FaClipboardList,
  FaCheckCircle,
  FaArrowRight,
  FaArrowLeft,
  FaEye,
  FaLock,
  FaIdBadge,
  FaEnvelope,
  FaPhone,
  FaVenusMars,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaSave,
  FaEdit,
  FaRedo,
} from "react-icons/fa";

// Responsive single-file component: preserved behavior, improved mobile/tablet/desktop layout
export default function ExamTake() {
  const { id } = useParams();
  const [inputsDisabled, setInputsDisabled] = useState(true);

  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [typedID, setTypedID] = useState("");

  const [step, setStep] = useState(1); // 1 = Details, 2 = Preview, 3 = Exam, 4 = Submitted
  const [details, setDetails] = useState({
    application_id: "",
    first_name: "",
    last_name: "",
    middle_name: "",
    email: "",
    phone: "",
    gender: "",
    date_of_birth: "",
    address: "",

    application_level: "",

    college_academic_year: "",
    college_semester: "",
    college_choice_1: "",
    college_choice_2: "",

    shs_grade_level: "",
    shs_strand: "",

    jhs_grade_level: "",
    gs_grade_level: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [examClosed, setExamClosed] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);

  // ---------- AUTOSAVE IMPROVEMENTS ----------
  const autosaveTimer = useRef(null); // for localStorage debounce
  const serverSaveTimer = useRef(null); // for server debounce
  const periodicServerInterval = useRef(null); // periodic sync interval
  const inflightServerController = useRef(null); // abort controller for server saves
  const clientIdRef = useRef(null);
  const autosaveKey = `exam_autosave_${id}`;
  const clientIdKey = `exam_client_id`;

  // init clientId (persistent per browser)
  useEffect(() => {
    try {
      let cid = localStorage.getItem(clientIdKey);
      if (!cid) {
        cid = (crypto && crypto.randomUUID) ? crypto.randomUUID() : `client_${Math.random().toString(36).slice(2, 10)}`;
        localStorage.setItem(clientIdKey, cid);
      }
      clientIdRef.current = cid;
    } catch (err) {
      clientIdRef.current = `client_${Math.random().toString(36).slice(2, 10)}`;
    }
  }, []);

  // -----------------------------
  // AUTOSAVE: load from localStorage on mount
  // -----------------------------
  useEffect(() => {
    try {
      const raw = localStorage.getItem(autosaveKey);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved) {
          if (saved.answers) setAnswers(saved.answers);
          if (saved.details) setDetails((prev) => ({ ...prev, ...saved.details }));
          if (typeof saved.currentSection !== "undefined") setCurrentSection(saved.currentSection);
          if (typeof saved.step !== "undefined") setStep(saved.step);
          if (saved.typedID) setTypedID(saved.typedID);
        }
      }
    } catch (err) {
      // ignore localStorage errors
      console.warn("Failed to load autosave:", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // helper: create payload
  const makePayload = () => ({
    clientId: clientIdRef.current,
    application_id: details.application_id || typedID || null,
    exam_id: id,
    answers,
    details,
    currentSection,
    step,
    timestamp: Date.now(),
  });

  // localStorage save (debounced)
  useEffect(() => {
    const saveLocal = () => {
      try {
        const payload = makePayload();
        localStorage.setItem(autosaveKey, JSON.stringify(payload));
      } catch (err) {
        console.warn("Autosave failed:", err);
      }
    };

    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(saveLocal, 600); // slightly faster local debounce

    // schedule server autosave (debounced)
    if (serverSaveTimer.current) clearTimeout(serverSaveTimer.current);
    serverSaveTimer.current = setTimeout(() => {
      // only attempt server save if we have an application id (server autosave keyed by application)
      if (details.application_id || typedID) {
        serverAutosave(makePayload());
      }
    }, 1800);

    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
      if (serverSaveTimer.current) clearTimeout(serverSaveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, details, currentSection, step, typedID, autosaveKey]);

  // periodic server sync in case network comes back
  useEffect(() => {
    // every 15s try to push latest (if application_id exists)
    periodicServerInterval.current = setInterval(() => {
      try {
        if (details.application_id || typedID) {
          serverAutosave(makePayload());
        }
      } catch (err) {}
    }, 15000);

    return () => {
      clearInterval(periodicServerInterval.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [details.application_id, typedID, answers, currentSection, step]);

  // ensure we persist one last time on page close (local + sendBeacon)
  useEffect(() => {
    const handler = () => {
      try {
        const payload = makePayload();
        // save local
        try {
          localStorage.setItem(autosaveKey, JSON.stringify(payload));
        } catch (err) {}

        // use sendBeacon for last-chance server save (non-blocking)
        try {
          if (navigator && navigator.sendBeacon && (details.application_id || typedID)) {
            const url = `/api/exams/${encodeURIComponent(id)}/autosave`;
            const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
            navigator.sendBeacon(url, blob);
          }
        } catch (err) {
          // fall back: best-effort synchronous XHR is deprecated; skip
        }
      } catch (err) {}
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, details, currentSection, step, typedID, autosaveKey]);

  // When exam is loaded, filter stored answers to contain only valid question IDs
  useEffect(() => {
    if (!exam) return;
    try {
      const validIds = new Set();
      const secs = exam.sections_enabled ? exam.sections : [{ questions: exam.questions || [] }];
      secs.forEach((s) => (s.questions || []).forEach((q) => validIds.add(String(q.id))));

      setAnswers((prev) => {
        const filtered = {};
        Object.entries(prev || {}).forEach(([k, v]) => {
          if (validIds.has(String(k))) filtered[k] = v;
        });
        return filtered;
      });
    } catch (err) {
      // ignore
    }
  }, [exam]);

  // When application_id becomes available (after load), try to fetch server autosave and merge intelligently
  useEffect(() => {
    const appId = details.application_id || typedID;
    if (!appId) return;

    let mounted = true;
    const fetchAndMerge = async () => {
      try {
        const res = await fetch(`/api/exams/${encodeURIComponent(id)}/autosave?application_id=${encodeURIComponent(appId)}`);
        if (!res.ok) return;
        const serverSaved = await res.json(); // expect same payload shape { timestamp, clientId, answers, details, ... }

        if (!mounted || !serverSaved) return;

        // merge: if server timestamp is newer than local, adopt server for missing/newer fields
        const localRaw = localStorage.getItem(autosaveKey);
        let localSaved = null;
        try {
          localSaved = localRaw ? JSON.parse(localRaw) : null;
        } catch (err) {
          localSaved = null;
        }

        // if server is newer, use server. If local is newer, keep local.
        if (serverSaved.timestamp && (!localSaved || serverSaved.timestamp > localSaved.timestamp)) {
          // merge answers: prefer server for keys server has; keep local for others
          const mergedAnswers = { ...(localSaved && localSaved.answers ? localSaved.answers : {}), ...(serverSaved.answers || {}) };
          const mergedDetails = { ...(localSaved && localSaved.details ? localSaved.details : {}), ...(serverSaved.details || {}) };

          setAnswers(mergedAnswers);
          setDetails((prev) => ({ ...prev, ...mergedDetails }));
          if (typeof serverSaved.currentSection !== "undefined") setCurrentSection(serverSaved.currentSection);
          if (typeof serverSaved.step !== "undefined") setStep(serverSaved.step || 1);

          // persist merged locally
          try {
            localStorage.setItem(autosaveKey, JSON.stringify({ ...serverSaved, answers: mergedAnswers, details: mergedDetails }));
          } catch (err) {}
        } else {
          // local is newer or equal — keep local (no-op)
        }
      } catch (err) {
        // ignore fetch errors (network maybe offline)
        console.warn("Could not fetch server autosave:", err);
      }
    };

    fetchAndMerge();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [details.application_id, typedID, id]);

  // serverAutosave implementation with simple abort + retry logic
  const serverAutosave = async (payload, attempt = 0) => {
    // don't spam if no application id (server autosave keyed by application_id)
    if (!payload.application_id) return;

    if (inflightServerController.current) {
      // abort previous inflight save to avoid race
      try {
        inflightServerController.current.abort();
      } catch (err) {}
    }
    const controller = new AbortController();
    inflightServerController.current = controller;

    try {
      const res = await fetch(`/api/exams/${encodeURIComponent(id)}/autosave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok) {
        // if server returns 5xx, retry a few times with backoff
        if (res.status >= 500 && attempt < 3) {
          const delay = Math.pow(2, attempt) * 700;
          setTimeout(() => serverAutosave(payload, attempt + 1), delay);
        }
        return;
      }

      // success: optionally we can replace local store with server copy (server may normalize)
      const data = await res.json().catch(() => null);
      if (data && data.timestamp) {
        try {
          // if server responded with canonical saved copy, store locally
          const localRaw = localStorage.getItem(autosaveKey);
          let localSaved = null;
          try {
            localSaved = localRaw ? JSON.parse(localRaw) : null;
          } catch (err) {
            localSaved = null;
          }

          // If server timestamp is newer, update local copy
          if (!localSaved || data.timestamp >= localSaved.timestamp) {
            localStorage.setItem(autosaveKey, JSON.stringify({ ...data }));
          }
        } catch (err) {}
      }
    } catch (err) {
      if (err.name === "AbortError") {
        // aborted — ignore
        return;
      }
      // network error: retry a couple times
      if (attempt < 3) {
        const delay = Math.pow(2, attempt) * 700;
        setTimeout(() => serverAutosave(payload, attempt + 1), delay);
      } else {
        // give up for now; periodic interval will try again
        console.warn("Autosave network error, will retry later:", err);
      }
    } finally {
      // clear controller reference if it is the same
      if (inflightServerController.current === controller) inflightServerController.current = null;
    }
  };
  // ---------- END AUTOSAVE IMPROVEMENTS ----------

  const collegePrograms = [
    {
      group: "College of Arts and Sciences",
      items: ["BA Communication", "BS Psychology", "AB Political Science", "AB English"],
    },
    {
      group: "College of Education",
      items: [
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
      ],
    },
    { group: "College of Physical Therapy", items: ["Bachelor of Science in Physical Therapy (BSPT)"] },
    {
      group: "College of Radiologic Technology",
      items: ["Bachelor of Science in Radiologic Technology (BSRT)", "Associate in Radiologic Technology (ARadTech - 3 years)"],
    },
    {
      group: "College of Business and Management",
      items: [
        "BSBA - Human Resources Management",
        "BSBA - Marketing Management",
        "BSBA - Financial Technology",
        "Bachelor of Science in Entrepreneurship (BS Entrep)",
        "Bachelor of Science in Public Administration (BS in PubAd)",
        "Bachelor of Science in Real Estate Management (BSREM)",
        "Bachelor of Science in Hospitality Management (BSHM)",
        "Associate in Hospitality and Management (AHM - 2 years)",
      ],
    },
    { group: "College of Accountancy", items: ["Bachelor of Science in Accountancy (BSA)"] },
    {
      group: "College of Computer Science",
      items: ["Bachelor of Science in Computer Science (BSCS)", "Bachelor of Science in Information Technology (BSIT)", "Associate in Computer Technology (ACT - 2 years)"],
    },
    { group: "College of Nursing", items: ["Bachelor of Science in Nursing (BSN)"] },
  ];

  const shsStrands = [
    "STEM",
    "HUMSS",
    "CBM",
    "GAS",
    "Home Economics (Caregiving, Housekeeping)",
    "ICT",
    "Performing Arts",
    "Art Production",
    "Sports Track",
  ];

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

        if (data.sections_enabled && Array.isArray(data.sections)) {
          data.sections = data.sections.map((s) => ({
            ...s,
            questions: shuffle((s.questions || []).map((q) => ({ ...q, answers: shuffle(q.answers || []) })) ),
          }));
        } else {
          data.questions = shuffle((data.questions || []).map((q) => ({ ...q, answers: shuffle(q.answers || []) })));
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

  const fetchApplicantDetails = async (appID) => {
    try {
      const res = await fetch(`/api/applications/${appID}`);
      if (!res.ok) throw new Error("Application not found");
      const data = await res.json();

      setDetails({
        application_id: data.id || "",
        first_name: data.nameGiven || "",
        middle_name: data.nameMiddle || "",
        last_name: data.nameFamily || "",
        email: data.email || "",
        phone: data.mobile || data.tel || "",
        gender: data.gender || "",
        date_of_birth: data.dob || "",
        address: data.address || "",
        application_level: data.applicationType || "",

        college_academic_year: data.academicYear || "",
        college_semester: data.semester || "",
        college_choice_1: data.firstChoice || "",
        college_choice_2: data.secondChoice || "",

        shs_grade_level: data.shsGradeLevel || "",
        shs_strand: data.shsStrand || "",

        jhs_grade_level: data.gradeLevel || "",
        gs_grade_level: data.gradeLevel || "",
      });

      setInputsDisabled(true);
      alert("Application Loaded!");
    } catch (err) {
      alert("Application ID not found!");
    }
  };

  const handleSaveDetails = async () => {
    try {
      const payload = {
        nameGiven: details.first_name,
        nameMiddle: details.middle_name,
        nameFamily: details.last_name,

        email: details.email,
        mobile: details.phone,
        gender: details.gender,
        dob: details.date_of_birth,
        address: details.address,

        applicationType: details.application_level,

        academicYear: details.college_academic_year,
        semester: details.college_semester,
        firstChoice: details.college_choice_1,
        secondChoice: details.college_choice_2,

        shsGradeLevel: details.shs_grade_level,
        shsStrand: details.shs_strand,

        gradeLevel: details.jhs_grade_level || details.gs_grade_level,
      };

      const res = await fetch(`/api/applications/${details.application_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update");

      alert("Details updated successfully!");
      setInputsDisabled(true);
    } catch (err) {
      alert("Failed to save details. Please try again.");
    }
  };

  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleAnswerChange = (qId, value) => setAnswers((prev) => ({ ...prev, [qId]: value }));

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
    if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
      clean = clean.slice(1, -1);
    }
    return clean;
  };

  const StepBadge = ({ number, title, active }) => (
    <div className={`flex items-center gap-3 ${active ? "text-green-700" : "text-gray-400"}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${active ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
        {number}
      </div>
      <div className="text-sm">
        <div className={`font-medium ${active ? 'text-gray-900' : 'text-gray-500'}`}>{title}</div>
      </div>
    </div>
  );

  const renderQuestion = (q, index) => {
    if (!q) return null;
    const questionContent = safeContent(q.final_content);
    const isImageQuestion = questionContent && (questionContent.startsWith("http") || questionContent.startsWith("data:image"));

    return (
      <div key={q.id} className="bg-white shadow-sm rounded-xl p-4 sm:p-6 border border-gray-100 transition-transform hover:-translate-y-0.5">
        <div className="mb-3">
          <p className="text-base sm:text-lg font-semibold text-green-800 flex items-center gap-2">
            <FaClipboardList className="text-yellow-500" />
            Question {index + 1}
          </p>
          {isImageQuestion ? (
            <img src={questionContent} alt={`Question ${index + 1}`} className="w-full max-h-60 object-contain mx-auto mt-3 rounded border" />
          ) : (
            <p className="mt-2 text-gray-700 text-sm sm:text-base">{questionContent}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
          {Array.isArray(q.answers) && q.answers.length > 0 ? (
            q.answers.map((a) => {
              const answerContent = safeContent(a.final_content);
              const isImageAnswer = answerContent && (answerContent.startsWith("http") || answerContent.startsWith("data:image"));
              return (
                <label key={a.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-green-50 cursor-pointer transition-shadow shadow-sm w-full">
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    value={a.id}
                    checked={String(answers[q.id] || "") === String(a.id)}
                    onChange={() => handleAnswerChange(q.id, a.id)}
                    className="h-4 w-4 text-green-600 flex-none"
                    aria-label={`Answer option for question ${index + 1}`}
                  />

                  <div className="flex-1 min-w-0">
                    {isImageAnswer ? (
                      <img src={answerContent} alt={`Answer for question ${index + 1}`} className="w-full max-h-36 object-contain rounded border" />
                    ) : (
                      <span className="text-gray-700 text-sm truncate block">{answerContent || "No content"}</span>
                    )}
                  </div>
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

  const currentSectionObj = sections[currentSection] || { title: "", questions: [] };
  const totalSections = sections.length;

  const baseRequiredFilled = [
    "first_name",
    "last_name",
    "email",
    "phone",
    "gender",
    "date_of_birth",
    "address",
  ].every((k) => String(details[k] || "").trim() !== "");

  const areDetailsValid = () => {
    if (!baseRequiredFilled) return false;
    const level = details.application_level;
    if (!level) return false;

    if (level === "College") {
      const collegeFields = ["college_academic_year", "college_semester", "college_choice_1"];
      return collegeFields.every((k) => String(details[k] || "").trim() !== "");
    }

    if (level === "Senior High School") {
      return (String(details.shs_grade_level || "").trim() !== "" && String(details.shs_strand || "").trim() !== "");
    }

    if (level === "Junior High School") {
      return String(details.jhs_grade_level || "").trim() !== "";
    }

    if (level === "Grade School") {
      return String(details.gs_grade_level || "").trim() !== "";
    }

    return false;
  };

  const isCurrentSectionComplete = currentSectionObj.questions.every((q) => answers[q.id]);
  const isExamComplete = sections.every((s) => s.questions.every((q) => answers[q.id]));

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
      await res.json();
      setStep(4);

      // clear autosave after successful submit
      try {
        localStorage.removeItem(autosaveKey);
        // notify server to clear autosave for this application (optional endpoint)
        fetch(`/api/exams/${encodeURIComponent(id)}/autosave/clear`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ application_id: details.application_id || typedID }),
        }).catch(() => {});
      } catch (err) {}
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to submit exam. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <div className="text-gray-600 text-lg">Loading exam...</div>
      </div>
    );
  }

  if (examClosed) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-100 p-4">
        <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-xl text-center w-full max-w-lg">
          <FaLock className="text-red-500 text-5xl mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold text-red-600 mb-2">Exam Closed</h2>
          <p className="text-gray-700">{error}</p>
          <p className="text-sm text-gray-500 mt-4 italic">Please contact the administrator for further assistance.</p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6 text-gray-600">Exam not found.</div>
    );
  }

  const totalQuestions = sections.reduce((sum, s) => sum + (s.questions || []).length, 0);
  const answeredCount = Object.keys(answers).length;
  const overallProgress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 text-gray-900 mt-24">
      <div className="text-center mb-6">
        <FaUserGraduate className="text-green-700 text-4xl sm:text-5xl mx-auto mb-2" />
        <h1 className="text-2xl sm:text-3xl font-bold text-green-800 uppercase">Entrance Examination</h1>
        <h2 className="text-sm sm:text-md font-semibold text-yellow-600 mt-1">San Pablo Colleges</h2>
        <p className="text-xs sm:text-sm text-gray-600 italic">Office of Student Affairs and Services – “S-A-S-O”</p>
      </div>

      {/* Step indicator */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <StepBadge number={1} title="Details" active={step === 1} />
          <div className="hidden sm:block w-px h-8 bg-gray-200" />
          <StepBadge number={2} title="Preview" active={step === 2} />
          <div className="hidden sm:block w-px h-8 bg-gray-200" />
          <StepBadge number={3} title="Exam" active={step === 3} />
          <div className="hidden sm:block w-px h-8 bg-gray-200" />
          <StepBadge number={4} title="Submitted" active={step === 4} />
        </div>

        <div className="text-right">
          <div className="text-xs text-gray-500">Progress</div>
          <div className="w-full sm:w-56 bg-gray-100 rounded-full h-2 overflow-hidden mt-2">
            <div className="h-2 rounded-full bg-green-600 transition-all" style={{ width: `${overallProgress}%` }} />
          </div>
          <div className="text-sm font-medium mt-1">{answeredCount}/{totalQuestions} answered</div>
        </div>
      </div>

      {/* Step 1: Details */}
      {step === 1 && (
        <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-md border border-green-50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-green-800">Examinee Details</h2>
          </div>

          {/* TYPE YOUR APPLICATION ID */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"><FaIdBadge /> Enter Application ID</label>

            <div className="flex flex-col sm:flex-row gap-3">
              <input type="text" value={typedID} onChange={(e) => setTypedID(e.target.value)} placeholder="Type your Application ID" className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-200" />

              <button onClick={() => { setDetails((prev) => ({ ...prev, application_id: typedID })); fetchApplicantDetails(typedID); }} className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 w-full sm:w-auto">
                Load
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-600 flex items-center gap-2"><FaIdBadge /> First Name</label>
              <input name="first_name" placeholder="First Name" value={details.first_name} onChange={handleDetailChange} disabled={inputsDisabled} className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-green-100 disabled:opacity-70 disabled:cursor-not-allowed text-sm" />
            </div>

            <div>
              <label className="text-xs text-gray-600 flex items-center gap-2"><FaIdBadge /> Middle Name</label>
              <input name="middle_name" placeholder="Middle Name" value={details.middle_name} onChange={handleDetailChange} disabled={inputsDisabled} className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-green-100 disabled:opacity-70 disabled:cursor-not-allowed text-sm" />
            </div>

            <div>
              <label className="text-xs text-gray-600 flex items-center gap-2"><FaIdBadge /> Last Name</label>
              <input name="last_name" placeholder="Last Name" value={details.last_name} onChange={handleDetailChange} disabled={inputsDisabled} className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-green-100 disabled:opacity-70 disabled:cursor-not-allowed text-sm" />
            </div>

            <div>
              <label className="text-xs text-gray-600 flex items-center gap-2"><FaEnvelope /> Email</label>
              <input name="email" placeholder="Email" type="email" value={details.email} onChange={handleDetailChange} disabled={inputsDisabled} className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-green-100 disabled:opacity-70 disabled:cursor-not-allowed text-sm" />
            </div>

            <div>
              <label className="text-xs text-gray-600 flex items-center gap-2"><FaPhone /> Phone</label>
              <input name="phone" placeholder="Phone" value={details.phone} onChange={handleDetailChange} disabled={inputsDisabled} className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-green-100 disabled:opacity-70 disabled:cursor-not-allowed text-sm" />
            </div>

            <div>
              <label className="text-xs text-gray-600 flex items-center gap-2"><FaVenusMars /> Gender</label>
              <select name="gender" value={details.gender} onChange={handleDetailChange} disabled={inputsDisabled} className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-green-100 disabled:opacity-70 disabled:cursor-not-allowed text-sm">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-600 flex items-center gap-2"><FaCalendarAlt /> Date of Birth</label>
              <input name="date_of_birth" type="date" value={details.date_of_birth} onChange={handleDetailChange} disabled={inputsDisabled} className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-green-100 disabled:opacity-70 disabled:cursor-not-allowed text-sm" required />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs text-gray-600 flex items-center gap-2"><FaMapMarkerAlt /> Address</label>
              <textarea name="address" placeholder="Address" value={details.address} onChange={handleDetailChange} disabled={inputsDisabled} className="border rounded-lg p-3 w-full mt-2 focus:ring-2 focus:ring-green-100 disabled:opacity-70 disabled:cursor-not-allowed text-sm" />
            </div>
          </div>

          {/* Application Level */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">This is an application for:</label>
            <select name="application_level" value={details.application_level} onChange={handleDetailChange} disabled={inputsDisabled} className="border rounded-lg p-3 w-full max-w-md focus:ring-2 focus:ring-green-100 disabled:opacity-70 disabled:cursor-not-allowed text-sm">
              <option value="">Select Level</option>
              <option value="College">College Level</option>
              <option value="Senior High School">Senior High School (SHS)</option>
              <option value="Junior High School">Junior High School</option>
              <option value="Grade School">Grade School</option>
            </select>
          </div>

          {/* College Section */}
          {details.application_level === "College" && (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-semibold text-green-800 mb-3">College Section</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select name="college_academic_year" value={details.college_academic_year} onChange={handleDetailChange} disabled={inputsDisabled} className="border rounded-lg p-3 w-full text-sm">
                  <option value="">Select Academic Year</option>
                  <option value="2024-2025">2024-2025</option>
                  <option value="2025-2026">2025-2026</option>
                  <option value="2026-2027">2026-2027</option>
                </select>

                <select name="college_semester" value={details.college_semester} onChange={handleDetailChange} disabled={inputsDisabled} className="border rounded-lg p-3 w-full text-sm">
                  <option value="">Select Semester</option>
                  <option value="First Semester">First Semester</option>
                  <option value="Second Semester">Second Semester</option>
                </select>

                <div className="flex items-center text-sm text-gray-600">(Optional) You may change choices later</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-sm font-medium">1st Choice</label>
                  <select name="college_choice_1" value={details.college_choice_1} onChange={handleDetailChange} disabled={inputsDisabled} className="border rounded-lg p-3 w-full text-sm">
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
                  <select name="college_choice_2" value={details.college_choice_2} onChange={handleDetailChange} disabled={inputsDisabled} className="border rounded-lg p-3 w-full text-sm">
                    <option value="">Select Second Choice (optional)</option>
                    {collegePrograms.map((g) => (
                      <optgroup key={g.group + "-2"} label={g.group}>
                        {g.items.map((it) => (
                          <option key={it + "-2"} value={it}>{it}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* SHS, JHS, GS Sections - unchanged logic but responsive spacing */}
          {details.application_level === "Senior High School" && (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-semibold text-green-800 mb-3">Senior High School Section</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select name="shs_grade_level" value={details.shs_grade_level} onChange={handleDetailChange} disabled={inputsDisabled} className="border rounded-lg p-3 w-full text-sm">
                  <option value="">Select Grade Level</option>
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                </select>

                <select name="shs_strand" value={details.shs_strand} onChange={handleDetailChange} disabled={inputsDisabled} className="border rounded-lg p-3 w-full text-sm">
                  <option value="">Select Strand</option>
                  {shsStrands.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {details.application_level === "Junior High School" && (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-semibold text-green-800 mb-3">Junior High School Section</h3>
              <select name="jhs_grade_level" value={details.jhs_grade_level} onChange={handleDetailChange} disabled={inputsDisabled} className="border rounded-lg p-3 w-full max-w-xs text-sm">
                <option value="">Select Grade Level</option>
                <option value="Grade 6">Grade 6</option>
                <option value="Grade 7">Grade 7</option>
                <option value="Grade 8">Grade 8</option>
                <option value="Grade 9">Grade 9</option>
                <option value="Grade 10">Grade 10</option>
              </select>
            </div>
          )}

          {details.application_level === "Grade School" && (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-semibold text-green-800 mb-3">Grade School Section</h3>
              <select name="gs_grade_level" value={details.gs_grade_level} onChange={handleDetailChange} disabled={inputsDisabled} className="border rounded-lg p-3 w-full max-w-xs text-sm">
                <option value="">Select Grade Level</option>
                <option value="Nursery">Nursery</option>
                <option value="Kinder">Kinder</option>
                <option value="Grade 1">Grade 1</option>
                <option value="Grade 2">Grade 2</option>
                <option value="Grade 3">Grade 3</option>
                <option value="Grade 4">Grade 4</option>
                <option value="Grade 5">Grade 5</option>
                <option value="Grade 6">Grade 6</option>
              </select>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            {!inputsDisabled && (
              <button onClick={handleSaveDetails} className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-shadow flex items-center gap-2 w-full sm:w-auto"><FaSave /> Save Changes</button>
            )}

            {inputsDisabled && (
              <button onClick={() => setInputsDisabled(false)} className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-shadow flex items-center gap-2 w-full sm:w-auto"><FaEdit /> Update Your Details</button>
            )}

            <button onClick={() => {
              setStep(1);
              setTypedID("");
              setDetails({
                application_id: "",
                first_name: "",
                middle_name: "",
                last_name: "",
                email: "",
                phone: "",
                gender: "",
                date_of_birth: "",
                address: "",
                application_level: "",
                college_academic_year: "",
                college_semester: "",
                college_choice_1: "",
                college_choice_2: "",
                shs_grade_level: "",
                shs_strand: "",
                jhs_grade_level: "",
                gs_grade_level: "",
              });
              setInputsDisabled(true);
            }} className="text-sm px-4 py-3 rounded-lg border hover:bg-gray-50 w-full sm:w-auto">Reset</button>

            <div className="sm:ml-auto mt-2 sm:mt-0">
              <button onClick={() => setStep(2)} disabled={!areDetailsValid()} className={`flex items-center gap-2 px-6 py-3 rounded-lg ${areDetailsValid() ? "bg-green-700 text-white hover:bg-green-800" : "bg-gray-300 text-gray-600 cursor-not-allowed"} w-full sm:w-auto`}>
                <FaEye /> Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Preview */}
      {step === 2 && (
        <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-md border border-green-50">
          <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-green-800">Preview Details</h2>
          <ul className="space-y-2 text-gray-700 text-sm sm:text-base">
            <li><b>Application ID:</b> {details.application_id}</li>
            <li><b>Name:</b> {details.first_name} {details.last_name}</li>
            <li><b>Email:</b> {details.email}</li>
            <li><b>Phone:</b> {details.phone}</li>
            <li><b>Gender:</b> {details.gender}</li>
            <li><b>Date of Birth:</b> {details.date_of_birth}</li>
            <li><b>Address:</b> {details.address}</li>
            <li><b>Application Level:</b> {details.application_level || "-"}</li>

            {details.application_level === "College" && (
              <>
                <li><b>Academic Year:</b> {details.college_academic_year}</li>
                <li><b>Semester:</b> {details.college_semester}</li>
                <li><b>1st Choice:</b> {details.college_choice_1}</li>
                <li><b>2nd Choice:</b> {details.college_choice_2 || "-"}</li>
              </>
            )}

            {details.application_level === "Senior High School" && (
              <>
                <li><b>Grade Level:</b> {details.shs_grade_level}</li>
                <li><b>Strand:</b> {details.shs_strand}</li>
              </>
            )}

            {details.application_level === "Junior High School" && (
              <li><b>Grade Level:</b> {details.jhs_grade_level}</li>
            )}

            {details.application_level === "Grade School" && (
              <li><b>Grade Level:</b> {details.gs_grade_level}</li>
            )}
          </ul>

          <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6">
            <button onClick={() => setStep(1)} className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-500 text-white hover:bg-gray-600 w-full sm:w-auto"><FaArrowLeft /> Back</button>
            <button onClick={() => setStep(3)} className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-700 text-white hover:bg-green-800 w-full sm:w-auto">Proceed to Exam <FaArrowRight /></button>
          </div>
        </div>
      )}

      {/* Step 3: Exam */}
      {step === 3 && totalSections > 0 && (
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-green-800 mb-4">Section {currentSection + 1}: {currentSectionObj.title}</h2>

          <div className="space-y-6">
            {currentSectionObj.questions.map((q, idx) => renderQuestion(q, idx))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between mt-8 gap-3">
            <div className="text-sm text-gray-600">Section {currentSection + 1} of {totalSections}</div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {currentSection < totalSections - 1 ? (
                <button onClick={() => setCurrentSection((s) => s + 1)} disabled={!isCurrentSectionComplete} className={`px-6 py-3 rounded-lg flex items-center gap-2 ${isCurrentSectionComplete ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-300 text-gray-600 cursor-not-allowed"} w-full sm:w-auto`}>
                  Next Section <FaArrowRight />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={!isExamComplete || submitting} className={`flex items-center gap-2 px-6 py-3 rounded-lg ${!isExamComplete || submitting ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-yellow-500 text-white hover:bg-yellow-600"} w-full sm:w-auto`}>
                  <FaCheckCircle /> {submitting ? "Submitting..." : "Submit Exam"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md border border-green-50 text-center">
          <h3 className="text-lg sm:text-xl font-semibold text-green-800">Submission Received</h3>
          <p className="mt-3 text-gray-700">Thank you for completing the exam. Please wait for the administrator to announce the results.</p>
        </div>
      )}
    </div>
  );
}
