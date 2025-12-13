import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  ScatterChart,
  LineChart,
  Scatter,
  ComposedChart,
  Line,
  AreaChart,
  Area
} from "recharts";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/* ... THEME, COLOR_PALETTE, LABELS, NUMERIC_FIELDS, helpers, IconButton, StatCard ... 
   (unchanged from your original; include exactly the same definitions) 
*/

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
  id: "ID",
  nameFamily: "Last name",
  nameGiven: "First name",
  nameMiddle: "Middle",
  gender: "Gender",
  address: "Address",
  academicYear: "Academic Year",
  shsGradeLevel: "SHS Grade Level",
  shsStrand: "SHS Strand",
  last_school_name: "Last school",
  track: "Track",
  strand: "Strand",
  status: "Status",

  cfit_rs: "CFIT RS",
  cfit_iq: "CFIT IQ",
  cfit_pc: "CFIT PC",
  cfit_classification: "CFIT Class",

  olsat_verbal_rs: "OLSAT Verbal RS",
  olsat_verbal_ss: "OLSAT Verbal SS",
  olsat_verbal_percentile: "OLSAT Verbal %tile",
  olsat_verbal_stanine: "OLSAT Verbal Stanine",
  olsat_verbal_classification: "OLSAT Verbal Class",

  olsat_nonverbal_rs: "OLSAT Nonverbal RS",
  olsat_nonverbal_ss: "OLSAT Nonverbal SS",
  olsat_nonverbal_pc: "OLSAT Nonverbal PC",
  olsat_nonverbal_stanine: "OLSAT Nonverbal Stanine",
  olsat_nonverbal_classification: "OLSAT Nonverbal Class",

  olsat_total_rs: "OLSAT Total RS",
  olsat_total_ss: "OLSAT Total SS",
  olsat_total_pc: "OLSAT Total PC",
  olsat_total_stanine: "OLSAT Total Stanine",
  olsat_total_classification: "OLSAT Total Class",

  remarks: "Remarks",
  payment_type: "Payment",
};

