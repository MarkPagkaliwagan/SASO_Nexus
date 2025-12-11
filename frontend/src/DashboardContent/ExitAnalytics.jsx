import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import {
  ClipboardList,
  UserCheck,
  Layers,
  RefreshCw,
  Download,
  ChevronDown,
  TrendingUp,
  PieChart as PieIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

const ICONS = [ClipboardList, UserCheck, Layers, TrendingUp, PieIcon];
const ACCENT_COLORS = ["#16A34A", "#F59E0B", "#3B82F6", "#EC4899", "#F97316"];

export default function ExitDashboardRevamp() {
  const [data, setData] = useState({
    departments: [],
    statusBreakdown: [],
    courses: [],
    reasons: [],
  });
  const [groupMode, setGroupMode] = useState("stack");
  const [orientation, setOrientation] = useState("vertical");
  const [loading, setLoading] = useState(false);

  const fetchExitData = useCallback(() => {
    setLoading(true);
    axios
      .get("http://localhost:8000/api/analytics/exit-bookings")
      .then((res) => setData(res.data || { departments: [], statusBreakdown: [] }))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchExitData();
    const interval = setInterval(fetchExitData, 5000);
    return () => clearInterval(interval);
  }, [fetchExitData]);

  // --- preserve original transforms ---
  const totalExit = useMemo(
    () => data.departments.reduce((sum, item) => sum + (item.total || 0), 0),
    [data.departments]
  );

  const chartData = useMemo(
    () =>
      Object.values(
        data.statusBreakdown.reduce((acc, curr) => {
          if (!acc[curr.department]) acc[curr.department] = { department: curr.department };
          acc[curr.department][curr.status] = curr.count;
          return acc;
        }, {})
      ),
    [data.statusBreakdown]
  );

  const statusKeys = useMemo(() => [...new Set(data.statusBreakdown.map((s) => s.status))], [data.statusBreakdown]);

  const courseData = data.courses.map((c) => ({ name: c.course, total: c.total }));
  const reasonData = data.reasons.map((r) => ({ name: r.reason || "No Reason", total: r.total }));

  const percentOfTotal = (value) => (totalExit > 0 ? Math.round((value / totalExit) * 100) : 0);

  function exportCSV() {
    const headers = ["Department", "Total", ...statusKeys];
    const rows = data.departments.map((d) => {
      const statuses = statusKeys.map((k) => {
        const match = data.statusBreakdown.find((s) => s.department === d.department && s.status === k);
        return match ? match.count : 0;
      });
      return [d.department, d.total, ...statuses];
    });

    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `exit_bookings_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // helper: top department
  const topDepartment = useMemo(() => {
    if (!data.departments.length) return { department: "-", total: 0 };
    return data.departments.reduce((best, cur) => (cur.total > best.total ? cur : best), data.departments[0]);
  }, [data.departments]);

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-50 via-white to-emerald-50">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-emerald-600/10 ring-1 ring-emerald-100">
            <ClipboardList className="w-9 h-9 text-emerald-700" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-emerald-900">Exit Bookings — Analytics</h1>
            <p className="text-sm text-slate-500 mt-1">Mas visual, modern look. Logic at data intact — plug & play.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchExitData}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-900/80 hover:bg-yellow-300 shadow-sm border border-gray-100 hover:scale-105 transition"
            aria-label="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm">{loading ? "Refreshing..." : "Refresh"}</span>
          </button>

          <div className="relative inline-flex items-center gap-2">
            <button
              onClick={() => setGroupMode((g) => (g === "stack" ? "group" : "stack"))}
              className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium shadow-sm hover:bg-yellow-400 transition"
            >
              {groupMode === "stack" ? "Stacked" : "Grouped"}
            </button>

            <button
              onClick={() => setOrientation((o) => (o === "vertical" ? "horizontal" : "vertical"))}
              className="ml-2 px-3 py-2 rounded-lg bg-green-950/90 hover:bg-yellow-500 border border-gray-100 text-sm shadow-sm hover:scale-105 transition"
            >
              Orientation: {orientation === "vertical" ? "Vertical" : "Horizontal"}
            </button>

            <button
              onClick={exportCSV}
              className="ml-2 px-2 py-2 rounded-lg bg-yellow-600 border border-gray-100 shadow-sm hover:scale-105 transition"
              title="Export CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* GRID: cards + charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: small cards + department list */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
          {/* STAT CARDS */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div layout className="col-span-2 rounded-2xl bg-white/95 p-4 shadow-md border border-gray-100 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-700">Total Exit Bookings</div>
                  <motion.div
                    className="text-3xl font-extrabold text-emerald-900"
                    animate={{ opacity: [0.6, 1], y: [4, 0] }}
                    transition={{ duration: 0.6 }}
                  >
                    {totalExit}
                  </motion.div>
                  <div className="text-xs text-slate-400 mt-1">Updated: {new Date().toLocaleString()}</div>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50">
                  <UserCheck className="w-7 h-7 text-emerald-700" />
                </div>
              </div>
            </motion.div>

            <div className="rounded-2xl bg-white/95 p-4 shadow-md border border-gray-100">
              <div className="text-sm text-slate-500">Departments</div>
              <div className="mt-2 text-xl font-bold text-slate-800">{data.departments.length}</div>
              <div className="text-xs text-slate-400 mt-1">Unique departments tracked</div>
            </div>

            <div className="rounded-2xl bg-white/95 p-4 shadow-md border border-gray-100">
              <div className="text-sm text-slate-500">Courses</div>
              <div className="mt-2 text-xl font-bold text-slate-800">{data.courses.length}</div>
              <div className="text-xs text-slate-400 mt-1">Unique courses found</div>
            </div>

            <div className="rounded-2xl bg-white/95 p-4 shadow-md border border-gray-100">
              <div className="text-sm text-slate-500">Top Dept</div>
              <div className="mt-2 text-xl font-bold text-slate-800">{topDepartment.department}</div>
              <div className="text-xs text-slate-400 mt-1">{topDepartment.total} exits</div>
            </div>
          </div>

          {/* Department list with sparklines */}
          <div className="rounded-2xl bg-white/90 p-4 shadow-md border border-gray-100 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-700">Departments</h3>
              <div className="inline-flex items-center text-xs text-slate-400">
                {data.departments.length} found <ChevronDown className="w-4 h-4 ml-1" />
              </div>
            </div>

            <div className="space-y-3 max-h-72 overflow-auto pr-1">
              {data.departments.length === 0 && <div className="text-sm text-slate-400">No departments yet</div>}

              {data.departments.map((d, idx) => {
                const Icon = ICONS[idx % ICONS.length];
                const color = ACCENT_COLORS[idx % ACCENT_COLORS.length];
                const pct = percentOfTotal(d.total || 0);

                // build a tiny sparkline: counts per status for this department
                const sparkData = statusKeys.map((s) => {
                  const match = data.statusBreakdown.find((x) => x.department === d.department && x.status === s);
                  return { name: s, value: match ? match.count : 0 };
                });

                return (
                  <div key={d.department} className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className="p-2 rounded-lg bg-gray-50 ring-1 ring-gray-100" style={{ borderLeft: `4px solid ${color}` }}>
                        <Icon className="w-6 h-6" style={{ color }} />
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-baseline justify-between">
                        <div className="text-sm font-medium text-slate-700">{d.department}</div>
                        <div className="text-sm font-semibold text-emerald-900">{d.total}</div>
                      </div>

                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex-1 h-8">
                          <ResponsiveContainer width="100%" height={40}>
                            <LineChart data={sparkData} margin={{ left: -10, right: -10 }}>
                              <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="w-20 text-xs text-slate-400">{pct}% of total</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Small legend */}
          <div className="rounded-2xl bg-white/90 p-4 shadow-sm border border-gray-100 text-sm">
            <div className="font-medium text-slate-700 mb-2">Statuses</div>
            <div className="flex flex-wrap gap-2">
              {statusKeys.length === 0 && <div className="text-slate-400">No status data</div>}
              {statusKeys.map((s, i) => (
                <div key={s} className="px-3 py-1 rounded-full text-xs font-medium ring-1 ring-gray-100" style={{ background: `${ACCENT_COLORS[i % ACCENT_COLORS.length]}22`, color: ACCENT_COLORS[i % ACCENT_COLORS.length] }}>
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: charts */}
        <div className="lg:col-span-8 xl:col-span-9">
          <div className="rounded-2xl bg-white/90 p-6 shadow-md border border-gray-100 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-emerald-900">Exit Bookings by Status per Department</h2>
              <div className="text-sm text-slate-500">Orientation: <span className="font-medium text-slate-700 ml-1">{orientation}</span></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    layout={orientation === "horizontal" ? "vertical" : undefined}
                    barGap={groupMode === "group" ? 6 : 12}
                    barCategoryGap={groupMode === "group" ? "15%" : "20%"}
                  >
                    {orientation === "horizontal" ? (
                      <>
                        <XAxis type="number" />
                        <YAxis dataKey="department" type="category" width={160} />
                      </>
                    ) : (
                      <>
                        <XAxis dataKey="department" />
                        <YAxis />
                      </>
                    )}

                    <Tooltip />
                    <Legend />

                    {statusKeys.map((status, i) => (
                      <Bar
                        key={status}
                        dataKey={status}
                        stackId={groupMode === "stack" ? "a" : undefined}
                        fill={ACCENT_COLORS[i % ACCENT_COLORS.length]}
                        radius={orientation === "horizontal" ? [0, 6, 6, 0] : [6, 6, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* LINE: statuses as lines across departments */}
              <div className="h-64 rounded-lg p-3 bg-white/80 border border-gray-100">
                <div className="text-sm font-medium text-slate-700 mb-2">Status Trends (per department)</div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" />
                      <YAxis />
                      <Tooltip />
                      <Legend />

                      {statusKeys.map((status, i) => (
                        <Line key={status} type="monotone" dataKey={status} stroke={ACCENT_COLORS[i % ACCENT_COLORS.length]} strokeWidth={2} dot={false} />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

          </div>

          {/* COURSE CHART */}
          <div className="rounded-2xl bg-white/90 p-6 shadow-md border border-gray-100 mt-6">
            <h2 className="text-lg font-bold text-emerald-900 mb-4">Exit Bookings per Course</h2>

            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={courseData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* REASON CHART */}
          <div className="rounded-2xl bg-white/90 p-6 shadow-md border border-gray-100 mt-6">
            <h2 className="text-lg font-bold text-emerald-900 mb-4">Exit Bookings per Reason</h2>

            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={reasonData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#F97316" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
