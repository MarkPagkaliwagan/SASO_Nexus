import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { BarChart3, FileText, CreditCard, RefreshCw, DownloadCloud, Filter } from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";

// ------------------ Theme constants ------------------
const THEME = {
  green: "#059669",
  greenLight: "#10B981",
  greenSoft: "#ECFDF5",
  yellow: "#F59E0B",
  yellowSoft: "#FFFBEB",
  bg: "#F8FAFC",
  card: "#FFFFFF",
  muted: "#6B7280",
};

// small helpers
const formatNumber = (n) => new Intl.NumberFormat().format(n || 0);
const truncate = (s, n = 24) => (s && s.length > n ? s.slice(0, n - 1) + "…" : s);
const csvEscape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
const displayName = (t) => (t || "").toString().replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// Skeleton
const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-100 rounded ${className}`} />
);

// KPI (accent can be green or yellow)
const KPI = ({ title, value, icon: Icon, accent = "green", children, className = "" }) => {
  const accentColor = accent === "yellow" ? THEME.yellow : THEME.green;
  const accentBg = accent === "yellow" ? THEME.yellowSoft : THEME.greenSoft;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32 }}
      className={`rounded-2xl p-5 shadow-lg flex items-center gap-4 ${className}`}
      style={{ background: THEME.card }}
    >
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center"
        style={{ background: accentBg }}
      >
        {Icon && <Icon className="w-7 h-7" style={{ color: accentColor }} />}
      </div>
      <div className="flex-1">
        <div className="text-sm" style={{ color: THEME.muted }}>{title}</div>
        <div className="text-3xl sm:text-4xl font-semibold text-gray-800">{value}</div>
        {children}
      </div>
    </motion.div>
  );
};

export default function DashboardV2() {
  const [applications, setApplications] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const pollingRef = useRef(null);
  const isMounted = useRef(false);

  const [presetRange, setPresetRange] = useState("30d");
  const [search, setSearch] = useState("");
  const [visiblePaymentTypes, setVisiblePaymentTypes] = useState(new Set());
  const [chartMode, setChartMode] = useState("group"); // "group" | "stack"

  const fetchData = async ({ silent = true } = {}) => {
    if (!silent) setLoadingInitial(true);
    try {
      const [appsRes, paymentsRes] = await Promise.all([
        axios.get("/api/analytics/applications"),
        axios.get("/api/analytics/payments"),
      ]);

      const apps = Array.isArray(appsRes.data) ? appsRes.data : appsRes.data?.data || [];
      const pays = Array.isArray(paymentsRes.data) ? paymentsRes.data : paymentsRes.data?.data || [];

      setApplications(apps);
      setPayments(pays);
      setLastUpdated(new Date());
      setError(null);

      // default: show ALL payment types (if not set yet)
      if (visiblePaymentTypes.size === 0) {
        const allTypes = Array.from(new Set(pays.map((p) => p.payment_type).filter(Boolean)));
        setVisiblePaymentTypes(new Set(allTypes));
      }
    } catch (err) {
      console.error(err);
      setError("Hindi makuha ang analytics. Tingnan ang console.");
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    fetchData({ silent: false });
    pollingRef.current = setInterval(() => fetchData({ silent: true }), 10000);
    return () => {
      isMounted.current = false;
      clearInterval(pollingRef.current);
    };
  }, []);

  const totalApplications = useMemo(
    () => applications.reduce((s, it) => s + (it.total || 0), 0),
    [applications]
  );

  const paymentTypes = useMemo(
    () => Array.from(new Set(payments.map((p) => p.payment_type).filter(Boolean))),
    [payments]
  );

  // palette: mix of greens and yellows for variety
  const PALETTE = [THEME.green, THEME.greenLight, "#34D399", THEME.yellow, "#FBBF24", "#84CC16"];
  const colorForType = (type, idx) => PALETTE[idx % PALETTE.length];

  // build chart data grouped by application, with totals for sorting
  const chartData = useMemo(() => {
    const grouped = {};
    (payments || []).forEach((p) => {
      const app = p.applicationType || p.application_type || "Unknown";
      const type = p.payment_type || "Unknown";
      if (!grouped[app]) grouped[app] = { applicationType: app, __total: 0 };
      grouped[app][type] = (grouped[app][type] || 0) + (p.total || 0);
      grouped[app].__total += p.total || 0;
    });
    return Object.values(grouped).sort((a, b) => (b.__total || 0) - (a.__total || 0));
  }, [payments]);

  const filteredApplications = useMemo(() => {
    if (!search) return applications;
    return applications.filter((a) => (a.applicationType || "").toLowerCase().includes(search.toLowerCase()));
  }, [applications, search]);

  const togglePaymentType = (type) => {
    setVisiblePaymentTypes((prev) => {
      const copy = new Set(prev);
      if (copy.has(type)) copy.delete(type);
      else copy.add(type);
      return copy;
    });
  };

  // improved CSV export: clear headers, proper quoting & readable filename
  const exportCSV = () => {
    const header = ["Application Type", "Payment Type", "Total"];
    const rows = [header.map(csvEscape).join(",")];

    // always export all raw payment records (not just visible ones)
    payments.forEach((p) => {
      const app = p.applicationType || p.application_type || "";
      const type = p.payment_type || "";
      const total = p.total || 0;
      rows.push([csvEscape(app), csvEscape(type), csvEscape(total)].join(","));
    });

    const blob = new Blob([rows.join("\n")], { type: "text/csv" });

    const now = new Date();
    const niceStamp = now.toISOString().replace(/[:.]/g, "-");
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-${niceStamp}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
      <div className="bg-white p-3 rounded-lg shadow-md border text-sm" style={{ minWidth: 180 }}>
        <div className="font-semibold mb-1">{label}</div>
        {payload.map((pl) => (
          <div key={pl.dataKey} className="flex justify-between gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div style={{ width: 10, height: 10, background: pl.color }} />
              <div className="capitalize">{pl.name || pl.dataKey}</div>
            </div>
            <div className="font-semibold">{formatNumber(pl.value)}</div>
          </div>
        ))}
      </div>
    );
  };

  // ----- Chart helpers to avoid overlap -----
  const categoryCount = chartData.length;
  const useHorizontal = categoryCount > 10; // switch to horizontal layout when many categories
  const chartMinWidth = Math.max(720, categoryCount * 120); // each category gets ~120px when many

  // compute max value across chart to decide label thresholds
  const maxValue = useMemo(() => {
    let m = 0;
    chartData.forEach((row) => {
      Object.keys(row).forEach((k) => {
        if (k === "applicationType" || k === "__total") return;
        m = Math.max(m, row[k] || 0);
      });
    });
    return m || 0;
  }, [chartData]);

  // label formatter: only show labels if they are reasonably large to avoid clutter
  const labelFormatter = (value) => (value >= Math.max(1, maxValue * 0.04) ? formatNumber(value) : "");

  return (
    <div className="min-h-screen text-gray-900 p-6" style={{ background: THEME.bg }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl shadow-md" style={{ background: "linear-gradient(135deg, rgba(5,150,105,0.08), rgba(245,158,11,0.06))" }}>
              <BarChart3 className="w-9 h-9" style={{ color: THEME.green }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Analytics</h1>
              <div className="text-sm text-gray-600 flex items-center gap-3 mt-1">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-gray-400" />
                  <span>Last update: {lastUpdated ? lastUpdated.toLocaleString() : "—"}</span>
                </div>
                {loadingInitial ? (
                  <span className="text-sm text-gray-400">Loading…</span>
                ) : (
                  <button
                    onClick={() => fetchData({ silent: true })}
                    className="px-3 py-1 bg-white border rounded-full text-sm shadow-sm hover:shadow transform hover:scale-[1.02] transition"
                  >
                    <RefreshCw className="w-4 h-4 inline-block mr-2" /> Refresh
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-white p-2 rounded-full shadow-sm">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={presetRange}
                onChange={(e) => setPresetRange(e.target.value)}
                className="text-sm bg-transparent outline-none"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="all">All time</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white p-2 rounded-full shadow-sm flex-1 md:flex-none">
              <input
                placeholder="Search application..."
                className="text-sm outline-none w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button
              onClick={exportCSV}
              className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-full shadow hover:opacity-95 transform hover:scale-[1.02] transition"
              title="Export CSV"
            >
              <DownloadCloud className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column: KPIs and list */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            {loadingInitial ? (
              <Skeleton className="h-40" />
            ) : (
              <KPI title="Total Applications" value={formatNumber(totalApplications)} icon={FileText} accent="green" />
            )}

            <div className="space-y-3">
              {loadingInitial
                ? [1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)
                : filteredApplications.slice(0, 6).map((app, i) => {
                    const spark = payments
                      .filter((p) => (p.applicationType || p.application_type) === app.applicationType)
                      .slice(-12)
                      .map((p, idx) => ({ x: idx, y: p.total || 0 }));

                    return (
                      <div key={i} className="rounded-2xl p-4 shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5 bg-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-gray-500">{app.applicationType}</div>
                            <div className="text-xl font-semibold">{formatNumber(app.total)}</div>
                          </div>
                          <div style={{ width: 160, height: 48 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={spark}>
                                <Line type="monotone" dataKey="y" stroke={THEME.green} strokeWidth={2} dot={false} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    );
                  })}
            </div>
          </div>

          {/* Middle: main chart */}
          <div className="lg:col-span-6 bg-white rounded-2xl shadow p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Payment Types per Application</h3>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <label className="text-xs">Mode:</label>
                  <select
                    value={chartMode}
                    onChange={(e) => setChartMode(e.target.value)}
                    className="text-sm bg-white border px-2 py-1 rounded"
                  >
                    <option value="group">Grouped bars</option>
                    <option value="stack">Stacked bars</option>
                  </select>
                </div>

                <div className="text-sm text-gray-600">
                  <div className="text-xs">Toggle types:</div>
                </div>
              </div>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {paymentTypes.length === 0 && <div className="text-sm text-gray-500">Walang payment types.</div>}
              {paymentTypes.map((t, idx) => (
                <label
                  key={t}
                  className="inline-flex items-center gap-2 bg-white border rounded-full px-3 py-1 shadow-sm text-sm"
                  style={{ borderColor: visiblePaymentTypes.has(t) ? colorForType(t, idx) : undefined }}
                >
                  <input
                    type="checkbox"
                    checked={visiblePaymentTypes.has(t)}
                    onChange={() => togglePaymentType(t)}
                  />
                  <span style={{ width: 12, height: 12, background: colorForType(t, idx), display: "inline-block", borderRadius: 4 }} />
                  <span className="capitalize">{displayName(t)}</span>
                </label>
              ))}
            </div>

            {/* Chart container: when many categories we allow horizontal scroll or switch to horizontal layout */}
            <div style={{ width: "100%", height: 520, overflowX: categoryCount > 8 ? "auto" : "hidden" }}>
              <div style={{ minWidth: useHorizontal ? chartMinWidth : "100%", height: "100%" }}>
                {loadingInitial ? (
                  <Skeleton className="w-full h-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    {useHorizontal ? (
                      // Horizontal (vertical layout) to prevent label overlap when many categories
                      <BarChart
                        layout="vertical"
                        data={chartData}
                        margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tick={{ fontSize: 12 }} />
                        <YAxis type="category" dataKey="applicationType" width={260} tick={{ fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: 12 }} />

                        {paymentTypes
                          .filter((t) => visiblePaymentTypes.has(t))
                          .map((type, idx) => {
                            const isStacked = chartMode === "stack";
                            const commonProps = {
                              key: type,
                              dataKey: type,
                              name: displayName(type),
                              fill: colorForType(type, idx),
                              stackId: isStacked ? "a" : undefined,
                              maxBarSize: 40,
                            };

                            return (
                              <Bar {...commonProps}>
                                <LabelList dataKey={type} position="right" offset={8} formatter={labelFormatter} />
                              </Bar>
                            );
                          })}

                        {Array.from(visiblePaymentTypes).length === 0 && (
                          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#9CA3AF">Piliin ang payment type</text>
                        )}
                      </BarChart>
                    ) : (
                      // Standard vertical bars
                      <BarChart
                        data={chartData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 100 }}
                        barCategoryGap={chartMode === "group" ? "20%" : "5%"}
                        barGap={6}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="applicationType"
                          tick={{ fontSize: 12 }}
                          interval={0}
                          height={80}
                          tickFormatter={(t) => truncate(t, 26)}
                          axisLine={false}
                          tickLine={false}
                          angle={-25}
                          textAnchor="end"
                          tickMargin={12}
                        />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: 20 }} />

                        {paymentTypes
                          .filter((t) => visiblePaymentTypes.has(t))
                          .map((type, idx) => {
                            const isStacked = chartMode === "stack";
                            const commonProps = {
                              key: type,
                              dataKey: type,
                              name: displayName(type),
                              fill: colorForType(type, idx),
                              stackId: isStacked ? "a" : undefined,
                              maxBarSize: Math.max(16, Math.min(40, Math.floor(600 / Math.max(1, categoryCount)))),
                            };

                            return (
                              <Bar {...commonProps}>
                                {/* give labels more breathing room by offsetting them away from bars */}
                                <LabelList dataKey={type} position="top" offset={3} formatter={labelFormatter} />
                              </Bar>
                            );
                          })}

                        {Array.from(visiblePaymentTypes).length === 0 && (
                          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#9CA3AF">Piliin ang payment type</text>
                        )}
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Right column: summaries */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium">Payments Summary</div>
                <div className="text-xs text-gray-500">{payments.length} records</div>
              </div>
              {loadingInitial ? (
                <Skeleton className="h-44" />
              ) : (
                <div className="space-y-3">
                  {paymentTypes.map((t) => {
                    const sum = payments.filter((p) => p.payment_type === t).reduce((s, p) => s + (p.total || 0), 0);
                    return (
                      <div key={t} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div style={{ width: 10, height: 10, background: colorForType(t, paymentTypes.indexOf(t)), borderRadius: 2 }} />
                          <div className="capitalize">{displayName(t)}</div>
                        </div>
                        <div className="font-semibold">{formatNumber(sum)}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium">Quick Insights</div>
              </div>
              {loadingInitial ? (
                <Skeleton className="h-32" />
              ) : (
                <div className="text-sm text-gray-600 space-y-3">
                  <div>Top application: <strong>{applications[0]?.applicationType || "—"}</strong></div>
                  <div>Active payment types: <strong>{paymentTypes.length}</strong></div>
                  <div>Last synced: <strong>{lastUpdated ? lastUpdated.toLocaleTimeString() : "—"}</strong></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {error && <div className="mt-4 text-red-600">{error}</div>}
      </div>
    </div>
  );
}
