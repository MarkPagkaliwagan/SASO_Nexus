import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend,
  ScatterChart, Scatter, ZAxis
} from "recharts";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/**
 * CollegeAnalyticsAdvanced.withRankings.jsx
 * - Keeps your original component intact but adds:
 *   • Rankings (Top N students) panel + export
 *   • Distribution histogram of chosen numeric field (buckets)
 *   • Scatter plot (MAT IQ vs APT Total %tile)
 *   • Threshold counter (how many students above X)
 *   • Small UI controls to pick Top N, threshold, and histogram field
 *
 * Drop-in replacement for your existing file. Requires same deps as before.
 */

/* ------------------------
   THEME & UTILITIES
   ------------------------ */
const THEME = {
  green: "#059669",
  greenDark: "#065f46",
  gold: "#D4AF37",
  goldDark: "#b58f2b",
  bg1: "bg-gradient-to-br from-white via-emerald-50 to-amber-50",
  panel: "bg-white/95",
};

const COLOR_PALETTE = ["#16A34A", "#F59E0B", "#22C55E", "#FBBF24", "#059669", "#FACC15"];

const LABELS = {
  name: "Name",
  mat_iq: "MAT IQ",
  mat_percentile: "MAT %tile",
  mat_classification: "MAT Class",
  mat_rs: "MAT RS",
  apt_verbal_rs: "APT Verbal RS",
  apt_verbal_percentile: "APT Verbal %tile",
  apt_verbal_classification: "APT Verbal Class",
  apt_num_rs: "APT Num RS",
  apt_num_percentile: "APT Num %tile",
  apt_num_classification: "APT Num Class",
  apt_total_rs: "APT Total RS",
  apt_total_percentile: "APT Total %tile",
  apt_total_classification: "APT Total Class",
  gwa_percentile: "GWA %tile",
  gwa_classification: "GWA Class",
  remarks: "Remarks",
  payment_type: "Payment",
  academicYear: "Academic Year"
};

const NUMERIC_FIELDS = [
  "mat_iq","mat_percentile","mat_rs",
  "apt_verbal_rs","apt_verbal_percentile",
  "apt_num_rs","apt_num_percentile",
  "apt_total_rs","apt_total_percentile",
  "gwa_percentile"
];

function toFullName(r){
  return `${r.nameFamily||""}, ${r.nameGiven||""} ${r.nameMiddle||""}`.trim();
}
function safeNumber(v){
  if (v===null || v===undefined || v==="") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function numericStats(rows, field){
  const vals = rows.map(r=>safeNumber(r[field])).filter(v=>v!==null).sort((a,b)=>a-b);
  if (!vals.length) return {count:0, avg:null, median:null, min:null, max:null};
  const sum = vals.reduce((s,x)=>s+x,0);
  const avg = +(sum/vals.length).toFixed(2);
  const min = vals[0], max = vals[vals.length-1];
  const mid = Math.floor(vals.length/2);
  const median = vals.length%2===1 ? vals[mid] : +(((vals[mid-1]+vals[mid])/2).toFixed(2));
  return {count: vals.length, avg, median, min, max};
}

/* ------------------------
   SMALL UI HELPERS
   ------------------------ */
function IconButton({children, title, className="", ...props}){
  return (
    <button title={title} className={`px-3 py-1 rounded-md shadow-sm border text-sm bg-white hover:scale-103 transform transition-all duration-150 ${className}`} {...props}>
      {children}
    </button>
  );
}

function StatCard({title, value, subtitle}){
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      whileHover={{ y: -4 }}
      className={`rounded-lg p-4 border ${THEME.panel} shadow-sm border-gray-100`}
    >
      <div className="text-sm text-gray-600">{title}</div>
      <div className="mt-1 text-2xl font-extrabold" style={{ color: THEME.greenDark }}>{value}</div>
      {subtitle ? <div className="text-xs text-gray-500 mt-1">{subtitle}</div> : null}
    </motion.div>
  );
}

/* ------------------------
   MAIN COMPONENT
   ------------------------ */
