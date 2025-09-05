import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaUserGraduate, FaClipboardList, FaCheckCircle } from "react-icons/fa";

export default function ExamTake() {
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [details, setDetails] = useState({ first_name: "", last_name: "", email: "", phone: "", gender: "", date_of_birth: "", address: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchExam = async () => {
      setLoading(true); setError(null);
      try {
        const res = await fetch(`/api/exams/${id}`);
        if (!res.ok) throw new Error(`Failed to fetch exam (${res.status})`);
        const data = await res.json();
        if (mounted) { setExam(data); setLoading(false); }
      } catch (err) {
        console.error("Error fetching exam:", err);
        if (mounted) { setError("Unable to load exam. Please try again later."); setLoading(false); }
      }
    };
    fetchExam();
    return () => { mounted = false; };
  }, [id]);

  const handleDetailChange = (e) => { const { name, value } = e.target; setDetails((prev) => ({ ...prev, [name]: value })); };
  const handleAnswerChange = (qId, value) => setAnswers((prev) => ({ ...prev, [qId]: value }));

  // ✅ Ensure safe string always
  const safeContent = (val) => {
    if (!val) return "";

    if (typeof val === "object") {
      try {
        return JSON.stringify(val);
      } catch {
        return String(val);
      }
    }

    // Convert to string at linisin quotes
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
    const isImageQuestion = questionContent && (questionContent.startsWith("http") || questionContent.startsWith("data:image"));

    return (
      <div key={q.id} className="bg-white shadow-lg rounded-2xl p-6 border border-green-200" aria-live="polite">
        <div className="mb-4">
          <p className="text-lg font-semibold text-green-800 flex items-center gap-2"><FaClipboardList className="text-yellow-500" />Question {index + 1}</p>
          {isImageQuestion ? <img src={questionContent} alt={`Question ${index + 1}`} className="max-h-48 mx-auto mt-3 rounded border" /> : <p className="mt-2 text-gray-700 break-words">{questionContent}</p>}
        </div>

        <div className="space-y-3">
          {Array.isArray(q.answers) && q.answers.length > 0 ? q.answers.map((a) => {
            const answerContent = safeContent(a.final_content);
            const isImageAnswer = answerContent && (answerContent.startsWith("http") || answerContent.startsWith("data:image"));

            return (
              <label key={a.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-green-50 cursor-pointer">
                <input type="radio" name={`question-${q.id}`} value={a.id} checked={String(answers[q.id] || "") === String(a.id)} onChange={() => handleAnswerChange(q.id, a.id)} className="h-4 w-4 text-green-600" aria-label={`Select answer for question ${index + 1}`} />
                {isImageAnswer ? <img src={answerContent} alt={`Answer for question ${index + 1}`} className="max-h-20 rounded border" /> : <span className="text-gray-700 break-words">{answerContent || "No content"}</span>}
              </label>
            );
          }) : <div className="text-sm text-gray-500">No answers available for this question.</div>}
        </div>
      </div>
    );
  };

  const questions = exam ? (exam.sections_enabled ? (Array.isArray(exam.sections) ? exam.sections.flatMap((s) => Array.isArray(s.questions) ? s.questions : []) : []) : (Array.isArray(exam.questions) ? exam.questions : [])) : [];
  const totalQuestions = questions.length;

  const canStartExam = () => details.first_name.trim() && details.last_name.trim() && details.email.trim();
  const startExam = () => { if (!canStartExam()) { alert("Please fill in First Name, Last Name, and Email to start the exam."); return; } setStep(2); setCurrentQuestion(0); setAnswers({}); };

  const handleSubmit = async () => {
    if (submitting) return;
    const unanswered = questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      const proceed = window.confirm(`You have ${unanswered.length} unanswered question(s). Do you want to submit anyway?`);
      if (!proceed) return;
    }

    setSubmitting(true);
    try {
      const payload = { details, answers };
      const res = await fetch(`/api/exams/${id}/submit`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Submit failed (${res.status}): ${txt}`);
      }
      const result = await res.json();
      alert(`Thank you! Your score: ${result.score ?? "N/A"} / ${result.max_score ?? "N/A"}`);
      setStep(3);
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to submit exam. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading exam...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!exam) return <div className="p-6">Exam not found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 text-gray-900 mt-12">
      <div className="text-center mb-10">
        <FaUserGraduate className="text-green-700 text-6xl mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-green-800 uppercase">Entrance Examination</h1>
        <h2 className="text-lg font-semibold text-yellow-600 mt-2">San Pablo Colleges</h2>
        <p className="text-sm text-gray-600 italic">Office of Student Affairs and Services – “Building dreams, shaping futures.”</p>
      </div>

      {step === 1 && (
        <div className="bg-white p-6 rounded-2xl shadow-md border border-green-200">
          <h2 className="text-xl font-semibold mb-4 text-green-800 flex items-center gap-2"><FaUserGraduate className="text-yellow-500" />Examinee Details</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="first_name" placeholder="First Name" value={details.first_name} onChange={handleDetailChange} className="border rounded-lg p-2 w-full" />
              <input name="last_name" placeholder="Last Name" value={details.last_name} onChange={handleDetailChange} className="border rounded-lg p-2 w-full" />
            </div>
            <input name="email" placeholder="Email" type="email" value={details.email} onChange={handleDetailChange} className="border rounded-lg p-2 w-full" />
            <input name="phone" placeholder="Phone" value={details.phone} onChange={handleDetailChange} className="border rounded-lg p-2 w-full" />
            <select name="gender" value={details.gender} onChange={handleDetailChange} className="border rounded-lg p-2 w-full"><option value="">Select Gender</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select>
            <input name="date_of_birth" type="date" value={details.date_of_birth} onChange={handleDetailChange} className="border rounded-lg p-2 w-full" />
            <textarea name="address" placeholder="Address" value={details.address} onChange={handleDetailChange} className="border rounded-lg p-2 w-full" />
          </div>

          <button onClick={startExam} disabled={!canStartExam()} className={`mt-6 px-6 py-2 rounded-lg w-full md:w-auto ${canStartExam() ? "bg-green-700 text-white hover:bg-green-800" : "bg-gray-300 text-gray-600 cursor-not-allowed"}`}>Start Exam</button>
        </div>
      )}

      {step === 2 && totalQuestions > 0 && (
        <div>
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-1"><span>Question {currentQuestion + 1} of {totalQuestions}</span><span>{Math.round(((currentQuestion + 1) / totalQuestions) * 100)}%</span></div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: `${((currentQuestion + 1) / Math.max(1, totalQuestions)) * 100}%` }} />
            </div>
          </div>

          <div>{renderQuestion(questions[currentQuestion], currentQuestion)}</div>

          <div className="flex justify-between mt-6">
            <button disabled={currentQuestion === 0} onClick={() => setCurrentQuestion((p) => Math.max(0, p - 1))} className={`px-4 py-2 rounded-lg ${currentQuestion === 0 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-gray-600 text-white hover:bg-gray-700"}`}>Previous</button>

            {currentQuestion < totalQuestions - 1 ? (
              <button onClick={() => setCurrentQuestion((p) => Math.min(totalQuestions - 1, p + 1))} className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800">Next</button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting} className={`flex items-center gap-2 px-6 py-2 rounded-lg ${submitting ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-yellow-500 text-white hover:bg-yellow-600"}`}><FaCheckCircle />{submitting ? "Submitting..." : "Submit Exam"}</button>
            )}
          </div>
        </div>
      )}

      {step === 2 && totalQuestions === 0 && <div className="bg-white p-6 rounded-2xl shadow-md border border-red-200 text-center"><p className="text-red-600">This exam has no questions configured.</p></div>}

      {step === 3 && <div className="bg-white p-6 rounded-2xl shadow-md border border-green-200 text-center"><h3 className="text-xl font-semibold text-green-800">Submission received</h3><p className="mt-3 text-gray-700">Thank you for completing the exam. You may close this window or return to the dashboard.</p></div>}
    </div>
  );
}
