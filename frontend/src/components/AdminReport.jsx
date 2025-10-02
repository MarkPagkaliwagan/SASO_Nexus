import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FileText,
  User,
  Calendar,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  BarChart2,
  Clock,
  Layers,
} from "react-feather";

export default function AdminReport() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8000/api/reports", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(res.data);
    } catch (err) {
      console.error("❌ Error fetching reports:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const departments = useMemo(() => {
    const setDept = new Set();
    reports.forEach((r) => r.department && setDept.add(r.department));
    return ["all", ...Array.from(setDept)];
  }, [reports]);

  const displayedReports = useMemo(() => {
    let list = Array.isArray(reports) ? [...reports] : [];

    if (departmentFilter !== "all") {
      list = list.filter((r) => r.department === departmentFilter);
    }

    if (searchTerm.trim() !== "") {
      const q = searchTerm.trim().toLowerCase();
      list = list.filter((r) => {
        const name = (r.staff?.name || "").toLowerCase();
        const message = (r.message || "").toLowerCase();
        return name.includes(q) || message.includes(q);
      });
    }

    if (dateFrom) {
      list = list.filter((r) => new Date(r.created_at) >= new Date(dateFrom));
    }
    if (dateTo) {
      list = list.filter((r) => new Date(r.created_at) <= new Date(dateTo));
    }

    list.sort((a, b) => {
      const ta = new Date(a.created_at).getTime();
      const tb = new Date(b.created_at).getTime();
      return sortOrder === "newest" ? tb - ta : ta - tb;
    });

    return list;
  }, [reports, searchTerm, departmentFilter, sortOrder, dateFrom, dateTo]);

  const toggleSort = () => setSortOrder((s) => (s === "newest" ? "oldest" : "newest"));

  const totalReports = reports.length;
  const totalDepartments = departments.length - 1;
  const latestReportDate = reports.length
    ? new Date(Math.max(...reports.map((r) => new Date(r.created_at)))).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";

  return (
    <div className="min-h-screen w-full p-6 text-black bg-gray-50">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Reports Dashboard</h1>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="flex flex-col justify-center p-5 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-600">
              <BarChart2 className="text-amber-500" size={20} />
              <span className="text-sm">Total Reports</span>
            </div>
            <div className="text-2xl font-semibold mt-2">{totalReports}</div>
          </div>
          <div className="flex flex-col justify-center p-5 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-600">
              <Layers className="text-emerald-500" size={20} />
              <span className="text-sm">Departments</span>
            </div>
            <div className="text-2xl font-semibold mt-2">{totalDepartments}</div>
          </div>
          <div className="flex flex-col justify-center p-5 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="text-blue-500" size={20} />
              <span className="text-sm">Latest Report</span>
            </div>
            <div className="text-sm font-medium mt-2">{latestReportDate}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-3 mb-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" size={16} />
            <input
              aria-label="Search reports by staff or message"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search staff or message"
              className="pl-10 pr-3 py-2 rounded-md border border-gray-200 bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-200 w-64 text-sm"
            />
          </div>

          {/* Department */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-amber-400" />
            <select
              aria-label="Filter by department"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="py-2 px-3 rounded-md border border-gray-200 bg-gray-50 text-sm focus:outline-none"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d === "all" ? "All departments" : d}
                </option>
              ))}
            </select>
          </div>

          {/* Date filters */}
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-amber-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="py-2 px-3 rounded-md border border-gray-200 bg-gray-50 text-sm focus:outline-none"
            />
            <span className="text-gray-500 text-sm">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="py-2 px-3 rounded-md border border-gray-200 bg-gray-50 text-sm focus:outline-none"
            />
          </div>

          {/* Sort */}
          <button
            onClick={toggleSort}
            aria-pressed={sortOrder === "newest"}
            className="flex items-center gap-2 py-2 px-3 rounded-md bg-gray-50 border border-gray-200 shadow-sm hover:bg-gray-100 transition text-sm"
          >
            <Calendar size={16} />
            <span className="text-gray-800">{sortOrder === "newest" ? "Newest" : "Oldest"}</span>
            {sortOrder === "newest" ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500" />
          </div>
        ) : reports.length === 0 ? (
          <div className="py-14 text-center text-gray-500">No reports submitted yet.</div>
        ) : (
          <div className="space-y-3">
            {displayedReports.map((report) => (
              <article
                key={report.id}
                className="w-full bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition"
              >
                <div className="flex items-start gap-4 w-full">
                  {/* Staff info */}
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-emerald-100 text-emerald-700">
                      <User size={16} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {report.staff?.name || "Unknown"}
                      </div>
                      <div className="mt-0.5 text-xs text-gray-500">
                        {report.staff?.position || "Staff"}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                          {report.department}
                        </span>
                        <div className="text-xs text-gray-500">
                          {new Date(report.created_at).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 font-mono">#{report.id}</div>
                    </div>

                    <p className="mt-3 text-sm text-gray-700">{report.message || "—"}</p>

                    {report.file_path && (
                      <a
                        href={`http://localhost:8000/storage/${report.file_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-3 text-sm text-amber-600 hover:underline"
                      >
                        <FileText size={16} /> View Attachment
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
