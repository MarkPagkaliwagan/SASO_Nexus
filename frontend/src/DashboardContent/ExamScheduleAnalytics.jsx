// Dashboard.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  BarChart3,
  User,
  FileText,
  ClipboardList,
  CreditCard,
  Layers,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const ICONS = [User, FileText, ClipboardList, CreditCard, Layers];

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);

  // Flat, bold color palette for bars (green & yellow primary)
  const BAR_COLOR_PALETTE = ["#16A34A", "#F59E0B", "#22C55E", "#FBBF24", "#059669", "#FACC15"];
  // Pie: primary green and accent yellow
  const PIE_COLORS = ["#16A34A", "#F59E0B"];

  // Fetch academic years once
  useEffect(() => {
    axios.get("http://localhost:8000/api/analytics/academic-years")
      .then(res => {
        setYears(res.data || []);
        if (res.data && res.data.length > 0) setSelectedYear(res.data[0].academicYear);
      })
      .catch(err => console.error(err));
  }, []);

  // Fetch data & payments for selectedYear (with auto-refresh)
  useEffect(() => {
    if (!selectedYear) return;

    const fetchData = () => {
      axios.get(`http://localhost:8000/api/analytics/applications?academicYear=${selectedYear}`)
        .then(res => setData(res.data || []))
        .catch(err => console.error(err));

      axios.get(`http://localhost:8000/api/analytics/payments?academicYear=${selectedYear}`)
        .then(res => setPaymentData(res.data || []))
        .catch(err => console.error(err));
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [selectedYear]);

  const totalApplications = data.reduce((sum, item) => sum + (item.total || 0), 0);

  // Transform paymentData into chartData (grouped by applicationType)
  const chartData = useMemo(() => {
    const grouped = {};
    paymentData.forEach(item => {
      if (!grouped[item.applicationType]) grouped[item.applicationType] = { applicationType: item.applicationType };
      grouped[item.applicationType][item.payment_type] = item.total;
    });
    return Object.values(grouped);
  }, [paymentData]);

  // Derive unique payment types in stable order for legend + color mapping
  const paymentTypes = useMemo(() => {
    const types = Array.from(new Set(paymentData.map(d => d.payment_type)));
    return types;
  }, [paymentData]);

  const paymentColor = (typeIndex) => BAR_COLOR_PALETTE[typeIndex % BAR_COLOR_PALETTE.length];

  // Custom Tooltip for bar chart (styled)
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;
    return (
      <div className="rounded-md shadow-md p-3" style={{ background: "white", color: "#064e3b", minWidth: 160 }}>
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

  // Custom legend renderer (flat colored badges + label)
  const renderLegend = () => {
    return (
      <div className="flex flex-wrap gap-3 items-center">
        {paymentTypes.map((type, idx) => (
          <div key={type} className="flex items-center gap-2 text-sm">
            <span style={{
              width: 12,
              height: 12,
              background: paymentColor(idx),
              display: "inline-block",
              borderRadius: 3
            }} />
            <span style={{ color: "#065f46", fontWeight: 600 }}>{type}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8" style={{ color: "#F59E0B" }} />
          <h1 className="text-3xl font-extrabold" style={{ color: "#064e3b" }}>Analytics Dashboard</h1>
        </div>

        {/* Year selector (compact, clear) */}
        <div className="flex items-center gap-3">
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
      </div>

      {/* CARDS */}
      <div className="flex flex-wrap gap-6 mb-8">
        {/* Total Applications card - white, bold accent */}
        <div className="flex-1 min-w-[220px] max-w-xs p-5 rounded-2xl shadow-lg flex items-center gap-4" style={{ background: "white" }}>
          <div className="p-3 rounded-lg" style={{ background: "#ecfdf5" }}>
            <User className="w-6 h-6" style={{ color: "#16A34A" }} />
          </div>
          <div>
            <div className="text-sm font-semibold" style={{ color: "#065f46" }}>Total Applications</div>
            <div className="text-2xl font-extrabold" style={{ color: "#064e3b" }}>{totalApplications}</div>
          </div>
          <div className="ml-auto w-20 h-20">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Used", value: totalApplications },
                    { name: "Remaining", value: Math.max(0, 100 - totalApplications) }
                  ]}
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

        {/* Application type cards (icon, totals) */}
        {data.map((item, idx) => {
          const Icon = ICONS[idx % ICONS.length];
          // flat colored left accent strip for stronger visual
          const accent = idx % 2 === 0 ? "#16A34A" : "#F59E0B";
          return (
            <div key={idx} className="flex-1 min-w-[220px] max-w-xs rounded-2xl shadow-lg p-4 flex items-center gap-4" style={{ background: "white", borderLeft: `6px solid ${accent}` }}>
              <div className="p-3 rounded-md" style={{ background: "#f8fafc" }}>
                <Icon className="w-6 h-6" style={{ color: accent }} />
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: "#065f46" }}>{item.applicationType}</div>
                <div className="text-2xl font-bold" style={{ color: "#064e3b" }}>{item.total}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PAYMENT BAR GRAPH SECTION */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold" style={{ color: "#065f46" }}>Payment Type per Application</h2>
        <div>{renderLegend()}</div>
      </div>

      <div className="w-full rounded-2xl shadow-lg p-4" style={{ background: "white" }}>
        <ResponsiveContainer width="100%" height={420}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            barCategoryGap="20%"
          >
            {/* subtle grid lines */}
            <CartesianGrid strokeDasharray="3 3" stroke="#e6f2ea" />
            <XAxis dataKey="applicationType" tick={{ fill: "#065f46", fontSize: 13 }} />
            <YAxis tick={{ fill: "#065f46", fontSize: 13 }} />
            <Tooltip content={<CustomTooltip />} />

            {/* render bars for each payment type (grouped bars) */}
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
};

export default Dashboard;