const NUMERIC_FIELDS = [
  "cfit_rs",
  "cfit_iq",
  "cfit_pc",
  "olsat_verbal_rs",
  "olsat_verbal_ss",
  "olsat_verbal_percentile",
  "olsat_nonverbal_rs",
  "olsat_nonverbal_ss",
  "olsat_nonverbal_pc",
  "olsat_total_rs",
  "olsat_total_ss",
  "olsat_total_pc",
  "olsat_total_stanine"
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

function IconButton({children, title, className="", ...props}){
  return (
    <button aria-label={title} title={title} className={`px-3 py-1 rounded-md shadow-sm border text-sm bg-white hover:scale-103 transform transition-all duration-150 ${className}`} {...props}>
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
      aria-live="polite"
    >
      <div className="text-sm text-gray-600">{title}</div>
      <div className="mt-1 text-2xl font-extrabold" style={{ color: THEME.greenDark }}>{value}</div>
      {subtitle ? <div className="text-xs text-gray-500 mt-1">{subtitle}</div> : null}
    </motion.div>
  );
}

export default function SHSAnalyticsAdvanced(){
  const [gradeLevels, setGradeLevels] = useState([]);
  const [loadingLevels, setLoadingLevels] = useState(false);

  const [selectedLevel, setSelectedLevel] = useState("");
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(50);

  const [query, setQuery] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [academicYearsList, setAcademicYearsList] = useState([]);
  const [loadingYears, setLoadingYears] = useState(false);

  useEffect(() => {
    setLoadingYears(true);
    axios.get("/api/shs-academic-years")
      .then(res => {
        setAcademicYearsList(res.data?.years || []);
      })
      .catch(err => console.error("Failed to load academic years", err))
      .finally(() => setLoadingYears(false));
  }, []);

  const [sortBy, setSortBy] = useState({ key: "nameFamily", dir: "asc" });
  const TABLE_COLS = [
    "id",
    "cfit_rs", "cfit_iq", "cfit_pc", "cfit_classification",
    "olsat_verbal_rs","olsat_verbal_ss","olsat_verbal_percentile","olsat_verbal_stanine","olsat_verbal_classification",
    "olsat_nonverbal_rs","olsat_nonverbal_ss","olsat_nonverbal_pc","olsat_nonverbal_stanine","olsat_nonverbal_classification",
    "olsat_total_rs","olsat_total_ss","olsat_total_pc","olsat_total_stanine","olsat_total_classification",
    "remarks", "payment_type", "academicYear"
  ];

  const [visibleCols, setVisibleCols] = useState([...TABLE_COLS]);
  const allCols = [...TABLE_COLS];
  const [rowDetail, setRowDetail] = useState(null);
  const [compactView, setCompactView] = useState(false);

  const [topN, setTopN] = useState(10);
  const [threshold, setThreshold] = useState(75);
  const [histField, setHistField] = useState("olsat_total_ss");

  useEffect(()=>{
    setLoadingLevels(true);
    axios.get("/api/shs-analytics")
      .then(res=>{
        const list = (res.data && res.data.grade_levels) || [];
        setGradeLevels(list);
        if (list.length && !selectedLevel) setSelectedLevel(list[0].shsGradeLevel);
      })
      .catch(err=>console.error("load grade levels",err))
      .finally(()=>setLoadingLevels(false));
  },[]);

  useEffect(()=>{
    if (!selectedLevel) return;
    fetchDetail(selectedLevel, page, academicYear);
    // eslint-disable-next-line
  },[selectedLevel, page, academicYear]);

  useEffect(()=>{
    // when perPage changes, refresh from page 1 to keep UX predictable
    if (!selectedLevel) return;
    setPage(1);
    fetchDetail(selectedLevel, 1, academicYear);
    // eslint-disable-next-line
  },[perPage]);

  function fetchDetail(level, pageNum=1, year=""){
    setLoadingDetail(true);
    const params = new URLSearchParams();
    params.append("page", pageNum);
    params.append("per_page", perPage);
    if (year) params.append("academicYear", year);

    axios.get(`/api/analytics/shs/${encodeURIComponent(level)}?${params.toString()}`)
      .then(res => setDetail(res.data))
      .catch(err => { console.error("load shs detail", err); setDetail(null); })
      .finally(()=>setLoadingDetail(false));
  }

  const debouncedSetQuery = useMemo(()=>debounce((val)=>setQuery(val), 350), []);
  useEffect(()=> ()=>debouncedSetQuery.cancel(), [debouncedSetQuery]);

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

  const sortedRows = useMemo(()=>{
    const rows = [...filteredRows];
    const k = sortBy.key;
    const dir = sortBy.dir;
    rows.sort((a,b)=>{
      const vaRaw = (a[k]===null || a[k]===undefined) ? "" : a[k];
      const vbRaw = (b[k]===null || b[k]===undefined) ? "" : b[k];

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
    const key = "olsat_total_classification";
    if (detail.classification_stats && detail.classification_stats[key]){
      return detail.classification_stats[key].map((c,i)=>({ name:c.classification, value:c.total, percent:c.percentage, color: COLOR_PALETTE[i%COLOR_PALETTE.length] }));
    }
    const m={};
    (detail.rows||[]).forEach(r=>{ const k = r[key] || r.olsat_total_classification || "Unspecified"; m[k]=(m[k]||0)+1; });
    return Object.keys(m).map((k,i)=>({ name:k, value:m[k], percent: +(((m[k]/(detail.total||1))*100).toFixed(2)), color: COLOR_PALETTE[i%COLOR_PALETTE.length] }));
  },[detail]);

  const topStudents = useMemo(()=>{
    if (!detail || !Array.isArray(detail.rows)) return [];
    const key = detail.rows.some(r=>r.olsat_total_ss!==undefined) ? 'olsat_total_ss' : (detail.rows.some(r=>r.olsat_total_rs!==undefined) ? 'olsat_total_rs' : 'cfit_iq');
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
    const key = histField;
    return (detail.rows||[]).reduce((s,r)=>{
      const v = safeNumber(r[key]);
      if (v!==null && v >= threshold) return s+1;
      return s;
    }, 0);
  },[detail, threshold, histField]);

  function toggleCol(col){
    setVisibleCols(prev => prev.includes(col) ? prev.filter(c=>c!==col) : [...prev, col]);
  }

function exportCSV(){
  if (!detail) return alert("No data.");
  const rows = sortedRows;
  if (!rows.length) return alert("No rows to export.");

  const headers = [
    "id",
    "nameFamily",
    "nameGiven",
    "nameMiddle",
    "gender",
    "address",
    "academicYear",
    "shsGradeLevel",
    "shsStrand",
    "last_school_name",
    "track",
    "strand",
    "status",
    "cfit_rs",
    "cfit_iq",
    "cfit_pc",
    "cfit_classification",
    "olsat_verbal_rs",
    "olsat_verbal_ss",
    "olsat_verbal_percentile",
    "olsat_verbal_stanine",
    "olsat_verbal_classification",
    "olsat_nonverbal_rs",
    "olsat_nonverbal_ss",
    "olsat_nonverbal_pc",
    "olsat_nonverbal_stanine",
    "olsat_nonverbal_classification",
    "olsat_total_rs",
    "olsat_total_ss",
    "olsat_total_pc",
    "olsat_total_stanine",
    "olsat_total_classification",
    "remarks",
    "payment_type"
  ];

  const csv = [
    headers.join(","),
    ...rows.map(r =>
      headers.map(h => `"${(r[h] ?? "").toString().replace(/"/g,'""')}"`).join(",")
    )
  ];

  const blob = new Blob([csv.join("\n")], { type: "text/csv;charset=utf-8;" });
  saveAs(
    blob,
    `shs_${selectedLevel}_page${page}_${new Date().toISOString().slice(0,10)}.csv`
  );
}

function exportExcel(){
  if (!detail) return alert("No data.");
  const rows = sortedRows;
  if (!rows.length) return alert("No rows to export.");

  const headers = [
    "ID",
    "Last Name",
    "First Name",
    "Middle Name",
    "Gender",
    "Address",
    "Academic Year",
    "Grade Level",
    "SHS Strand",
    "Last School",
    "Track",
    "Strand",
    "Status",
    "CFIT RS",
    "CFIT IQ",
    "CFIT PC",
    "CFIT Classification",
    "OLSAT Verbal RS",
    "OLSAT Verbal SS",
    "OLSAT Verbal Percentile",
    "OLSAT Verbal Stanine",
    "OLSAT Verbal Classification",
    "OLSAT Nonverbal RS",
    "OLSAT Nonverbal SS",
    "OLSAT Nonverbal PC",
    "OLSAT Nonverbal Stanine",
    "OLSAT Nonverbal Classification",
    "OLSAT Total RS",
    "OLSAT Total SS",
    "OLSAT Total PC",
    "OLSAT Total Stanine",
    "OLSAT Total Classification",
    "Remarks",
    "Payment Type"
  ];

  const data = rows.map(r => [
    r.id,
    r.nameFamily,
    r.nameGiven,
    r.nameMiddle,
    r.gender,
    r.address,
    r.academicYear,
    r.shsGradeLevel,
    r.shsStrand,
    r.last_school_name,
    r.track,
    r.strand,
    r.status,
    r.cfit_rs,
    r.cfit_iq,
    r.cfit_pc,
    r.cfit_classification,
    r.olsat_verbal_rs,
    r.olsat_verbal_ss,
    r.olsat_verbal_percentile,
    r.olsat_verbal_stanine,
    r.olsat_verbal_classification,
    r.olsat_nonverbal_rs,
    r.olsat_nonverbal_ss,
    r.olsat_nonverbal_pc,
    r.olsat_nonverbal_stanine,
    r.olsat_nonverbal_classification,
    r.olsat_total_rs,
    r.olsat_total_ss,
    r.olsat_total_pc,
    r.olsat_total_stanine,
    r.olsat_total_classification,
    r.remarks,
    r.payment_type
  ]);

  // ✅ CREATE SHEET FIRST
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

  // ✅ STYLE HEADERS + COLUMN WIDTH
  ws['!cols'] = headers.map(() => ({ wch: 18 }));
  headers.forEach((_, i) => {
    const col = XLSX.utils.encode_col(i);
    if (ws[`${col}1`]) {
      ws[`${col}1`].s = { font: { bold: true } };
    }
  });

  // ✅ WORKBOOK
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "SHS Data");

  XLSX.writeFile(
    wb,
    `shs_${selectedLevel}_page${page}_${new Date().toISOString().slice(0,10)}.xlsx`
  );
}


  function exportTopNCSV(){
    if (!detail) return alert("No data.");
    const rows = topStudents;
    if (!rows.length) return alert("No rows to export.");
    const headers = ["Rank","ID","LastName","FirstName","Middle","Score"];
    const csv = [headers.join(",")];
    rows.forEach((r,i)=>{
      const score = r.olsat_total_ss ?? r.olsat_total_rs ?? r.cfit_iq ?? "";
      const line = [i+1, r.id, r.nameFamily, r.nameGiven, r.nameMiddle, score].map(v=>`"${String(v||"").replace(/,/g,"")}"`).join(",");
      csv.push(line);
    });
    const blob = new Blob([csv.join("\n")], { type: "text/csv" });
    saveAs(blob, `${(detail.shsGradeLevel||selectedLevel||"shs").replace(/\s+/g,"_")}_top_${topN}_${new Date().toISOString().slice(0,10)}.csv`);
  }

  function onSort(key){
    setSortBy(prev => {
      if (prev.key === key) return { key, dir: prev.dir==="asc" ? "desc" : "asc" };
      return { key, dir: NUMERIC_FIELDS.includes(key) ? "desc" : "asc" };
    });
  }

  function openRow(r){ setRowDetail(r); }

  const [colDropdownOpen, setColDropdownOpen] = useState(false);
  const [colFilter, setColFilter] = useState("");
  const colDropdownRef = useRef();

  useEffect(() => {
    function onDoc(e){
      if (!colDropdownRef.current) return;
      if (!colDropdownRef.current.contains(e.target)) setColDropdownOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  },[]);

  function prepareCategoryChartData(stats){
    return Object.entries(stats || {}).map(([k,v], i)=>({
      name: k,
      value: v,
      color: COLOR_PALETTE[i % COLOR_PALETTE.length]
    }));
  }

  const genderData = useMemo(() => prepareCategoryChartData(detail?.categoryStats?.gender), [detail]);
  const addressData = useMemo(() => prepareCategoryChartData(detail?.categoryStats?.address), [detail]);
  const academicYearData = useMemo(() => prepareCategoryChartData(detail?.categoryStats?.academicYear), [detail]);
  const shsStrandData = useMemo(() => prepareCategoryChartData(detail?.categoryStats?.shsStrand), [detail]);
  const lastSchoolData = useMemo(() => prepareCategoryChartData(detail?.categoryStats?.last_school_name), [detail]);
  const trackData = useMemo(() => prepareCategoryChartData(detail?.categoryStats?.track), [detail]);
  const strandData = useMemo(() => prepareCategoryChartData(detail?.categoryStats?.strand), [detail]);
  const statusData = useMemo(() => prepareCategoryChartData(detail?.categoryStats?.status), [detail]);

  // small UI helpers
  const Spinner = () => (
    <svg className="animate-spin h-5 w-5 inline-block" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );

  return (
    <div className={`${THEME.bg1} min-h-screen py-8 px-4 text-black`}> 
      {/* FULL WIDTH wrapper (changed from max-w-7xl to w-full) */}
      <div className="w-full mx-auto">

        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 style={{ color: THEME.greenDark }} className="text-3xl md:text-4xl font-extrabold tracking-tight">SHS Analytics</h1>
            <p className="text-sm text-gray-600 mt-1">Interactive analytics — <span className="font-medium">SHS firstChoice</span>. <span className="text-xs text-gray-400">(UI polished)</span></p>
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
            <div className="flex items-center gap-2">
              <label className="sr-only">Select SHS grade level</label>
              <select
                aria-label="Select SHS grade level"
                className="px-3 py-2 rounded-lg border bg-white shadow-sm"
                value={selectedLevel}
                onChange={(e) => { setSelectedLevel(e.target.value); setPage(1); }}
              >
                {loadingLevels ? <option>Loading...</option> : null}
                {!loadingLevels && gradeLevels.length === 0 ? (
                  <option>No grade levels</option>
                ) : null}
                {!loadingLevels &&
                  gradeLevels.map((c) => (
                    <option key={c.shsGradeLevel} value={c.shsGradeLevel}>
                      {c.shsGradeLevel} — {c.totalApplicants}
                    </option>
                  ))}
              </select>

              <select
                aria-label="Academic year"
                className="px-3 py-2 border rounded-lg shadow-sm w-44"
                value={academicYear}
                onChange={(e) => { setAcademicYear(e.target.value); setPage(1); }}
              >
                <option value="">All years</option>
                {loadingYears ? <option>Loading...</option> : null}
                {academicYearsList.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              <button
                title="Refresh data"
                onClick={() => { setPage(1); setQuery(""); setSortBy({ key: "nameFamily", dir: "asc" }); fetchDetail(selectedLevel, 1, academicYear); }}
                className="px-3 py-2 rounded bg-gradient-to-br from-amber-400 to-yellow-500 text-black font-semibold shadow"
              >
                {loadingDetail ? <><Spinner /> Refreshing</> : "Refresh"}
              </button>

            </div>

            <div className="ml-2 flex items-center gap-2">
              <div className="text-xs text-gray-500">Per page</div>
              <select value={perPage} onChange={(e)=>setPerPage(Number(e.target.value))} className="px-2 py-1 border rounded text-sm">
                {[10,25,50,100].map(n=> <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

          </div>
        </header>

        <AnimatePresence>
          {detail && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <StatCard title="Grade level" value={detail.shsGradeLevel} subtitle={`Total applicants: ${detail.total}`} />
              <StatCard title="CFIT (avg)" value={detail.averages?.cfit_iq_avg ?? "—"} subtitle={`CFIT RS avg: ${detail.averages?.cfit_rs_avg ?? "—"}`} />
              <StatCard title="OLSAT Total (avg)" value={detail.averages?.olsat_total_ss_avg ?? "—"} subtitle={`OLSAT Verbal avg: ${detail.averages?.olsat_verbal_ss_avg ?? "—"}`} />
              <StatCard title="Rows shown" value={filteredRows.length} subtitle={`Academic Year: ${academicYear||"All"}`} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- Two chart cards: ensure 2 per row on md+ and equal height --- */}
        {detail && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <motion.div
              initial={{opacity:0, y:8}}
              animate={{opacity:1, y:0}}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 min-h-[320px] h-full flex flex-col"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Average numeric scores</h3>
                <div className="text-sm text-gray-500">Based on displayed rows</div>
              </div>

              {/* make chart area flexible so both cards match height */}
              <div className="flex-1">
                {barData.length===0 ? <div className="text-sm text-gray-500">No numeric data</div> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ left: 0, right: 16 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e7f0ea" />
                      <XAxis dataKey="field" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="avg" radius={[6,6,0,0]}>
                        {barData.map((d,i)=><Cell key={i} fill={COLOR_PALETTE[i%COLOR_PALETTE.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 min-h-[320px] h-full flex flex-col"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">Payment Distribution</h3>
                <span className="text-sm text-gray-500">Counts & Percentages</span>
              </div>

              <div className="flex-1">
                {paymentData.length === 0 ? (
                  <div className="text-sm text-gray-500">No payment data available</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={paymentData} margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" />
                      <YAxis yAxisId="right" orientation="right" tickFormatter={(val) => `${val}%`} />
                      <Tooltip
                        formatter={(value, name, props) =>
                          name === "percent"
                            ? [`${value}%`, "Percentage"]
                            : [value, "Count"]
                        }
                      />
                      <Legend verticalAlign="bottom" height={36} />
                      <Bar yAxisId="left" dataKey="value">
                        {paymentData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Bar>
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="percent"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* --- Remaining chart grid (unchanged logic) --- */}
        {detail && (
 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-6">
  {[ /* same chart definitions */ 
    { title: "Gender", data: genderData, type: "pie" },
    { title: "Address", data: addressData, type: "bar" },
    { title: "Academic Year", data: academicYearData, type: "line" },
    { title: "SHS Strand", data: shsStrandData, type: "bar-horizontal" },
    { title: "Last School", data: lastSchoolData, type: "bar-horizontal" },
    { title: "Track", data: trackData, type: "pie" },
    { title: "Strand", data: strandData, type: "area" },
    { title: "Status", data: statusData, type: "scatter" }
  ].map((chart) => (
<div key={chart.title} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 min-h-[340px] flex flex-col">
      <h3 className="font-semibold text-sm mb-2">{chart.title}</h3>
      {chart.data.length === 0 ? (
        <div className="text-xs text-gray-500">No data</div>
      ) : chart.type === "pie" ? (
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chart.data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={60}
                label={({ name, value }) => `${name} (${value})`}
              >
                {chart.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : chart.type === "bar" ? (
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value">
                {chart.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : chart.type === "bar-horizontal" ? (
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="value">
                {chart.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : chart.type === "line" ? (
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke={THEME.green} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : chart.type === "area" ? (
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke={THEME.green} fill={THEME.green} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : chart.type === "scatter" ? (
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid />
              <XAxis dataKey="name" type="category" />
              <YAxis dataKey="value" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={chart.data} fill={THEME.green} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      ) : null}
    </div>
  ))} 
</div>

)}

        {/* ... rest of component (Rankings, table, modal) remain unchanged ... */}
        {detail && (
          <motion.div initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Rankings & Distribution</h3>
              <div className="text-sm text-gray-500">Top students, histogram, threshold counts</div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
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

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-2 border rounded">
                  <div className="text-sm font-medium mb-2">Histogram — {LABELS[histField]}</div>
                  {histogram.length===0 ? <div className="text-xs text-gray-500">No data</div> : (
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={histogram} margin={{ left: 0, right: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="bucket" tick={{ fontSize: 10 }} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill={THEME.green} radius={[6,6,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="p-2 border rounded">
                  <div className="text-sm font-medium mb-2">CFIT IQ vs OLSAT Total SS</div>
                  {detail.rows.length===0 ? <div className="text-xs text-gray-500">No data</div> : (
                    <ResponsiveContainer width="100%" height={180}>
                      <ScatterChart>
                        <CartesianGrid />
                        <XAxis dataKey="cfit_iq" name="CFIT IQ" />
                        <YAxis dataKey="olsat_total_ss" name="OLSAT Total SS" />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Scatter data={(detail.rows||[]).map(r=>({ cfit_iq: safeNumber(r.cfit_iq), olsat_total_ss: safeNumber(r.olsat_total_ss), name: toFullName(r) })).filter(p=>p.cfit_iq!==null && p.olsat_total_ss!==null)} fill={COLOR_PALETTE[0]} />
                      </ScatterChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="md:col-span-2 p-2 border rounded">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium">Top {topN} students</div>
                    <div className="text-xs text-gray-500">Sorted by OLSAT total SS (or fallback)</div>
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
                            <td className="p-1 text-xs font-medium">{r.olsat_total_ss ?? r.olsat_total_rs ?? r.cfit_iq ?? '—'}</td>
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

        {detail && (
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600 mr-2">Columns</div>

              <div className="relative" ref={colDropdownRef}>
                <button onClick={()=>setColDropdownOpen(s=>!s)} className="px-3 py-1 border rounded-md text-sm bg-white shadow-sm">Toggle columns ▾</button>
                {colDropdownOpen && (
                  <div className="absolute left-0 mt-2 bg-white border rounded shadow-lg z-20 w-72 p-3">
                    <div className="text-xs text-gray-500 mb-2">Show / hide columns</div>
                    <input placeholder="Search columns" value={colFilter} onChange={(e)=>setColFilter(e.target.value)} className="w-full px-2 py-1 border rounded text-sm mb-2" />
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto">
                      {allCols.filter(cc=>!(colFilter && colFilter.length>0) || (LABELS[cc]||cc).toLowerCase().includes(colFilter.toLowerCase())).map(c=> (
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

        {detail && (
  <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
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
          <option value="cfit_iq">CFIT IQ</option>
          <option value="olsat_total_ss">OLSAT Total SS</option>
        </select>
        <button
          onClick={() => setSortBy(s => ({ key: s.key, dir: s.dir === "asc" ? "desc" : "asc" }))}
          className="px-2 py-1 border rounded text-sm"
        >
          Dir: {sortBy.dir}
        </button>
      </div>
    </div>

    <table className={`min-w-max table-auto w-full text-sm ${compactView ? 'text-xs' : ''}`}>
     <thead className="bg-gradient-to-r from-white to-amber-50 sticky top-0 z-10 shadow-sm">
  <tr>
    <th className="p-3 text-left font-semibold text-black">Name</th>
    {allCols.filter(c => visibleCols.includes(c)).map(col => (
      <th
        key={col}
        className="p-3 text-center font-semibold text-black whitespace-nowrap w-[140px] truncate"
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
    <tr key={r.id} className="group odd:bg-white even:bg-gray-50 hover:bg-amber-50 transition-colors hover:shadow-sm">
      <td className="p-2 text-center whitespace-nowrap">{toFullName(r)}</td>
      {allCols.filter(c => visibleCols.includes(c)).map(c => (
        <td key={c} className={`p-2 text-center whitespace-nowrap truncate ${NUMERIC_FIELDS.includes(c) ? "text-center font-medium" : "text-left"}`}>
          {r[c] ?? "—"}
        </td>
      ))}
      <td className="p-2 text-center">
        <div className="flex items-center justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
          <button title="View details" onClick={() => openRow(r)} className="px-2 py-1 border rounded text-sm bg-yellow-500 hover:bg-emerald-500">View</button>
          <button title="Copy row" onClick={() => navigator.clipboard.writeText(JSON.stringify(r))} className="px-2 py-1 border rounded text-sm bg-emerald-500 hover:bg-yellow-500">Copy</button>
        </div>
      </td>
    </tr>
  ))}
</tbody>

    </table>

    <div className="p-3 flex items-center justify-between border-t">
      <div className="text-xs text-gray-600">Page {detail.page ?? page} • {detail.total} total</div>
      <div className="flex items-center gap-2">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} className="px-2 py-1 border rounded  bg-emerald-500 hover:bg-yellow-500">Prev</button>
        <div className="text-xs">Page {page}</div>
        <button onClick={() => setPage(p => p + 1)} className="px-2 py-1 border rounded  bg-yellow-500 hover:bg-emerald-500">Next</button>
      </div>
    </div>
  </div>
)}

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
                      <div><strong>CFIT Class:</strong> {rowDetail.cfit_classification ?? "—"}</div>
                      <div><strong>OLSAT Total Class:</strong> {rowDetail.olsat_total_classification ?? "—"}</div>
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
