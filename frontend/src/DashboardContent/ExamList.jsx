import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { FiSearch, FiDownload, FiTrash2 } from "react-icons/fi";

const LEVELS = ["college", "shs", "jhs", "gs"];
const LEVEL_LABELS = {
  college: "College",
  shs: "Senior High School",
  jhs: "Junior High School",
  gs: "Grade School",
};

export default function ExamList() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchPerLevel, setSearchPerLevel] = useState({});
  const [exporting, setExporting] = useState(false);
  const [deletingIds, setDeletingIds] = useState([]); // track deletions

  useEffect(() => {
    let mounted = true;
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/submissions");
        if (!res.ok) throw new Error(`Failed to load (${res.status})`);
        const data = await res.json();
        if (!mounted) return;
        setSubmissions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching submissions:", err);
        if (!mounted) return;
        setError("Unable to load exam submissions.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchSubmissions();
    return () => {
      mounted = false;
    };
  }, []);

  const safeDetails = (raw) => {
    if (!raw) return {};
    if (typeof raw === "object") return raw;
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  };

  const grouped = useMemo(() => {
    const g = { college: [], shs: [], jhs: [], gs: [] };
    submissions.forEach((raw) => {
      const s = { ...raw };
      s.details = safeDetails(s.details);
      const lvlRaw = (s.details?.application_level || "").toString().trim().toLowerCase();
      const lvl = LEVELS.includes(lvlRaw) ? lvlRaw : null;
      if (lvl) g[lvl].push(s);
    });
    Object.keys(g).forEach((k) =>
      g[k].sort((a, b) => {
        const na = `${a.details?.last_name || ""} ${a.details?.first_name || ""}`.toLowerCase();
        const nb = `${b.details?.last_name || ""} ${b.details?.first_name || ""}`.toLowerCase();
        return na.localeCompare(nb);
      })
    );
    return g;
  }, [submissions]);

  const commonHeaders = [
    "ID",
    "Exam",
    "First Name",
    "Last Name",
    "Email",
    "Phone",
    "Gender",
    "Date of Birth",
    "Address",
  ];
  const levelSpecific = {
    college: ["College AY", "College Semester", "College Choice #1", "College Choice #2"],
    shs: ["SHS Grade Level", "SHS Strand"],
    jhs: ["JHS Grade Level"],
    gs: ["GS Grade Level"],
  };
  const trailing = ["Score", "Max Score", "Submitted At"];
  const headersFor = (lvl) => [...commonHeaders, ...(levelSpecific[lvl] || []), ...trailing];

  const buildRowsFor = (items, lvl) =>
    items.map((s) => {
      const d = s.details || {};
      const base = {
        ID: s.id,
        Exam: s.exam?.title || `Exam #${s.exam_id}`,
        "First Name": d.first_name || "-",
        "Last Name": d.last_name || "-",
        Email: d.email || "-",
        Phone: d.phone || "-",
        Gender: d.gender || "-",
        "Date of Birth": d.date_of_birth || "-",
        Address: d.address || "-",
      };
      if (lvl === "college") {
        base["College AY"] = d.college_academic_year || "-";
        base["College Semester"] = d.college_semester || "-";
        base["College Choice #1"] = d.college_choice_1 || "-";
        base["College Choice #2"] = d.college_choice_2 || "-";
      } else if (lvl === "shs") {
        base["SHS Grade Level"] = d.shs_grade_level || "-";
        base["SHS Strand"] = d.shs_strand || "-";
      } else if (lvl === "jhs") {
        base["JHS Grade Level"] = d.jhs_grade_level || "-";
      } else if (lvl === "gs") {
        base["GS Grade Level"] = d.gs_grade_level || "-";
      }
      base["Score"] = s.score ?? "-";
      base["Max Score"] = s.max_score ?? "-";
      base["Submitted At"] = s.created_at ? new Date(s.created_at).toLocaleString() : "-";
      return base;
    });

  const exportToExcel = (lvl, items) => {
    if (!items || items.length === 0) {
      alert("No submissions to export for this level.");
      return;
    }
    setExporting(true);
    try {
      const headers = headersFor(lvl);
      const rows = buildRowsFor(items, lvl);
      const aoa = [headers, ...rows.map((r) => headers.map((h) => r[h]))];
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      ws["!cols"] = headers.map((h) => ({ wch: Math.max(8, Math.min(h.length + 6, 30)) }));
      const wb = XLSX.utils.book_new();
      const sheetName = `${lvl.toUpperCase()} Submissions`;
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      const filename = `${sheetName.replace(/\s+/g, "_")}_${new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:T]/g, "-")}.xlsx`;
      XLSX.writeFile(wb, filename);
    } catch (e) {
      console.error("Export error:", e);
      alert("Export failed.");
    } finally {
      setExporting(false);
    }
  };

  const exportAll = () => {
    setExporting(true);
    try {
      const wb = XLSX.utils.book_new();
      LEVELS.forEach((lvl) => {
        const items = grouped[lvl] || [];
        const headers = headersFor(lvl);
        const rows = buildRowsFor(items, lvl);
        const aoa = [headers, ...rows.map((r) => headers.map((h) => r[h]))];
        const ws = XLSX.utils.aoa_to_sheet(aoa);
        ws["!cols"] = headers.map((h) => ({ wch: Math.max(8, Math.min(h.length + 6, 30)) }));
        XLSX.utils.book_append_sheet(wb, ws, lvl.toUpperCase());
      });
      const fname = `All_Submissions_${new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:T]/g, "-")}.xlsx`;
      XLSX.writeFile(wb, fname);
    } catch (err) {
      console.error("Export All failed:", err);
      alert("Export All failed.");
    } finally {
      setExporting(false);
    }
  };

  const filterItems = (lvl) => {
    const q = (searchPerLevel[lvl] || "").trim().toLowerCase();
    if (!q) return grouped[lvl] || [];
    return (grouped[lvl] || []).filter((s) => {
      const d = s.details || {};
      const name = `${d.first_name || ""} ${d.last_name || ""} ${d.middle_name || ""}`.toLowerCase();
      const email = (d.email || "").toLowerCase();
      const phone = (d.phone || "").toLowerCase();
      const extra = `${d.college_choice_1 || ""} ${d.college_choice_2 || ""} ${d.shs_strand || ""}`.toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q) || extra.includes(q);
    });
  };

  const isDeleting = (id) => deletingIds.includes(id);

  // DELETE action
  const deleteSubmission = async (id) => {
    // simple confirmation
    const ok = window.confirm("Delete this submission? This action cannot be undone.");
    if (!ok) return;

    setDeletingIds((s) => (s.includes(id) ? s : [...s, id]));
    try {
      // Assumes backend supports DELETE /api/submissions/:id
      const res = await fetch(`/api/submissions/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const text = await res.text().catch(() => null);
        throw new Error(`Delete failed (${res.status}) ${text || ''}`);
      }

      // remove from local state
      setSubmissions((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed. See console for details.");
    } finally {
      setDeletingIds((s) => s.filter((x) => x !== id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <div className="text-emerald-700">Loading submissions…</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <div className="bg-white p-4 rounded shadow-sm border text-red-600">{error}</div>
      </div>
    );
  }

  const EmptyCard = ({ text = "No submissions." }) => (
    <div className="bg-white border border-amber-50 p-4 rounded shadow-sm text-center text-gray-500">{text}</div>
  );

  const DesktopTable = ({ lvl }) => {
    const items = filterItems(lvl);
    const headers = headersFor(lvl);
    const rows = buildRowsFor(items, lvl);

    return (
      <section className="mb-8 w-full">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-emerald-800">
            {LEVEL_LABELS[lvl]} <span className="text-sm text-gray-500">({items.length})</span>
          </h3>
          <div className="flex items-center gap-2">
            <label htmlFor={`search-${lvl}`} className="sr-only">
              Search {LEVEL_LABELS[lvl]}
            </label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" />
              <input
                id={`search-${lvl}`}
                placeholder={`Search ${LEVEL_LABELS[lvl]} by name, email, phone...`}
                value={searchPerLevel[lvl] || ""}
                onChange={(e) =>
                  setSearchPerLevel((s) => ({ ...s, [lvl]: e.target.value }))
                }
                className="pl-10 pr-3 py-2 border rounded-lg bg-white text-sm w-44 sm:w-64 md:w-72 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <button
              onClick={() => exportToExcel(lvl, items)}
              className="px-3 py-2 rounded-lg border bg-amber-500 text-white text-sm shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <FiDownload /> Export
            </button>
          </div>
        </div>

        <div className="bg-white border border-amber-50 rounded-2xl shadow-md overflow-hidden">
          <div className="p-3 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-amber-100">
                <tr>
                  {headers.map((h, i) => (
                    <th
                      key={h}
                      className="p-3 text-left text-xs font-medium text-emerald-700 uppercase align-top break-words whitespace-normal"
                      style={{
                        verticalAlign: "top",
                        maxWidth: i < 3 ? 140 : 260,
                      }}
                      title={h}
                    >
                      {h}
                    </th>
                  ))}

                  {/* Actions column */}
                  <th className="p-3 text-left text-xs font-medium text-emerald-700 uppercase align-top">Actions</th>
                </tr>
              </thead>

              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={headers.length + 1} className="p-6">
                      <EmptyCard />
                    </td>
                  </tr>
                ) : (
                  rows.map((r, idx) => (
                    <tr
                      key={`${r.ID}-${idx}`}
                      className={`${idx % 2 === 0 ? "bg-white" : "bg-emerald-50"} hover:bg-emerald-100`}
                    >
                      {headers.map((h) => (
                        <td
                          key={h}
                          className="p-3 align-top text-xs text-emerald-800 break-words whitespace-normal"
                          style={{ maxWidth: 260 }}
                        >
                          {String(r[h] ?? "-")}
                        </td>
                      ))}

                      {/* Actions cell */}
                      <td className="p-3 align-top text-xs text-emerald-800">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => deleteSubmission(r.ID)}
                            disabled={isDeleting(r.ID)}
                            className="px-2 py-1 rounded-lg border bg-white text-amber-700 text-xs shadow-sm hover:bg-amber-50 flex items-center gap-2"
                            aria-label={`Delete submission ${r.ID}`}
                          >
                            <FiTrash2 /> {isDeleting(r.ID) ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    );
  };

  const MobileCards = ({ lvl }) => {
    const items = filterItems(lvl);
    return (
      <section className="mb-6 w-full">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-emerald-800">
            {LEVEL_LABELS[lvl]} <span className="text-sm text-gray-500">({items.length})</span>
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportToExcel(lvl, items)}
              className="px-3 py-2 rounded-lg border bg-amber-500 text-white text-sm shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <FiDownload /> Export
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {items.length === 0 && <EmptyCard />}
          {items.map((s) => {
            const d = s.details || {};
            return (
              <article
                key={s.id}
                className="bg-white border border-amber-50 p-4 rounded-2xl shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-emerald-600 mb-1">#{s.id} · {s.exam?.title || `Exam #${s.exam_id}`}</div>
                    <div className="text-base font-semibold text-emerald-900">
                      {d.first_name || "-"} {d.last_name || "-"}
                    </div>
                    <div className="text-xs text-emerald-700 mt-1">{d.email || "-"} · {d.phone || "-"}</div>
                  </div>

                  <div className="text-right text-xs text-emerald-600">
                    <div>
                      <span className="font-medium text-amber-600">{s.score ?? "-"}</span> / {s.max_score ?? "-"}
                    </div>
                    <div className="mt-1 text-gray-400">{s.created_at ? new Date(s.created_at).toLocaleString() : "-"}</div>

                    {/* Mobile delete button */}
                    <div className="mt-2">
                      <button
                        onClick={() => deleteSubmission(s.id)}
                        disabled={isDeleting(s.id)}
                        className="px-2 py-1 rounded-lg border bg-white text-amber-700 text-xs shadow-sm hover:bg-amber-50 flex items-center gap-2"
                        aria-label={`Delete submission ${s.id}`}
                      >
                        <FiTrash2 /> {isDeleting(s.id) ? "Deleting..." : "Delete"}
                      </button>
                    </div>

                  </div>
                </div>

                <div className="mt-3 text-xs text-emerald-800 space-y-1">
                  <div>
                    <span className="font-medium text-amber-600">Gender:</span> {d.gender || "-"}
                  </div>
                  <div>
                    <span className="font-medium text-amber-600">DOB:</span> {d.date_of_birth || "-"}
                  </div>
                  <div>
                    <span className="font-medium text-amber-600">Address:</span> {d.address || "-"}
                  </div>
                  <div>
                    <span className="font-medium text-amber-600">Level:</span> {d.application_level || "-"}
                  </div>

                  {lvl === "college" && (
                    <>
                      <div>
                        <span className="font-medium text-amber-600">College AY:</span> {d.college_academic_year || "-"}
                      </div>
                      <div>
                        <span className="font-medium text-amber-600">Semester:</span> {d.college_semester || "-"}
                      </div>
                      <div>
                        <span className="font-medium text-amber-600">Choice #1:</span> {d.college_choice_1 || "-"}
                      </div>
                      <div>
                        <span className="font-medium text-amber-600">Choice #2:</span> {d.college_choice_2 || "-"}
                      </div>
                    </>
                  )}
                  {lvl === "shs" && (
                    <>
                      <div>
                        <span className="font-medium text-amber-600">SHS Grade:</span> {d.shs_grade_level || "-"}
                      </div>
                      <div>
                        <span className="font-medium text-amber-600">SHS Strand:</span> {d.shs_strand || "-"}
                      </div>
                    </>
                  )}
                  {lvl === "jhs" && (
                    <div>
                      <span className="font-medium text-amber-600">JHS Grade:</span> {d.jhs_grade_level || "-"}
                    </div>
                  )}
                  {lvl === "gs" && (
                    <div>
                      <span className="font-medium text-amber-600">GS Grade:</span> {d.gs_grade_level || "-"}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    );
  };

  return (
    <div className="w-full min-h-screen bg-white text-emerald-900">
      <main className="w-full mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="bg-gradient-to-r from-amber-50 via-amber-100 to-emerald-50 shadow-md rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-emerald-900">Exam Submissions</h1>
              <p className="text-sm text-emerald-700 mt-1">Organized by application level — clean, admin-friendly layout with white / gold / green palette.</p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSearchPerLevel((s) => ({ ...s, [lvl]: "" }))}
                  className="px-3 py-1 rounded-full border border-amber-100 bg-white text-amber-700 shadow-sm text-xs"
                  aria-label={`Reset ${LEVEL_LABELS[lvl]} search`}
                >
                  {LEVEL_LABELS[lvl]} <span className="text-xs text-gray-500 ml-1">({(grouped[lvl] || []).length})</span>
                </button>
              ))}

              <button
                onClick={exportAll}
                disabled={exporting}
                className="px-4 py-2 rounded-lg border bg-emerald-600 text-white text-sm shadow-sm hover:shadow-md flex items-center gap-2"
              >
                <FiDownload /> Export All
              </button>
            </div>
          </div>
        </header>

        <div className="hidden md:block">
          {LEVELS.map((lvl) => (
            <DesktopTable key={lvl} lvl={lvl} />
          ))}
        </div>

        <div className="block md:hidden">
          {LEVELS.map((lvl) => (
            <MobileCards key={lvl} lvl={lvl} />
          ))}
        </div>
      </main>
    </div>
  );
}
