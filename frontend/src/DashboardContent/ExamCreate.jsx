import React, { useState } from "react";
import { FiPlus, FiTrash2, FiFileText, FiDownload, FiChevronUp, FiChevronDown, FiEye, FiEdit3 } from "react-icons/fi";

// ExamCreate.modified.jsx
// Modernized UI: white / gold / green theme. Single main card container (no individual card backgrounds for every question).
// - Gold accent header bar
// - Primary actions green, highlights gold
// - Questions are list items with subtle dividers instead of full white cards
// - Sidebar kept compact and readable
// - Uses Tailwind CSS utility classes

export default function ExamCreate() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([]);
  const [sectionsEnabled, setSectionsEnabled] = useState(false);
  const [sections, setSections] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);

  function uid(prefix = "id") {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  const makeQuestion = (presetType = "text") => ({
    id: uid("q"),
    type: presetType,
    content: "",
    contentPreview: null,
    points: 1,
    answers: [{ id: uid("a"), type: "text", content: "", contentPreview: null, isCorrect: false }],
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
      setSections((s) => s.map((sec) => ({
        ...sec,
        questions: sec.questions.map((q) => (q.id === qid ? { ...q, ...patch } : q)),
      })));
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
      setSections((s) => s.map((sec) => ({
        ...sec,
        questions: sec.questions.map((q) => (q.id === qid ? { ...q, answers: [...q.answers, ans] } : q)),
      })));
    } else {
      setQuestions((s) => s.map((q) => (q.id === qid ? { ...q, answers: [...q.answers, ans] } : q)));
    }
  };

  const updateAnswer = (qid, aid, patch, sectionId = null) => {
    if (sectionsEnabled) {
      setSections((s) => s.map((sec) => ({
        ...sec,
        questions: sec.questions.map((q) => (q.id === qid ? { ...q, answers: q.answers.map((a) => (a.id === aid ? { ...a, ...patch } : a)) } : q)),
      })));
    } else {
      setQuestions((s) => s.map((q) => (q.id === qid ? { ...q, answers: q.answers.map((a) => (a.id === aid ? { ...a, ...patch } : a)) } : q)));
    }
  };

  const removeAnswer = (qid, aid, sectionId = null) => {
    if (sectionsEnabled) {
      setSections((s) => s.map((sec) => ({
        ...sec,
        questions: sec.questions.map((q) => (q.id === qid ? { ...q, answers: q.answers.filter((a) => a.id !== aid) } : q)),
      })));
    } else {
      setQuestions((s) => s.map((q) => (q.id === qid ? { ...q, answers: q.answers.filter((a) => a.id !== aid) } : q)));
    }
  };

  const handleFileInput = (file, cb) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => cb(e.target.result);
    reader.readAsDataURL(file);
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

  const exportJSON = () => {
    const payload = {
      title,
      description,
      sectionsEnabled,
      createdAt: new Date().toISOString(),
      questions: sectionsEnabled ? sections : questions,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (title || "exam").split(" ").filter(Boolean).join("_") + ".json";
    a.click();
    URL.revokeObjectURL(url);
  };

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

  // new visual helpers
  const gold = "#D4AF37"; // accent
  const green = "#16A34A";

  return (
    <div className="min-h-screen p-6 text-slate-900">
      <div className="mx-auto w-full max-w-7xl">
        {/* MAIN WHITE CARD */}
        <div className="rounded-2xl bg-white shadow-md overflow-hidden">
          {/* gold accent bar */}
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

                <button onClick={() => setPreviewMode((p) => !p)} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:shadow" title="Toggle preview">
                  {previewMode ? <FiEdit3 /> : <FiEye />} {previewMode ? "Edit" : "Preview"}
                </button>

                <button onClick={exportJSON} className="inline-flex items-center gap-2 rounded-lg border border-[#D4AF37] bg-white px-3 py-2 text-sm font-medium text-[#D4AF37] hover:bg-[#fffaf0]" title="Export exam as JSON">
                  <FiDownload /> Export
                </button>
              </div>
            </div>
          </div>

          {/* body: 2 columns */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 p-6">
            {/* main column (questions) */}
            <div className="col-span-2">
              {/* if empty */}
              {!sectionsEnabled && questions.length === 0 && (
                <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-slate-500">No questions yet — click <strong className="text-slate-700">Add</strong> or enable sections.</div>
              )}

              {/* questions list inside main card (no separate heavy bg per question) */}
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
                                  <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; handleFileInput(file, (dataUrl) => updateQuestion(q.id, { contentPreview: dataUrl })); }} className="mt-1 text-sm" />
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
                                          <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; handleFileInput(file, (dataUrl) => updateAnswer(q.id, a.id, { contentPreview: dataUrl })); }} className="text-sm" />
                                          <div className="h-16 w-24 overflow-hidden rounded-md border bg-gray-50 p-1">{a.contentPreview ? <img src={a.contentPreview} alt={`Answer ${ai + 1}`} className="h-full w-auto object-contain" /> : <div className="flex h-full items-center justify-center text-xs text-slate-400">No image</div>}</div>
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

              {/* Sections UI (kept similar but visually lighter) */}
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
                                        <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; handleFileInput(file, (dataUrl) => updateQuestion(q.id, { contentPreview: dataUrl }, sec.id)); }} className="mt-1 text-sm" />
                                      </div>
                                      <div className="flex items-center justify-center">{q.contentPreview ? <img src={q.contentPreview} alt={`Question ${qi + 1}`} className="h-28 w-auto rounded-md border" /> : <div className="h-28 w-full rounded-md border bg-gray-50 p-2 text-xs text-slate-400 flex items-center justify-center">No image</div>}</div>
                                    </div>
                                  )}
                                </div>

                                <div className="mt-3 space-y-2">
                                  <div className="flex items-center justify-between"><div className="text-sm font-medium text-slate-700">Answers</div><div className="flex items-center gap-2"><button onClick={() => addAnswer(q.id, sec.id)} className="inline-flex items-center gap-2 rounded-md bg-[#ECFDF5] px-2 py-1 text-sm text-[#16A34A] hover:bg-[#DFF6E8]"><FiPlus /> Add</button></div></div>

                                  <div className="space-y-2">{q.answers.map((a, ai) => (<div key={a.id} className="flex items-center gap-3"><input type="checkbox" checked={a.isCorrect} onChange={(e) => updateAnswer(q.id, a.id, { isCorrect: e.target.checked }, sec.id)} className="h-4 w-4" aria-label={`Mark answer ${ai + 1} correct`} /><div className="flex-1"><div className="flex items-center gap-2"><select value={a.type} onChange={(e) => updateAnswer(q.id, a.id, { type: e.target.value, content: "", contentPreview: null }, sec.id)} className="rounded-md border p-1 text-sm"><option value="text">Text</option><option value="figure">Figure</option></select>{a.type === "text" ? (<input value={a.content} placeholder="Answer text" onChange={(e) => updateAnswer(q.id, a.id, { content: e.target.value }, sec.id)} className="w-full rounded-md border p-2 text-sm" />) : (<div className="flex items-center gap-3"><input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; handleFileInput(file, (dataUrl) => updateAnswer(q.id, a.id, { contentPreview: dataUrl }, sec.id)); }} className="text-sm" /><div className="h-16 w-24 overflow-hidden rounded-md border bg-gray-50 p-1">{a.contentPreview ? <img src={a.contentPreview} alt={`Answer ${ai + 1}`} className="h-full w-auto object-contain" /> : <div className="flex h-full items-center justify-center text-xs text-slate-400">No image</div>}</div></div>)}</div></div><div className="flex items-center gap-2"><button onClick={() => removeAnswer(q.id, a.id, sec.id)} className="rounded-md px-2 py-1 text-sm text-red-600 hover:bg-red-50" title="Remove answer"><FiTrash2 /></button></div></div>))}</div>
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

            {/* sidebar */}
            <aside className="space-y-4">
              <div className="rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">Exam settings</div>
                    <div className="text-xs text-slate-500">Basic info & quick validation</div>
                  </div>
                </div>

                <div className="mt-3 space-y-3 text-sm text-slate-600">
                  <div className="flex items-center justify-between"><div>Use sections</div><div><input type="checkbox" checked={sectionsEnabled} onChange={(e) => toggleSections(e.target.checked)} /></div></div>

                  <div>Total questions: <strong className="text-slate-900">{sectionsEnabled ? sections.reduce((acc, s) => acc + s.questions.length, 0) : questions.length}</strong></div>
                  <div>Total points: <strong className="text-slate-900">{(sectionsEnabled ? sections.reduce((acc, s) => acc + s.questions.reduce((ps, q) => ps + Number(q.points || 0), 0), 0) : questions.reduce((ps, q) => ps + Number(q.points || 0), 0))}</strong></div>

                  <div className="pt-2">
                    <button onClick={() => { const invalid = (sectionsEnabled ? sections.some((sec) => sec.questions.some((q) => q.answers.every((a) => !a.isCorrect))) : questions.some((q) => q.answers.every((a) => !a.isCorrect))); if (invalid) { alert("Validation: every question must have at least one correct answer."); return; } alert("Validation passed — exam ready to export."); }} className="w-full rounded-md bg-[#16A34A] px-3 py-2 text-sm font-medium text-white hover:bg-green-600">Validate</button>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="text-sm font-semibold text-slate-800">Tips</div>
                <ul className="mt-2 list-inside list-disc text-sm text-slate-600">
                  <li>Enable sections to group questions (e.g., Test 1, Test 2).</li>
                  <li>When you disable sections, all questions are flattened into a single list.</li>
                  <li>Use preview mode to check final layout.</li>
                </ul>
              </div>
            </aside>
          </div>

          {/* preview modal */}
          {previewMode && (
            <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/40 p-6">
              <div className="mx-auto w-full max-w-4xl rounded-2xl bg-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Preview — {title || "Untitled Exam"}</h2>
                    <p className="text-sm text-slate-600">{description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPreviewMode(false)} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm">Close</button>
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  {!sectionsEnabled && questions.map((q, i) => (
                    <div key={q.id} className="rounded-lg border p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 flex-shrink-0 text-sm font-semibold text-[#16A34A]">{i + 1}.</div>
                        <div className="flex-1">
                          <div className="text-sm text-slate-800">{q.type === "text" ? q.content : <img src={q.contentPreview} alt={`Q${i + 1}`} className="max-h-48 w-auto" />}</div>

                          <div className="mt-3 space-y-2">{q.answers.map((a, ai) => (<div key={a.id} className="flex items-center gap-3"><input type="checkbox" disabled className="h-4 w-4" /><div className="text-sm text-slate-700">{a.type === "text" ? a.content : <img src={a.contentPreview} alt={`A${ai + 1}`} className="h-16 w-auto" />}</div></div>))}</div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {sectionsEnabled && sections.map((sec, si) => (
                    <div key={sec.id} className="space-y-3">
                      <div className="text-md font-semibold">{sec.title}</div>
                      {sec.questions.map((q, i) => (
                        <div key={q.id} className="rounded-lg border p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 flex-shrink-0 text-sm font-semibold text-[#16A34A]">{si + 1}.{i + 1}</div>
                            <div className="flex-1">
                              <div className="text-sm text-slate-800">{q.type === "text" ? q.content : <img src={q.contentPreview} alt={`Q${i + 1}`} className="max-h-48 w-auto" />}</div>

                              <div className="mt-3 space-y-2">{q.answers.map((a, ai) => (<div key={a.id} className="flex items-center gap-3"><input type="checkbox" disabled className="h-4 w-4" /><div className="text-sm text-slate-700">{a.type === "text" ? a.content : <img src={a.contentPreview} alt={`A${ai + 1}`} className="h-16 w-auto" />}</div></div>))}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-end gap-2">
                  <button onClick={() => setPreviewMode(false)} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm">Back to edit</button>
                  <button onClick={exportJSON} className="rounded-md bg-[#16A34A] px-4 py-2 text-sm font-medium text-white">Export JSON</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
