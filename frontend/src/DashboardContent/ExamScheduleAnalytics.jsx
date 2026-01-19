import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import {
  BarChart3,
  User,
  FileText,
  ClipboardList,
  CreditCard,
  Layers,
  RefreshCw,
  Download,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const ICONS = [User, FileText, ClipboardList, CreditCard, Layers];
const BAR_COLOR_PALETTE = ["#16A34A", "#F59E0B", "#22C55E", "#FBBF24", "#059669", "#FACC15"];
const PIE_COLORS = ["#16A34A", "#F59E0B"];

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch academic years once (logic intact)
  useEffect(() => {
    axios
      .get("http://localhost:8000/api/analytics/academic-years")
      .then((res) => {
        setYears(res.data || []);
        if (res.data && res.data.length > 0) setSelectedYear((prev) => prev || res.data[0].academicYear);
      })
      .catch((err) => console.error(err));
  }, []);

  // Fetch data & payments for selectedYear (with auto-refresh) — logic unchanged
  const fetchAll = useCallback(() => {
    if (!selectedYear) return;
    setLoading(true);

    axios
      .get(`http://localhost:8000/api/analytics/applications?academicYear=${selectedYear}`)
      .then((res) => setData(res.data || []))
      .catch((err) => console.error(err));

    axios
      .get(`http://localhost:8000/api/analytics/payments?academicYear=${selectedYear}`)
      .then((res) => setPaymentData(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedYear]);

  useEffect(() => {
    if (!selectedYear) return;
    fetchAll();
    const interval = setInterval(fetchAll, 5000);
    return () => clearInterval(interval);
  }, [selectedYear, fetchAll]);

  const totalApplications = data.reduce((sum, item) => sum + (item.total || 0), 0);

  // Transform paymentData into chartData (grouped by applicationType) — logic intact
  const chartData = useMemo(() => {
    const grouped = {};
    paymentData.forEach((item) => {
      if (!grouped[item.applicationType]) grouped[item.applicationType] = { applicationType: item.applicationType };
      grouped[item.applicationType][item.payment_type] = item.total;
    });
    return Object.values(grouped);
  }, [paymentData]);

  const paymentTypes = useMemo(() => Array.from(new Set(paymentData.map((d) => d.payment_type))), [paymentData]);

  const paymentColor = (typeIndex) => BAR_COLOR_PALETTE[typeIndex % BAR_COLOR_PALETTE.length];

  // Export CSV helper (small UX addition) — doesn't change business logic
  const exportCSV = () => {
    const headers = ["ApplicationType", "Total", ...paymentTypes];
    const rows = (data.length ? data : chartData).map((d) => {
      const typeVals = paymentTypes.map((t) => (d[t] != null ? d[t] : 0));
      return [d.applicationType || d.applicationType, d.total || 0, ...typeVals];
    });
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `applications_${selectedYear || "all"}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Custom tooltip preserves the existing payload names/values
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;
    return (
      <div className="rounded-md shadow-md p-3" style={{ background: "white", color: "#064e3b", minWidth: 180 }}>
        <div className="text-sm font-semibold mb-1" style={{ color: "#064e3b" }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span style={{ width: 10, height: 10, background: p.fill, display: "inline-block", borderRadius: 2 }} />
            <span className="font-medium">{p.name}:</span>
            <span className="ml-auto">{p.value ?? 0}</span>
          </div>
        ))}
      </div>
    );
  };

  // Small helper for legend rendering
  const renderLegend = () => (
    <div className="flex flex-wrap gap-3 items-center">
      {paymentTypes.length === 0 && <div className="text-sm text-slate-400">No payment types</div>}
      {paymentTypes.map((type, idx) => (
        <div key={type} className="flex items-center gap-2 text-sm">
          <span style={{ width: 12, height: 12, background: paymentColor(idx), display: "inline-block", borderRadius: 3 }} />
          <span style={{ color: "#065f46", fontWeight: 600 }}>{type}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-50 via-white to-emerald-50">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-50 ring-1 ring-amber-100">
            <BarChart3 className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-emerald-900">Analytics Aplicationm By Academic Year</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold" style={{ color: "#065f46" }}>Academic Year</label>
            <select
              className="border rounded-lg px-3 py-2 text-sm font-medium"
              style={{ borderColor: "#d1fae5", color: "#065f46" }}
              value={selectedYear || ""}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {years.map((y, i) => (
                <option key={i} value={y.academicYear}>{y.academicYear}</option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchAll}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-900/80 shadow-sm border border-gray-100 hover:scale-105 transition"
            aria-label="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm">{loading ? "Refreshing..." : "Refresh"}</span>
          </button>

          <button
            onClick={exportCSV}
            className="ml-2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 
                      text-white text-sm font-medium shadow-sm hover:bg-emerald-700 transition"
            title="Export CSV"
          >
            <Download className="w-4 h-6" />
            Export
          </button>

        </div>
      </div>

      {/* Cards */}
      <div className="flex flex-wrap gap-6 mb-8">
        <div className="flex-1 min-w-[220px] max-w-xs p-5 rounded-2xl bg-white/90 shadow-md flex items-center gap-4 border border-gray-100">
          <div className="p-3 rounded-lg" style={{ background: "#ecfdf5" }}>
            <User className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-700">Total Applications</div>
            <div className="text-2xl font-extrabold text-emerald-900">{totalApplications}</div>
            <div className="text-xs text-slate-400 mt-1">Updated: {new Date().toLocaleString()}</div>
          </div>

          <div className="ml-auto w-20 h-20">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[{ name: "Used", value: Math.min(totalApplications, 100) }, { name: "Remaining", value: Math.max(0, 100 - totalApplications) }]}
                  innerRadius={18}
                  outerRadius={28}
                  dataKey="value"
                  paddingAngle={2}
                  startAngle={90}
                  endAngle={-270}
                >
                  <Cell fill={PIE_COLORS[0]} />
                  <Cell fill={PIE_COLORS[1]} />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {data.map((item, idx) => {
          const Icon = ICONS[idx % ICONS.length];
          const accent = idx % 2 === 0 ? "#16A34A" : "#F59E0B";
          return (
            <div key={idx} className="flex-1 min-w-[220px] max-w-xs rounded-2xl shadow-md p-4 flex items-center gap-4 bg-white/90" style={{ borderLeft: `6px solid ${accent}` }}>
              <div className="p-3 rounded-md bg-gray-50">
                <Icon className="w-6 h-6" style={{ color: accent }} />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-700">{item.applicationType}</div>
                <div className="text-2xl font-bold text-emerald-900">{item.total}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment chart with legend */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-emerald-900">Payment Type per Application</h2>
        <div>{renderLegend()}</div>
      </div>

      <div className="w-full rounded-2xl shadow-md p-4 bg-white/90">
        <ResponsiveContainer width="100%" height={420}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="#e6f2ea" />
            <XAxis dataKey="applicationType" tick={{ fill: "#065f46", fontSize: 13 }} />
            <YAxis tick={{ fill: "#065f46", fontSize: 13 }} />
            <Tooltip content={<CustomTooltip />} />

            {paymentTypes.map((type, idx) => (
              <Bar
                key={type}
                dataKey={type}
                name={type}
                fill={paymentColor(idx)}
                radius={[8, 8, 0, 0]}
                isAnimationActive={true}
                animationDuration={800 + idx * 100}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
