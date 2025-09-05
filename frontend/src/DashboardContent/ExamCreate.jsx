import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiPlus, FiTrash2, FiChevronUp, FiChevronDown } from "react-icons/fi";

export default function ExamCreate() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([]);
  const [sectionsEnabled, setSectionsEnabled] = useState(false);
  const [sections, setSections] = useState([]);
  const [exams, setExams] = useState([]);

  function uid(prefix = "id") {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  const makeQuestion = (presetType = "text") => ({
    id: uid("q"),
    type: presetType,
    content: "",
    contentPreview: null,
    points: 1,
    answers: [
      { id: uid("a"), type: "text", content: "", contentPreview: null, isCorrect: false },
    ],
  });

  const addQuestion = (sectionId = null, presetType = "text") => {
    const q = makeQuestion(presetType);
    if (sectionsEnabled) {
      setSections((s) => s.map((sec) => (sec.id === sectionId ? { ...sec, questions: [...sec.questions, q] } : sec)));
    } else {
      setQuestions((s) => [...s, q]);
    }
  };

  const updateQuestion = (qid, patch, sectionId = null) => {
    if (sectionsEnabled) {
      setSections((s) => s.map((sec) => ({ ...sec, questions: sec.questions.map((q) => (q.id === qid ? { ...q, ...patch } : q)) })));
    } else {
      setQuestions((s) => s.map((q) => (q.id === qid ? { ...q, ...patch } : q)));
    }
  };

  const removeQuestion = (qid, sectionId = null) => {
    if (sectionsEnabled) {
      setSections((s) => s.map((sec) => ({ ...sec, questions: sec.questions.filter((q) => q.id !== qid) })));
    } else {
      setQuestions((s) => s.filter((q) => q.id !== qid));
    }
  };

  const addAnswer = (qid, sectionId = null) => {
    const ans = { id: uid("a"), type: "text", content: "", contentPreview: null, isCorrect: false };
    if (sectionsEnabled) {
      setSections((s) => s.map((sec) => ({ ...sec, questions: sec.questions.map((q) => (q.id === qid ? { ...q, answers: [...q.answers, ans] } : q)) })));
    } else {
      setQuestions((s) => s.map((q) => (q.id === qid ? { ...q, answers: [...q.answers, ans] } : q)));
    }
  };

  const updateAnswer = (qid, aid, patch, sectionId = null) => {
    if (sectionsEnabled) {
      setSections((s) => s.map((sec) => ({ ...sec, questions: sec.questions.map((q) => (q.id === qid ? { ...q, answers: q.answers.map((a) => (a.id === aid ? { ...a, ...patch } : a)) } : q)) })));
    } else {
      setQuestions((s) => s.map((q) => (q.id === qid ? { ...q, answers: q.answers.map((a) => (a.id === aid ? { ...a, ...patch } : a)) } : q)));
    }
  };

  const removeAnswer = (qid, aid, sectionId = null) => {
    if (sectionsEnabled) {
      setSections((s) => s.map((sec) => ({ ...sec, questions: sec.questions.map((q) => (q.id === qid ? { ...q, answers: q.answers.filter((a) => a.id !== aid) } : q)) })));
    } else {
      setQuestions((s) => s.map((q) => (q.id === qid ? { ...q, answers: q.answers.filter((a) => a.id !== aid) } : q)));
    }
  };

  const addSection = (title = "New Section") => {
    const sec = { id: uid("s"), title, questions: [] };
    setSections((s) => [...s, sec]);
  };

  const updateSectionTitle = (sid, newTitle) => {
    setSections((s) => s.map((sec) => (sec.id === sid ? { ...sec, title: newTitle } : sec)));
  };

  const removeSection = (sid) => {
    setSections((s) => {
      const idx = s.findIndex((x) => x.id === sid);
      if (idx === -1) return s;
      const toMove = s[idx].questions;
      const copy = [...s.slice(0, idx), ...s.slice(idx + 1)];
      if (copy.length === 0) return copy;
      const targetIdx = Math.max(0, idx - 1);
      copy[targetIdx] = { ...copy[targetIdx], questions: [...copy[targetIdx].questions, ...toMove] };
      return copy;
    });
  };

  const moveSection = (index, direction) => {
    setSections((s) => {
      const n = [...s];
      const to = index + direction;
      if (to < 0 || to >= n.length) return s;
      const [item] = n.splice(index, 1);
      n.splice(to, 0, item);
      return n;
    });
  };

  const moveQuestionInSection = (sectionIdx, qIdx, direction) => {
    setSections((s) => {
      const copy = JSON.parse(JSON.stringify(s));
      const sec = copy[sectionIdx];
      if (!sec) return s;
      const to = qIdx + direction;
      if (to >= 0 && to < sec.questions.length) {
        const [item] = sec.questions.splice(qIdx, 1);
        sec.questions.splice(to, 0, item);
        return copy;
      }
      if (direction === -1 && qIdx === 0 && sectionIdx > 0) {
        const [item] = sec.questions.splice(qIdx, 1);
        copy[sectionIdx - 1].questions.push(item);
        return copy;
      }
      if (direction === 1 && qIdx === sec.questions.length - 1 && sectionIdx < copy.length - 1) {
        const [item] = sec.questions.splice(qIdx, 1);
        copy[sectionIdx + 1].questions.unshift(item);
        return copy;
      }
      return s;
    });
  };

  const fetchExams = async () => {
    try {
      const res = await fetch("/api/exams");
      const data = await res.json();
      setExams(data);
    } catch (err) {
      console.error("Failed to fetch exams:", err);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

const saveExam = async () => {
  let allQuestions = [];

  if (sectionsEnabled) {
    sections.forEach((sec, secIndex) => {
      sec.questions.forEach((q, qIndex) => {
        allQuestions.push({
          type: q.type,
          content: q.type === "text" ? (q.content || "") : (q.content || null),
          content_preview: q.type === "figure" ? (q.contentPreview || null) : null,
          points: q.points || 1,
          order: qIndex,
          section_id: sec.id,
          answers: q.answers.map((a) => ({
            type: a.type,
            content: a.type === "text" ? (a.content || "") : (a.content || null),
            content_preview: a.type === "figure" ? (a.contentPreview || null) : null,
            is_correct: a.isCorrect || false,
          })),
        });
      });
    });
  } else {
    questions.forEach((q, qIndex) => {
      allQuestions.push({
        type: q.type,
        content: q.type === "text" ? (q.content || "") : (q.content || null),
        content_preview: q.type === "figure" ? (q.contentPreview || null) : null,
        points: q.points || 1,
        order: qIndex,
        section_id: null,
        answers: q.answers.map((a) => ({
          type: a.type,
          content: a.type === "text" ? (a.content || "") : (a.content || null),
          content_preview: a.type === "figure" ? (a.contentPreview || null) : null,
          is_correct: a.isCorrect || false,
        })),
      });
    });
  }

  const payload = {
    title,
    description,
    sectionsEnabled,
    sections,
    questions: allQuestions,
  };

  try {
    await axios.post("/api/exams", payload, {
      headers: { "Content-Type": "application/json" },
    });
    alert("Exam saved to backend!");
    fetchExams();
  } catch (error) {
    console.error("Save failed:", error);
    alert("Failed to save exam. Check console for details.");
  }
};


// Upload helper
const uploadFile = async (file) => {
  if (!file) return null;

  const fd = new FormData();
  fd.append("file", file);

  try {
    const res = await fetch("/api/upload", { method: "POST", body: fd });

    // If response is not OK, read text (could be HTML error page)
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Upload failed: ${text}`);
    }

    const data = await res.json();
    return data.url; // returns the uploaded file URL
  } catch (err) {
    console.error("Upload error", err);
    alert("Image upload failed. Check console for details.");
    return null;
  }
};


// Handle file selection for questions
const handleFileSelectForQuestion = async (file, qid, sectionId = null) => {
  const url = await uploadFile(file);
  if (!url) return;

  updateQuestion(qid, { content: url, contentPreview: url }, sectionId);
};

// Handle file selection for answers
const handleFileSelectForAnswer = async (file, qid, aid, sectionId = null) => {
  const url = await uploadFile(file);
  if (!url) return;

  updateAnswer(qid, aid, { content: url, contentPreview: url }, sectionId);
};


  // toggle sections on/off
  const toggleSections = (enable) => {
    if (enable) {
      const sec = { id: uid("s"), title: "Section 1", questions: [...questions] };
      setSections([sec]);
      setQuestions([]);
      setSectionsEnabled(true);
    } else {
      const flat = sections.reduce((acc, sec) => [...acc, ...sec.questions], []);
      setQuestions(flat);
      setSections([]);
      setSectionsEnabled(false);
    }
  };

  const toggleStatus = async (id) => {
    try {
      await fetch(`/api/exams/${id}/toggle-status`, { method: "PATCH" });
      fetchExams();
    } catch (err) {
      console.error("Toggle failed:", err);
    }
  };

  const deleteExam = async (id) => {
    if (!window.confirm("Delete this exam?")) return;
    try {
      await fetch(`/api/exams/${id}`, { method: "DELETE" });
      fetchExams();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const totalQuestionsCount = sectionsEnabled ? sections.reduce((acc, s) => acc + (s.questions?.length || 0), 0) : questions.length;
  const totalPoints = sectionsEnabled ? sections.reduce((acc, s) => acc + s.questions.reduce((ps, q) => ps + Number(q.points || 0), 0), 0) : questions.reduce((ps, q) => ps + Number(q.points || 0), 0);

  return (
    <div className="min-h-screen p-6 text-slate-900">
      <div className="mx-auto w-full max-w-7xl">
        <div className="rounded-2xl bg-white shadow-md overflow-hidden">
          <div style={{ background: `linear-gradient(90deg, rgba(212,175,55,0.12), rgba(212,175,55,0.04))` }} className="border-b border-gray-100 p-4">
            <div className="flex items-center justify-between gap-5">
              <div>
                <input placeholder="Exam Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-md border border-gray-200 bg-white p-3 text-xl font-semibold placeholder-slate-400 focus:ring-2 focus:ring-[#FCEFC7]" />
                <input placeholder="Short description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-2 w-full rounded-md border border-gray-100 bg-white p-2 text-sm placeholder-slate-400" />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => addQuestion(null, "text")} className="inline-flex items-center gap-2 rounded-lg bg-[#16A34A] px-4 py-2 text-sm font-medium text-white hover:bg-green-600 shadow" title="Add question">
                  <FiPlus /> Add
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 p-6">
            <div className="col-span-2">
              {!sectionsEnabled && questions.length === 0 && (
                <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-slate-500">No questions yet — click <strong className="text-slate-700">Add</strong> or enable sections.</div>
              )}

              {!sectionsEnabled && questions.length > 0 && (
                <ul className="divide-y">
                  {questions.map((q, qi) => (
                    <li key={q.id} className="py-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 flex-shrink-0">
                          <div className="rounded-full bg-[#F8F7F3] px-3 py-2 text-xs font-semibold text-[#D4AF37]">Q{qi + 1}</div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <select value={q.type} onChange={(e) => updateQuestion(q.id, { type: e.target.value, content: "", contentPreview: null })} className="rounded-md border p-1 text-sm" title="Question type">
                                <option value="text">Text</option>
                                <option value="figure">Figure</option>
                              </select>

                              <div className="text-sm text-slate-500">Points</div>
                              <input type="number" min={0} value={q.points} onChange={(e) => updateQuestion(q.id, { points: Number(e.target.value) })} className="w-20 rounded-md border p-1 text-sm" />
                            </div>

                            <div className="flex items-center gap-2">
                              <button onClick={() => removeQuestion(q.id)} className="rounded-md px-2 py-1 text-sm text-red-600 hover:bg-red-50" title="Delete question"><FiTrash2 /></button>
                            </div>
                          </div>

                          <div className="mt-3">
                            {q.type === "text" ? (
                              <textarea value={q.content} onChange={(e) => updateQuestion(q.id, { content: e.target.value })} placeholder="Enter the question text" rows={3} className="w-full rounded-md border p-3 text-sm" />
                            ) : (
                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                                <div className="col-span-3">
                                  <label className="block text-sm text-slate-700">Upload image for question</label>
                                  <input type="file" accept="image/*" onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    await handleFileSelectForQuestion(file, q.id);
                                  }} className="mt-1 text-sm" />
                                </div>
                                <div className="flex items-center justify-center">
                                  {q.contentPreview ? (
                                    <img src={q.contentPreview} alt={`Question ${qi + 1}`} className="h-28 w-auto rounded-md border" />
                                  ) : (
                                    <div className="h-28 w-full rounded-md border bg-gray-50 p-2 text-xs text-slate-400 flex items-center justify-center">No image</div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="mt-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium text-slate-700">Answers</div>
                              <div className="flex items-center gap-2">
                                <button onClick={() => addAnswer(q.id)} className="inline-flex items-center gap-2 rounded-md bg-[#ECFDF5] px-2 py-1 text-sm text-[#16A34A] hover:bg-[#DFF6E8]"><FiPlus /> Add</button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              {q.answers.map((a, ai) => (
                                <div key={a.id} className="flex items-center gap-3">
                                  <input type="checkbox" checked={a.isCorrect} onChange={(e) => updateAnswer(q.id, a.id, { isCorrect: e.target.checked })} className="h-4 w-4" aria-label={`Mark answer ${ai + 1} correct`} />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <select value={a.type} onChange={(e) => updateAnswer(q.id, a.id, { type: e.target.value, content: "", contentPreview: null })} className="rounded-md border p-1 text-sm">
                                        <option value="text">Text</option>
                                        <option value="figure">Figure</option>
                                      </select>

                                      {a.type === "text" ? (
                                        <input value={a.content} placeholder="Answer text" onChange={(e) => updateAnswer(q.id, a.id, { content: e.target.value })} className="w-full rounded-md border p-2 text-sm" />
                                      ) : (
                                        <div className="flex items-center gap-3">
                                          <input type="file" accept="image/*" onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            await handleFileSelectForAnswer(file, q.id, a.id);
                                          }} className="text-sm" />
                                          <div className="h-16 w-24 overflow-hidden rounded-md border bg-gray-50 p-1">
                                            {a.contentPreview ? <img src={a.contentPreview} alt={`Answer ${ai + 1}`} className="h-full w-auto object-contain" /> : <div className="flex h-full items-center justify-center text-xs text-slate-400">No image</div>}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button onClick={() => removeAnswer(q.id, a.id)} className="rounded-md px-2 py-1 text-sm text-red-600 hover:bg-red-50" title="Remove answer"><FiTrash2 /></button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {sectionsEnabled && (
                <div className="space-y-4">
                  {sections.map((sec, si) => (
                    <section key={sec.id} className="rounded-md border border-gray-100 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input value={sec.title} onChange={(e) => updateSectionTitle(sec.id, e.target.value)} className="rounded-md border p-2 text-sm" />
                          <div className="text-sm text-slate-500">({sec.questions.length} questions)</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button onClick={() => moveSection(si, -1)} className="p-1 hover:bg-gray-100 rounded-md" title="Move section up"><FiChevronUp /></button>
                          <button onClick={() => moveSection(si, 1)} className="p-1 hover:bg-gray-100 rounded-md" title="Move section down"><FiChevronDown /></button>
                          <button onClick={() => removeSection(sec.id)} className="rounded-md px-2 py-1 text-sm text-red-600 hover:bg-red-50">Remove</button>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        {sec.questions.map((q, qi) => (
                          <div key={q.id} className="border-b last:border-b-0 pb-4">
                            <div className="flex items-start gap-3">
                              <div className="w-10 flex-shrink-0 text-sm font-semibold text-[#16A34A]">{si + 1}.{qi + 1}</div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <select value={q.type} onChange={(e) => updateQuestion(q.id, { type: e.target.value, content: "", contentPreview: null }, sec.id)} className="rounded-md border p-1 text-sm">
                                      <option value="text">Text</option>
                                      <option value="figure">Figure</option>
                                    </select>
                                    <div className="text-sm text-slate-500">Points</div>
                                    <input type="number" min={0} value={q.points} onChange={(e) => updateQuestion(q.id, { points: Number(e.target.value) }, sec.id)} className="w-20 rounded-md border p-1 text-sm" />
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button onClick={() => moveQuestionInSection(si, qi, -1)} className="p-1 hover:bg-gray-100 rounded-md" title="Move up"><FiChevronUp /></button>
                                    <button onClick={() => moveQuestionInSection(si, qi, 1)} className="p-1 hover:bg-gray-100 rounded-md" title="Move down"><FiChevronDown /></button>
                                    <button onClick={() => removeQuestion(q.id, sec.id)} className="rounded-md px-2 py-1 text-sm text-red-600 hover:bg-red-50">Delete</button>
                                  </div>
                                </div>

                                <div className="mt-2">
                                  {q.type === "text" ? (
                                    <textarea value={q.content} onChange={(e) => updateQuestion(q.id, { content: e.target.value }, sec.id)} placeholder="Enter the question text" rows={3} className="w-full rounded-md border p-3 text-sm" />
                                  ) : (
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                                      <div className="col-span-3">
                                        <label className="block text-sm text-slate-700">Upload image for question</label>
                                        <input type="file" accept="image/*" onChange={async (e) => {
                                          const file = e.target.files?.[0];
                                          if (!file) return;
                                          await handleFileSelectForQuestion(file, q.id, sec.id);
                                        }} className="mt-1 text-sm" />
                                      </div>
                                      <div className="flex items-center justify-center">
                                        {q.contentPreview ? <img src={q.contentPreview} alt={`Question ${qi + 1}`} className="h-28 w-auto rounded-md border" /> : <div className="h-28 w-full rounded-md border bg-gray-50 p-2 text-xs text-slate-400 flex items-center justify-center">No image</div>}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="mt-3 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium text-slate-700">Answers</div>
                                    <div className="flex items-center gap-2">
                                      <button onClick={() => addAnswer(q.id, sec.id)} className="inline-flex items-center gap-2 rounded-md bg-[#ECFDF5] px-2 py-1 text-sm text-[#16A34A] hover:bg-[#DFF6E8]"><FiPlus /> Add</button>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    {q.answers.map((a, ai) => (
                                      <div key={a.id} className="flex items-center gap-3">
                                        <input type="checkbox" checked={a.isCorrect} onChange={(e) => updateAnswer(q.id, a.id, { isCorrect: e.target.checked }, sec.id)} className="h-4 w-4" aria-label={`Mark answer ${ai + 1} correct`} />
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <select value={a.type} onChange={(e) => updateAnswer(q.id, a.id, { type: e.target.value, content: "", contentPreview: null }, sec.id)} className="rounded-md border p-1 text-sm">
                                              <option value="text">Text</option>
                                              <option value="figure">Figure</option>
                                            </select>
                                            {a.type === "text" ? (
                                              <input value={a.content} placeholder="Answer text" onChange={(e) => updateAnswer(q.id, a.id, { content: e.target.value }, sec.id)} className="w-full rounded-md border p-2 text-sm" />
                                            ) : (
                                              <div className="flex items-center gap-3">
                                                <input type="file" accept="image/*" onChange={async (e) => {
                                                  const file = e.target.files?.[0];
                                                  if (!file) return;
                                                  await handleFileSelectForAnswer(file, q.id, a.id, sec.id);
                                                }} className="text-sm" />
                                                <div className="h-16 w-24 overflow-hidden rounded-md border bg-gray-50 p-1">
                                                  {a.contentPreview ? <img src={a.contentPreview} alt={`Answer ${ai + 1}`} className="h-full w-auto object-contain" /> : <div className="flex h-full items-center justify-center text-xs text-slate-400">No image</div>}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <button onClick={() => removeAnswer(q.id, a.id, sec.id)} className="rounded-md px-2 py-1 text-sm text-red-600 hover:bg-red-50" title="Remove answer"><FiTrash2 /></button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        <div className="mt-3">
                          <button onClick={() => addQuestion(sec.id, "text")} className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm">+ Add question to section</button>
                        </div>
                      </div>
                    </section>
                  ))}

                  <div className="flex gap-2">
                    <button onClick={() => addSection(`Section ${sections.length + 1}`)} className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm">+ Add Section</button>
                  </div>
                </div>
              )}
            </div>

            <aside className="space-y-4">
              <div className="rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">Exam settings</div>
                    <div className="text-xs text-slate-500">Basic info & quick validation</div>
                  </div>
                </div>

                <div className="mt-3 space-y-3 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <div>Use sections</div>
                    <div>
                      <input type="checkbox" checked={sectionsEnabled} onChange={(e) => toggleSections(e.target.checked)} />
                    </div>
                  </div>

                  <div>Total questions: <strong className="text-slate-900">{totalQuestionsCount}</strong></div>
                  <div>Total points: <strong className="text-slate-900">{totalPoints}</strong></div>

                  <div className="pt-2">
                    <button onClick={() => {
                      const invalid = sectionsEnabled ? sections.some((sec) => sec.questions.some((q) => q.answers.every((a) => !a.isCorrect))) : questions.some((q) => q.answers.every((a) => !a.isCorrect));
                      if (invalid) { alert("Validation: every question must have at least one correct answer."); return; }
                      alert("Validation passed — exam ready to export.");
                    }} className="w-full rounded-md bg-[#16A34A] px-3 py-2 text-sm font-medium text-white hover:bg-green-600">Validate</button>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <div className="border-t border-gray-100 p-4 flex justify-end">
            <button onClick={saveExam} className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-10 py-2 text-sm font-medium text-white hover:bg-green-700 shadow">Save</button>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">All Exams</h2>
          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left">Title</th>
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 text-left">Created</th>
                  <th className="px-4 py-2 text-left">Link</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr key={exam.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{exam.title}</td>
                    <td className="px-4 py-2">{exam.description || "—"}</td>
                    <td className="px-4 py-2">{new Date(exam.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-2"><a href={`/exam/${exam.id}`} className="text-blue-600 hover:underline">View</a></td>
                    <td className="px-4 py-2"><span className={`px-2 py-1 text-xs rounded-full ${exam.status === "open" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>{exam.status}</span></td>
                    <td className="px-4 py-2 flex gap-2">
                      <button onClick={() => toggleStatus(exam.id)} className="px-3 py-1 text-xs rounded bg-yellow-500 text-white hover:bg-yellow-600">Toggle</button>
                      <button onClick={() => deleteExam(exam.id)} className="px-3 py-1 text-xs rounded bg-red-500 text-white hover:bg-red-600">Delete</button>
                    </td>
                  </tr>
                ))}
                {exams.length === 0 && (
                  <tr><td colSpan="6" className="px-4 py-4 text-center text-gray-500">No exams found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