export default function CollegeAnalyticsAdvanced(){
  // Summary (courses)
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // Selected course detail
  const [selectedCourse, setSelectedCourse] = useState("");
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // table state
  const [page, setPage] = useState(1);
  const [perPage] = useState(50);

  const [query, setQuery] = useState("");
  const [academicYear, setAcademicYear] = useState("");

  // table interactions
  const [sortBy, setSortBy] = useState({ key: "nameFamily", dir: "asc" });
  const [visibleCols, setVisibleCols] = useState(Object.keys(LABELS).filter(k=>k!="name"));
  const [rowDetail, setRowDetail] = useState(null); // modal
  const [compactView, setCompactView] = useState(false);

  // NEW: ranking controls
  const [topN, setTopN] = useState(10);
  const [threshold, setThreshold] = useState(75);
  const [histField, setHistField] = useState("apt_total_percentile");

  // load courses summary
  useEffect(()=>{
    setLoadingCourses(true);
    axios.get("/api/college-analytics")
      .then(res=>{
        const list = (res.data && res.data.courses) || [];
        setCourses(list);
        if (list.length && !selectedCourse) setSelectedCourse(list[0].course);
      })
      .catch(err=>console.error("load courses",err))
      .finally(()=>setLoadingCourses(false));
  },[]);

  // fetch detail whenever selectedCourse/page/year changes
  useEffect(()=>{
    if (!selectedCourse) return;
    fetchDetail(selectedCourse, page, academicYear);
    // eslint-disable-next-line
  },[selectedCourse, page, academicYear]);

  function fetchDetail(course, pageNum=1, year=""){
    setLoadingDetail(true);
    const params = new URLSearchParams();
    params.append("page", pageNum);
    params.append("per_page", perPage);
    if (year) params.append("academicYear", year);

    axios.get(`/api/analytics/course/${encodeURIComponent(course)}?${params.toString()}`)
      .then(res => setDetail(res.data))
      .catch(err => { console.error("load course detail", err); setDetail(null); })
      .finally(()=>setLoadingDetail(false));
  }

  // debounced query setter
  const debouncedSetQuery = useMemo(()=>debounce((val)=>setQuery(val), 350), []);
  useEffect(()=> ()=>debouncedSetQuery.cancel(), [debouncedSetQuery]);

  // filter rows (client-side search on returned page)
  const filteredRows = useMemo(()=>{
    if (!detail || !Array.isArray(detail.rows)) return [];
    if (!query) return detail.rows;
    const q = query.toLowerCase();
    return detail.rows.filter(r=>{
      const name = toFullName(r).toLowerCase();
      return name.includes(q) ||
             (String(r.remarks||"").toLowerCase().includes(q)) ||
             (String(r.payment_type||"").toLowerCase().includes(q)) ||
             (String(r.academicYear||"").toLowerCase().includes(q));
    });
  },[detail, query]);

  // sorting
  const sortedRows = useMemo(()=>{
    const rows = [...filteredRows];
    const k = sortBy.key;
    const dir = sortBy.dir;
    rows.sort((a,b)=>{
      const vaRaw = (a[k]===null || a[k]===undefined) ? "" : a[k];
      const vbRaw = (b[k]===null || b[k]===undefined) ? "" : b[k];

      // numeric compare when both are numeric
      const na = Number(vaRaw);
      const nb = Number(vbRaw);
      if (!isNaN(na) && !isNaN(nb)){
        return dir==='asc' ? na-nb : nb-na;
      }

      const va = String(vaRaw).toLowerCase();
      const vb = String(vbRaw).toLowerCase();
      if (va < vb) return dir==='asc' ? -1 : 1;
      if (va > vb) return dir==='asc' ? 1 : -1;
      return 0;
    });
    return rows;
  },[filteredRows, sortBy]);

  // numeric stats for charts
  const numericSummary = useMemo(()=>{
    if (!detail) return {};
    const out = {};
    NUMERIC_FIELDS.forEach(f => out[f] = numericStats(detail.rows || [], f));
    return out;
  },[detail]);

  const barData = useMemo(()=>{
    if (!detail) return [];
    return NUMERIC_FIELDS.map((f)=>({ field: LABELS[f]||f, avg: numericSummary[f]?.avg })).filter(d => d.avg !== null && d.avg !== undefined);
  },[detail, numericSummary]);

  const paymentData = useMemo(()=>{
    if (!detail) return [];
    if (Array.isArray(detail.payment_stats) && detail.payment_stats.length){
      return detail.payment_stats.map((p,i)=>({ name: p.payment_type||"Unspecified", value: p.total, percent: p.percentage, color: COLOR_PALETTE[i%COLOR_PALETTE.length] }));
    }
    const m = {};
    (detail.rows||[]).forEach(r=>{ const k=r.payment_type||"Unspecified"; m[k]=(m[k]||0)+1; });
    return Object.keys(m).map((k,i)=>({ name:k, value:m[k], percent: +(((m[k]/(detail.total||1))*100).toFixed(2)), color: COLOR_PALETTE[i%COLOR_PALETTE.length] }));
  },[detail]);

  const classData = useMemo(()=>{
    if (!detail) return [];
    const key="apt_total_classification";
    if (detail.classification_stats && detail.classification_stats[key]){
      return detail.classification_stats[key].map((c,i)=>({ name:c.classification, value:c.total, percent:c.percentage, color: COLOR_PALETTE[i%COLOR_PALETTE.length] }));
    }
    const m={};
    (detail.rows||[]).forEach(r=>{ const k=r[key]||r.apt_total_classification||"Unspecified"; m[k]=(m[k]||0)+1; });
    return Object.keys(m).map((k,i)=>({ name:k, value:m[k], percent: +(((m[k]/(detail.total||1))*100).toFixed(2)), color: COLOR_PALETTE[i%COLOR_PALETTE.length] }));
  },[detail]);

  // NEW: derived ranking & distribution
  const topStudents = useMemo(()=>{
    if (!detail || !Array.isArray(detail.rows)) return [];
    // prefer apt_total_percentile, fall back to apt_total_rs or gwa_percentile
    const key = detail.rows.some(r=>r.apt_total_percentile!==undefined) ? 'apt_total_percentile' : (detail.rows.some(r=>r.apt_total_rs!==undefined) ? 'apt_total_rs' : 'gwa_percentile');
    const rows = [...detail.rows].map(r=>({ ...r, __rankKey: safeNumber(r[key]) || 0 })).sort((a,b)=>b.__rankKey - a.__rankKey);
    return rows.slice(0, topN);
  },[detail, topN]);

  const histogram = useMemo(()=>{
    if (!detail || !Array.isArray(detail.rows)) return [];
    const field = histField;
    const vals = (detail.rows||[]).map(r=>safeNumber(r[field])).filter(v=>v!==null);
    if (!vals.length) return [];
    const min = Math.min(...vals), max = Math.max(...vals);
    const buckets = 10;
    const size = (max - min) / buckets || 1;
    const m = new Array(buckets).fill(0);
    vals.forEach(v=>{
      let idx = Math.floor((v - min) / size);
      if (idx < 0) idx = 0; if (idx >= buckets) idx = buckets-1;
      m[idx]++;
    });
    return m.map((count,i)=>({ bucket: `${Math.round(min + i*size)} - ${Math.round(min + (i+1)*size)}`, count }));
  },[detail, histField]);

  const countAboveThreshold = useMemo(()=>{
    if (!detail || !Array.isArray(detail.rows)) return 0;
    const key = histField; // measure on current chosen field
    return (detail.rows||[]).reduce((s,r)=>{
      const v = safeNumber(r[key]);
      if (v!==null && v >= threshold) return s+1;
      return s;
    }, 0);
  },[detail, threshold, histField]);

  // column toggle helpers
  const allCols = Object.keys(LABELS).filter(k=>k!=="name");
  function toggleCol(col){
    setVisibleCols(prev => prev.includes(col) ? prev.filter(c=>c!==col) : [...prev, col]);
  }

  function exportCSV(){
    if (!detail) return alert("No data.");
    const rows = sortedRows;
    if (!rows.length) return alert("No rows to export.");
    const headers = ["id","nameFamily","nameGiven","nameMiddle",...allCols,"academicYear"];
    const csv = [headers.join(",")];
    rows.forEach(r=>{
      const line = headers.map(h=>{
        const v = r[h]===undefined || r[h]===null ? "" : String(r[h]).replace(/\n/g," ").replace(/\r/g," ").replace(/,/g,"");
        return `"${v}"`;
      }).join(",");
      csv.push(line);
    });
    const blob = new Blob([csv.join("\n")], { type: "text/csv" });
    saveAs(blob, `${(detail.course||selectedCourse||"course").replace(/\s+/g,"_")}_rows_${new Date().toISOString().slice(0,10)}.csv`);
  }

  function exportExcel(){
    if (!detail) return alert("No data.");
    const rows = sortedRows;
    if (!rows.length) return alert("No rows to export.");
    const headers = ["ID","LastName","FirstName","Middle","MAT IQ","MAT %tile","MAT Class","MAT RS",
      "APT Verbal RS","APT Verbal %tile","APT Verbal Class",
      "APT Num RS","APT Num %tile","APT Num Class",
      "APT Total RS","APT Total %tile","APT Total Class",
      "GWA %tile","GWA Class","Remarks","Payment","AcademicYear"];
    const data = rows.map(r => [
      r.id, r.nameFamily, r.nameGiven, r.nameMiddle,
      r.mat_iq, r.mat_percentile, r.mat_classification, r.mat_rs,
      r.apt_verbal_rs, r.apt_verbal_percentile, r.apt_verbal_classification,
      r.apt_num_rs, r.apt_num_percentile, r.apt_num_classification,
      r.apt_total_rs, r.apt_total_percentile, r.apt_total_classification,
      r.gwa_percentile, r.gwa_classification, r.remarks, r.payment_type, r.academicYear
    ]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "rows");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), `${(detail.course||selectedCourse||"course").replace(/\s+/g,"_")}_rows_${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  // NEW: export Top N to CSV
  function exportTopNCSV(){
    if (!detail) return alert("No data.");
    const rows = topStudents;
    if (!rows.length) return alert("No rows to export.");
    const headers = ["Rank","ID","LastName","FirstName","Middle","Score"];
    const csv = [headers.join(",")];
    rows.forEach((r,i)=>{
      const score = r.apt_total_percentile ?? r.apt_total_rs ?? r.gwa_percentile ?? "";
      const line = [i+1, r.id, r.nameFamily, r.nameGiven, r.nameMiddle, score].map(v=>`"${String(v||"").replace(/,/g,"")}"`).join(",");
      csv.push(line);
    });
    const blob = new Blob([csv.join("\n")], { type: "text/csv" });
    saveAs(blob, `${(detail.course||selectedCourse||"course").replace(/\s+/g,"_")}_top_${topN}_${new Date().toISOString().slice(0,10)}.csv`);
  }

  // change sorting
  function onSort(key){
    setSortBy(prev => {
      if (prev.key === key) return { key, dir: prev.dir==="asc" ? "desc" : "asc" };
      // default to desc for numeric fields
      return { key, dir: NUMERIC_FIELDS.includes(key) ? "desc" : "asc" };
    });
  }

  // open row modal
  function openRow(r){
    setRowDetail(r);
  }

  // UI controls used in render
  const [colDropdownOpen, setColDropdownOpen] = useState(false);

  return (
    <div className={`${THEME.bg1} min-h-screen py-8 px-4 text-black`}>
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 style={{ color: THEME.greenDark }} className="text-3xl md:text-4xl font-extrabold tracking-tight">College Analytics</h1>
            <p className="text-sm text-gray-600 mt-1">Interactive analytics — <span className="font-medium">firstChoice</span>. Clean, fast, and actionable.</p>
          </div>

<div className="flex flex-wrap gap-3 w-full md:w-auto">
  <select
    aria-label="Select course"
    className="px-3 py-2 rounded-lg border bg-white shadow-sm"
    value={selectedCourse}
    onChange={(e) => {
      setSelectedCourse(e.target.value);
      setPage(1);
    }}
  >
    {loadingCourses ? <option>Loading...</option> : null}
    {!loadingCourses && courses.length === 0 ? (
      <option>No courses</option>
    ) : null}
    {!loadingCourses &&
      courses.map((c) => (
        <option key={c.course} value={c.course}>
          {c.course} — {c.totalApplicants}
        </option>
      ))}
  </select>

  <input
    aria-label="Academic year"
    placeholder="Academic year (opt)"
    className="px-3 py-2 border rounded-lg shadow-sm w-44"
    value={academicYear}
    onChange={(e) => {
      setAcademicYear(e.target.value);
      setPage(1);
    }}
  />

  <IconButton
    title="Refresh data"
    onClick={() => {
      setPage(1);
      setQuery("");
      setSortBy({ key: "nameFamily", dir: "asc" });
      fetchDetail(selectedCourse, 1, academicYear);
    }}
    className="bg-gradient-to-br from-amber-400 to-yellow-500 text-black font-semibold"
  >
    Refresh
  </IconButton>
</div>

        </header>

        {/* CARDS */}
        <AnimatePresence>
          {detail && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <StatCard title="Course" value={detail.course} subtitle={`Total applicants: ${detail.total}`} />
              <StatCard title="MAT IQ (avg)" value={detail.averages?.mat_iq_avg ?? "—"} subtitle={`MAT %tile avg: ${detail.averages?.mat_percentile_avg ?? "—"}`} />
              <StatCard title="APT Total (avg)" value={detail.averages?.apt_total_percentile_avg ?? "—"} subtitle={`APT verbal avg: ${detail.averages?.apt_verbal_percentile_avg ?? "—"}`} />
              <StatCard title="GWA (avg)" value={detail.averages?.gwa_percentile_avg ?? "—"} subtitle={`Rows shown: ${filteredRows.length}`} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Charts */}
        {detail && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <motion.div initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Average numeric scores</h3>
                <div className="text-sm text-gray-500">Based on displayed rows</div>
              </div>
              {barData.length===0 ? <div className="text-sm text-gray-500">No numeric data</div> : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData} margin={{ left: 0, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e7f0ea" />
                    <XAxis dataKey="field" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <ReTooltip />
                    <Bar dataKey="avg" radius={[6,6,0,0]}>
                      {barData.map((d,i)=><Cell key={i} fill={COLOR_PALETTE[i%COLOR_PALETTE.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </motion.div>

            <motion.div initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Payment distribution</h3>
                <div className="text-sm text-gray-500">Counts & percentages</div>
              </div>
              {paymentData.length===0 ? <div className="text-sm text-gray-500">No payment data</div> : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={paymentData} dataKey="value" nameKey="name" outerRadius={90} innerRadius={45} label={(d)=>`${d.name}: ${d.percent}%`}>
                      {paymentData.map((p,i)=><Cell key={i} fill={p.color} />)}
                    </Pie>
                    <Legend verticalAlign="bottom" height={36} />
                    <ReTooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </motion.div>
          </div>
        )}

        {/* Classification */}
        {detail && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Classification (APT Total)</h3>
              <div className="text-sm text-gray-500">Distribution</div>
            </div>

            {classData.length===0 ? <div className="text-sm text-gray-500">No classification data</div> : (
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div style={{ width:220, height:220 }}>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={classData} dataKey="value" nameKey="name" outerRadius={90} innerRadius={30} label>
                        {classData.map((c,i)=><Cell key={i} fill={c.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex-1">
                  {classData.map((c,i)=>(
                    <div key={i} className="flex items-center justify-between py-2 border-b">
                      <div className="flex items-center gap-3">
                        <span style={{ width:12, height:12, background:c.color, display:"inline-block", borderRadius:2 }} />
                        <div>
                          <div className="text-black font-medium">{c.name}</div>
                          <div className="text-xs text-gray-500">{c.value} • {c.percent}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* NEW: Rankings & Distribution section */}
        {detail && (
          <motion.div initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Rankings & Distribution</h3>
              <div className="text-sm text-gray-500">Top students, histogram, threshold counts</div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              {/* Controls */}
              <div className="w-full md:w-64 p-2 border rounded">
                <div className="mb-2 text-xs text-gray-600">Top N</div>
                <input type="number" min={1} max={100} value={topN} onChange={(e)=>setTopN(Math.max(1, Number(e.target.value||1)))} className="w-full px-2 py-1 border rounded mb-3" />

                <div className="mb-2 text-xs text-gray-600">Histogram field</div>
                <select value={histField} onChange={(e)=>setHistField(e.target.value)} className="w-full px-2 py-1 border rounded mb-3">
                  {NUMERIC_FIELDS.map(f=> <option key={f} value={f}>{LABELS[f] || f}</option>)}
                </select>

                <div className="mb-2 text-xs text-gray-600">Threshold (for chosen field)</div>
                <input type="number" value={threshold} onChange={(e)=>setThreshold(Number(e.target.value||0))} className="w-full px-2 py-1 border rounded mb-3" />

                <div className="flex gap-2">
                  <button onClick={exportTopNCSV} className="px-3 py-1 rounded bg-amber-400 text-black">Export Top</button>
                  <button onClick={()=>navigator.clipboard.writeText(JSON.stringify(topStudents))} className="px-3 py-1 rounded border">Copy</button>
                </div>

                <div className="text-xs text-gray-500 mt-3">Count ≥ {threshold}: <strong>{countAboveThreshold}</strong></div>
              </div>

              {/* Charts: histogram / scatter / top list */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-2 border rounded">
                  <div className="text-sm font-medium mb-2">Histogram — {LABELS[histField]}</div>
                  {histogram.length===0 ? <div className="text-xs text-gray-500">No data</div> : (
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={histogram} margin={{ left: 0, right: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="bucket" tick={{ fontSize: 10 }} />
                        <YAxis />
                        <ReTooltip />
                        <Bar dataKey="count" fill={THEME.green} radius={[6,6,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="p-2 border rounded">
                  <div className="text-sm font-medium mb-2">MAT IQ vs APT Total (%tile)</div>
                  {detail.rows.length===0 ? <div className="text-xs text-gray-500">No data</div> : (
                    <ResponsiveContainer width="100%" height={180}>
                      <ScatterChart>
                        <CartesianGrid />
                        <XAxis dataKey="mat_iq" name="MAT IQ" />
                        <YAxis dataKey="apt_total_percentile" name="APT %tile" />
                        <ReTooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Scatter data={(detail.rows||[]).map(r=>({ mat_iq: safeNumber(r.mat_iq), apt_total_percentile: safeNumber(r.apt_total_percentile), name: toFullName(r) })).filter(p=>p.mat_iq!==null && p.apt_total_percentile!==null)} fill={COLOR_PALETTE[0]} />
                      </ScatterChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="md:col-span-2 p-2 border rounded">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium">Top {topN} students</div>
                    <div className="text-xs text-gray-500">Sorted by APT total %tile (or fallback)</div>
                  </div>
                  <div className="max-h-56 overflow-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-gray-600 border-b">
                          <th className="p-1">#</th>
                          <th className="p-1">Name</th>
                          <th className="p-1">Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topStudents.map((r,i)=> (
                          <tr key={r.id} className="border-b hover:bg-amber-50">
                            <td className="p-1 text-xs">{i+1}</td>
                            <td className="p-1 text-xs">{toFullName(r)}</td>
                            <td className="p-1 text-xs font-medium">{r.apt_total_percentile ?? r.apt_total_rs ?? r.gwa_percentile ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}

        {/* Controls: column visibility / compact / export */}
        {detail && (
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600 mr-2">Columns</div>

              <div className="relative">
                <button onClick={()=>setColDropdownOpen(s=>!s)} className="px-3 py-1 border rounded-md text-sm bg-white shadow-sm">Toggle columns ▾</button>
                {colDropdownOpen && (
                  <div className="absolute left-0 mt-2 bg-white border rounded shadow-lg z-20 w-64 p-3">
                    <div className="text-xs text-gray-500 mb-2">Show / hide columns</div>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto">
                      {allCols.map(c=> (
                        <label key={c} className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={visibleCols.includes(c)} onChange={()=>toggleCol(c)} />
                          <span>{LABELS[c]}</span>
                        </label>
                      ))}
                    </div>
                    <div className="mt-2 flex gap-2 justify-end">
                      <button onClick={()=>{ setVisibleCols(allCols); }} className="px-2 py-1 text-xs border rounded">Show all</button>
                      <button onClick={()=>{ setVisibleCols([]); }} className="px-2 py-1 text-xs border rounded">Hide all</button>
                    </div>
                  </div>
                )}
              </div>

            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={compactView} onChange={(e)=>setCompactView(e.target.checked)} />
                Compact view
              </label>

              <button onClick={exportCSV} className="px-3 py-1 rounded bg-amber-400 text-black font-medium hover:bg-amber-500 transition">Download CSV (page)</button>
              <button onClick={exportExcel} className="px-3 py-1 rounded bg-green-600 text-black font-medium hover:bg-green-700 transition">Download XLSX (page)</button>
            </div>
          </div>
        )}

        {/* Table */}
{detail && (
  <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
    {/* Table controls */}
    <div className="p-3 border-b text-sm text-gray-600 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <input
          aria-label="Search"
          value={query}
          onChange={(e) => debouncedSetQuery(e.target.value)}
          placeholder="Search name / remarks / payment / year"
          className="px-3 py-2 border rounded w-64 shadow-sm"
        />
        <div className="text-xs text-gray-500">Showing {filteredRows.length} of {detail.total}</div>
      </div>

      <div className="flex items-center gap-2">
        <select className="px-2 py-1 border rounded text-sm" value={sortBy.key} onChange={(e)=>onSort(e.target.value)}>
          <option value="nameFamily">Name (last)</option>
          <option value="mat_iq">MAT IQ</option>
          <option value="apt_total_percentile">APT Total %tile</option>
          <option value="gwa_percentile">GWA %tile</option>
        </select>
        <button
          onClick={() => setSortBy(s => ({ key: s.key, dir: s.dir === "asc" ? "desc" : "asc" }))}
          className="px-2 py-1 border rounded text-sm"
        >
          Dir: {sortBy.dir}
        </button>
      </div>
    </div>

    {/* Table itself */}
    <table className={`min-w-max table-auto w-full text-sm`}>
      <thead className="bg-gradient-to-r from-white to-amber-50 sticky top-0 z-10">
        <tr>
          <th className="p-3 text-left font-semibold text-black">Name</th>
          {allCols.filter(c => visibleCols.includes(c)).map(col => (
            <th
              key={col}
              className="p-3 text-center font-semibold text-black whitespace-nowrap w-[120px] truncate"
            >
              <button onClick={() => onSort(col)} className="flex items-center justify-center gap-1">
                {LABELS[col]} {sortBy.key === col ? (sortBy.dir === "asc" ? "▲" : "▼") : "↕"}
              </button>
            </th>
          ))}
          <th className="p-3 text-center font-semibold text-black">Actions</th>
        </tr>
      </thead>

      <tbody>
        {sortedRows.map(r => (
          <tr
            key={r.id}
            className="group odd:bg-white even:bg-gray-50 hover:bg-amber-50 transition-colors hover:shadow-sm"
          >
            <td className="p-2 text-center whitespace-nowrap">{toFullName(r)}</td>
            {allCols.filter(c => visibleCols.includes(c)).map(c => (
              <td
                key={c}
                className={`p-2 text-center whitespace-nowrap truncate ${NUMERIC_FIELDS.includes(c) ? "text-center font-medium" : "text-left"}`}
              >
                {r[c] ?? "—"}
              </td>
            ))}
            <td className="p-2 text-center">
              <div className="flex items-center justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                <button title="View details" onClick={() => openRow(r)} className="px-2 py-1 border rounded text-sm bg-yellow-500 hover:bg-emerald-500">
                  View
                </button>
                <button
                  title="Copy row"
                  onClick={() => navigator.clipboard.writeText(JSON.stringify(r))}
                  className="px-2 py-1 border rounded text-sm bg-emerald-500 hover:bg-yellow-500"
                >
                  Copy
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    {/* Pagination */}
    <div className="p-3 flex items-center justify-between border-t">
      <div className="text-xs text-gray-600">Page {detail.page ?? page} • {detail.total} total</div>
      <div className="flex items-center gap-2">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} className="px-2 py-1 border rounded  bg-emerald-500 hover:bg-yellow-500">Prev</button>
        <button onClick={() => setPage(p => p + 1)} className="px-2 py-1 border rounded  bg-yellow-500 hover:bg-emerald-500">Next</button>
      </div>
    </div>
  </div>
)}


        {/* Row details modal */}
        <AnimatePresence>
          {rowDetail && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
              <motion.div initial={{ y: 20, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 10, opacity: 0 }} className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: THEME.greenDark }}>{toFullName(rowDetail)}</h3>
                    <div className="text-sm text-gray-500">{rowDetail.academicYear || "—"}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={()=>{ navigator.clipboard.writeText(JSON.stringify(rowDetail)); }} className="px-3 py-1 rounded bg-amber-100">Copy JSON</button>
                    <button onClick={()=>setRowDetail(null)} className="px-3 py-1 rounded border">Close</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Scores</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {NUMERIC_FIELDS.map(f=>(
                        <div key={f} className="p-2 border rounded bg-gray-50">
                          <div className="text-xs text-gray-500">{LABELS[f]}</div>
                          <div className="text-md font-medium text-black">{rowDetail[f] ?? "—"}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">Info</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Payment:</strong> {rowDetail.payment_type ?? "—"}</div>
                      <div><strong>Remarks:</strong> {rowDetail.remarks ?? "—"}</div>
                      <div><strong>GWA Class:</strong> {rowDetail.gwa_classification ?? "—"}</div>
                      <div><strong>APT Total Class:</strong> {rowDetail.apt_total_classification ?? "—"}</div>
                    </div>
                  </div>
                </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
