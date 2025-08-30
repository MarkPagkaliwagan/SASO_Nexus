import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  PlusCircle,
  Edit,
  Trash2,
  Search,
  Eye,
  EyeOff,
  Download,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "react-feather";
import * as XLSX from "xlsx";

// NOTE: This file expects the `xlsx` package to be available (npm i xlsx)
// Export now produces a real .xlsx file using dynamic import of sheetjs (xlsx).

export default function StaffPanel() {
  const [staffs, setStaffs] = useState([]);
  const [editingStaff, setEditingStaff] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    position: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("id");
  const [sortDir, setSortDir] = useState("asc");

  const [toasts, setToasts] = useState([]);

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // column visibility
  const [visibleCols, setVisibleCols] = useState({
    id: true,
    name: true,
    email: true,
    position: true,
    created_at: true,
    updated_at: true,
  });

  const token = localStorage.getItem("token");

  const formatDate = (s) => (s ? new Date(s).toLocaleString() : "—");

  useEffect(() => {
    fetchStaffs();
  }, []);

  const fetchStaffs = async () => {
    setIsFetching(true);
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/staff", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaffs(res.data || []);
    } catch (err) {
      console.error(err);
      showToast("Failed to load staff list", "error");
    } finally {
      setIsFetching(false);
    }
  };

  const resetForm = () => {
    setEditingStaff(null);
    setForm({ name: "", email: "", position: "", password: "" });
    setErrors({});
    setShowPassword(false);
    // keep page number etc intact
  };

  const showToast = (message, type = "info", timeout = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), timeout);
  };

  const validateForm = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!(form.email.includes("@") && form.email.includes(".")))
      e.email = "Invalid email";
    if (!editingStaff && !form.password) e.password = "Password is required";
    return e;
  };

  const handleSave = async (ev) => {
    if (ev && ev.preventDefault) ev.preventDefault();
    const e = validateForm();
    setErrors(e);
    if (Object.keys(e).length) return;

    // client-side duplicate email check when creating
    if (!editingStaff) {
      const exists = staffs.find(
        (s) => s.email?.toLowerCase() === form.email.toLowerCase()
      );
      if (exists) {
        setErrors({ email: "Email already exists" });
        return;
      }
    }

    setIsSaving(true);
    try {
      if (editingStaff) {
        await axios.put(
          `http://127.0.0.1:8000/api/staff/${editingStaff.id}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showToast("Staff updated", "success");
      } else {
        await axios.post("http://127.0.0.1:8000/api/staff", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showToast("Staff created", "success");
      }
      await fetchStaffs();
      resetForm();
    } catch (err) {
      console.error(err);
      const msg =
        err && err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "Save failed";
      showToast(msg, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this staff?")) return;
    setIsDeletingId(id);
    try {
      await axios.delete(`http://127.0.0.1:8000/api/staff/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Staff deleted", "success");
      await fetchStaffs();
    } catch (err) {
      console.error(err);
      showToast("Delete failed", "error");
    } finally {
      setIsDeletingId(null);
    }
  };

  const startEdit = (s) => {
    setEditingStaff(s);
    setForm({
      name: s.name || "",
      email: s.email || "",
      position: s.position || "",
      password: "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // avatar color based on id/email
  const avatarColor = (seed) => {
    const colors = [
      "bg-green-100",
      "bg-green-200",
      "bg-emerald-100",
      "bg-lime-100",
      "bg-sky-100",
    ];
    const n = Math.abs(
      String(seed)
        .split("")
        .reduce((acc, c) => acc + c.charCodeAt(0), 0)
    );
    return colors[n % colors.length];
  };

  const initials = (name) => {
    if (!name) return "—";
    return name
      .split(" ")
      .map((i) => i[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // filtering/sorting
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = staffs.slice();
    if (q)
      list = list.filter((s) =>
        [String(s.id), s.name, s.email, s.position]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    list.sort((a, b) => {
      const A = ((a[sortKey] == null ? "" : a[sortKey]) + "")
        .toString()
        .toLowerCase();
      const B = ((b[sortKey] == null ? "" : b[sortKey]) + "")
        .toString()
        .toLowerCase();
      if (A < B) return sortDir === "asc" ? -1 : 1;
      if (A > B) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [staffs, query, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages]);

  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  // Export Excel using sheetjs (xlsx). Uses visibleCols to export only visible columns.
  const exportExcel = async () => {
    try {
      // Build columns in order
      const colKeys = [
        "id",
        "name",
        "email",
        "position",
        "created_at",
        "updated_at",
      ].filter((c) => visibleCols[c]);
      // Prepare rows as objects with pretty headers
      const pretty = {
        id: "ID",
        name: "Name",
        email: "Email",
        position: "Position",
        created_at: "Created",
        updated_at: "Updated",
      };

      const rows = filtered.map((r) => {
        const o = {};
        colKeys.forEach((k) => {
          o[pretty[k]] =
            k.indexOf("created") !== -1 || k.indexOf("updated") !== -1
              ? formatDate(r[k])
              : r[k] == null
              ? ""
              : r[k];
        });
        return o;
      });

      const ws = XLSX.utils.json_to_sheet(rows, {
        header: colKeys.map((k) => pretty[k]),
      });

      // set column widths for nicer look
      const cols = colKeys.map((k) => {
        if (k === "id") return { wpx: 50 };
        if (k === "name") return { wpx: 200 };
        if (k === "email") return { wpx: 220 };
        if (k === "position") return { wpx: 140 };
        return { wpx: 140 };
      });
      ws["!cols"] = cols;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Staffs");

      // Write file (this will create a .xlsx that opens in Excel)
      XLSX.writeFile(wb, "staffs.xlsx");
      showToast("Exported to staffs.xlsx", "success");
    } catch (err) {
      console.error(err);
      showToast(
        "Export failed — make sure `xlsx` is installed (npm i xlsx).",
        "error"
      );
    }
  };

  const toggleCol = (k) => setVisibleCols((v) => ({ ...v, [k]: !v[k] }));

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg text-black">
      {/* header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Staff Account Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Please add new staffs here.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 border rounded px-2 py-1">
            <button
              title="Export Excel"
              onClick={exportExcel}
              className="flex items-center gap-2 text-sm"
            >
              <Download size={14} /> Export Excel
            </button>
          </div>

          <div className="flex items-center gap-2 border rounded px-2 py-1">
            <button
              title="Refresh staff list"
              onClick={fetchStaffs}
              className="flex items-center gap-2 text-sm"
            >
              <RotateCcw size={14} /> Refresh
            </button>
          </div>

          <div className="flex items-center gap-2 border rounded px-2 py-1">
            <button
              title="New staff (reset form)"
              onClick={resetForm}
              className="flex items-center gap-2 text-sm"
            >
              <PlusCircle size={14} /> New
            </button>
          </div>
        </div>
      </div>

      {/* top card: add / edit */}
      <div className="bg-gradient-to-r from-white to-green-50 border border-gray-100 rounded-2xl p-5 shadow-sm mb-6">
        <form
          onSubmit={handleSave}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
        >
          <div>
            <label className="text-xs font-medium text-gray-600">
              Full name
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full border rounded px-3 py-2"
              placeholder="John Doe"
            />
            {errors.name && (
              <div className="text-rose-600 text-xs mt-1">{errors.name}</div>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">Email</label>
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full border rounded px-3 py-2"
              placeholder="email@school.edu"
            />
            {errors.email && (
              <div className="text-rose-600 text-xs mt-1">{errors.email}</div>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">
              Position
            </label>
            <input
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              className="mt-1 w-full border rounded px-3 py-2"
              placeholder="e.g. Librarian"
            />
          </div>

          <div className="relative">
            <label className="text-xs font-medium text-gray-600">
              {editingStaff ? "New password (optional)" : "Password"}
            </label>
            {/* -- changed button positioning so the eye is vertically centered inside the textbox -- */}
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1 w-full border rounded px-3 py-2 pr-10 [appearance:none]"
              placeholder={editingStaff ? "Leave blank to keep" : "Enter password"}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-[70%] -translate-y-1/2 text-gray-600"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            {errors.password && (
              <div className="text-rose-600 text-xs mt-1">
                {errors.password}
              </div>
            )}
          </div>

          <div className="md:col-span-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className={`px-4 py-2 rounded-lg text-white flex items-center gap-2 ${
                isSaving ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isSaving ? (
                <>Saving...</>
              ) : editingStaff ? (
                <>
                  <Edit size={14} /> Update staff
                </>
              ) : (
                <>
                  <PlusCircle size={14} /> Create staff
                </>
              )}
            </button>
            {editingStaff && (
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-2 rounded-lg border flex items-center gap-2"
              >
                <RotateCcw size={14} /> Cancel
              </button>
            )}
            {!editingStaff && (
              <button
                type="button"
                onClick={() =>
                  setForm({ name: "", email: "", position: "", password: "" })
                }
                className="px-3 py-2 rounded-lg border flex items-center gap-2"
                title="Clear fields"
              >
                <RotateCcw size={14} /> Clear
              </button>
            )}

            <div className="ml-auto text-sm text-gray-500 flex items-center gap-2">
              <span>
                {editingStaff
                  ? `Editing: ${editingStaff.name}`
                  : "Add new staff"}
              </span>
            </div>
          </div>
        </form>
      </div>

      {/* controls: search / col toggles / page size */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-4">
        <div className="flex items-center gap-2 w-full md:w-1/2">
          <Search size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, position or id"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="text-sm text-gray-600">Columns:</div>
          {Object.keys(visibleCols).map((k) => (
            <label key={k} className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={visibleCols[k]}
                onChange={() => toggleCol(k)}
              />
              <span className="capitalize">{k.replace("_", " ")}</span>
            </label>
          ))}

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Page size</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="border rounded px-2 py-1"
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {visibleCols.id && (
                <th
                  className="text-left p-3 border-b cursor-pointer"
                  onClick={() => toggleSort("id")}
                >
                  <div className="flex items-center gap-2">
                    ID{" "}
                    <span className="text-xs text-gray-500">
                      {sortKey === "id" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                    </span>
                  </div>
                </th>
              )}

              {visibleCols.name && (
                <th
                  className="text-left p-3 border-b cursor-pointer"
                  onClick={() => toggleSort("name")}
                >
                  Name{" "}
                  <span className="text-xs text-gray-500">
                    {sortKey === "name" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                  </span>
                </th>
              )}

              {visibleCols.email && (
                <th
                  className="text-left p-3 border-b cursor-pointer"
                  onClick={() => toggleSort("email")}
                >
                  Email
                </th>
              )}
              {visibleCols.position && (
                <th
                  className="text-left p-3 border-b cursor-pointer"
                  onClick={() => toggleSort("position")}
                >
                  Position
                </th>
              )}
              {visibleCols.created_at && (
                <th
                  className="text-left p-3 border-b cursor-pointer"
                  onClick={() => toggleSort("created_at")}
                >
                  Created
                </th>
              )}
              {visibleCols.updated_at && (
                <th
                  className="text-left p-3 border-b cursor-pointer"
                  onClick={() => toggleSort("updated_at")}
                >
                  Updated
                </th>
              )}
              <th className="text-left p-3 border-b">Actions</th>
            </tr>
          </thead>

          <tbody>
            {isFetching ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {visibleCols.id && (
                    <td className="p-3 border-t">
                      <div className="h-4 w-8 bg-gray-200 rounded" />
                    </td>
                  )}
                  {visibleCols.name && (
                    <td className="p-3 border-t">
                      <div className="h-4 w-40 bg-gray-200 rounded" />
                    </td>
                  )}
                  {visibleCols.email && (
                    <td className="p-3 border-t">
                      <div className="h-4 w-48 bg-gray-200 rounded" />
                    </td>
                  )}
                  {visibleCols.position && (
                    <td className="p-3 border-t">
                      <div className="h-4 w-32 bg-gray-200 rounded" />
                    </td>
                  )}
                  {visibleCols.created_at && (
                    <td className="p-3 border-t">
                      <div className="h-4 w-24 bg-gray-200 rounded" />
                    </td>
                  )}
                  {visibleCols.updated_at && (
                    <td className="p-3 border-t">
                      <div className="h-4 w-24 bg-gray-200 rounded" />
                    </td>
                  )}
                  <td className="p-3 border-t">
                    <div className="h-4 w-24 bg-gray-200 rounded" />
                  </td>
                </tr>
              ))
            ) : pageData.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-500">
                  No staff found
                </td>
              </tr>
            ) : (
              pageData.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  {visibleCols.id && <td className="p-3 border-t">{s.id}</td>}

                  {visibleCols.name && (
                    <td className="p-3 border-t flex items-center gap-3">
                      <div
                        className={`flex items-center justify-center rounded-full h-8 w-8 text-sm font-semibold text-gray-800 ${avatarColor(
                          s.id
                        )}`}
                      >
                        {initials(s.name)}
                      </div>
                      <div>
                        <div className="font-medium">{s.name}</div>
                        {/* removed redundant small email under the name as requested */}
                      </div>
                    </td>
                  )}

                  {visibleCols.email && (
                    <td className="p-3 border-t">{s.email}</td>
                  )}
                  {visibleCols.position && (
                    <td className="p-3 border-t">{s.position || "—"}</td>
                  )}
                  {visibleCols.created_at && (
                    <td className="p-3 border-t">{formatDate(s.created_at)}</td>
                  )}
                  {visibleCols.updated_at && (
                    <td className="p-3 border-t">{formatDate(s.updated_at)}</td>
                  )}

                  <td className="p-3 border-t flex gap-2">
                    <button
                      onClick={() => startEdit(s)}
                      className="flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <Edit size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="flex items-center gap-1 text-red-600 hover:underline"
                      disabled={isDeletingId === s.id}
                    >
                      <Trash2 size={14} />
                      {isDeletingId === s.id ? " Deleting..." : " Delete"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {Math.min((page - 1) * pageSize + 1, filtered.length)} to{" "}
          {Math.min(page * pageSize, filtered.length)} of {filtered.length}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="p-2 border rounded"
            title="Previous page"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages })
              .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
              .map((_, i) => {
                const pageNum = i + Math.max(1, page - 2);
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-1 rounded ${
                      pageNum === page ? "bg-green-600 text-white" : "border"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="p-2 border rounded"
            title="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* toasts */}
      <div className="fixed right-6 bottom-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-2 rounded shadow-md text-white ${
              t.type === "error"
                ? "bg-red-500"
                : t.type === "success"
                ? "bg-green-600"
                : "bg-gray-700"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
