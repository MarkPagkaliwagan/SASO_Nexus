import React, { useState, useRef } from "react";
import axios from "axios";
import { FileText, Upload, X, Check } from "react-feather";

// Modern, centered, accessible ReportForm
// - Keeps original submission logic intact (axios POST + staffToken)
// - UX improvements: centered card, nicer controls, drag-and-drop file area,
//   image preview, message char count, clearer loading / success / error states

export default function ReportForm() {
  const [department, setDepartment] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success'|'error', text }
  const [touched, setTouched] = useState({ department: false });

  const dropRef = useRef(null);

  const departments = [
    "Guidance Office",
    "Student Formation and Development Unit SFDU",
    "School Clinic",
    "Campus Ministry",
    "Sports Development Unit",
  ];

  const MAX_MESSAGE = 800;
  const MAX_FILE_MB = 8;

  function resetForm() {
    setDepartment("");
    setMessage("");
    setFile(null);
    setTouched({ department: false });
  }

  const handleDrop = (ev) => {
    ev.preventDefault();
    const dropped = ev.dataTransfer?.files?.[0];
    if (dropped) handleFile(dropped);
    if (dropRef.current) dropRef.current.classList.remove("ring-2", "ring-yellow-400");
  };

  const handleDragOver = (ev) => {
    ev.preventDefault();
    if (dropRef.current) dropRef.current.classList.add("ring-2", "ring-yellow-400");
  };

  const handleDragLeave = () => {
    if (dropRef.current) dropRef.current.classList.remove("ring-2", "ring-yellow-400");
  };

  const handleFile = (f) => {
    if (!f) return;
    const sizeMb = f.size / 1024 / 1024;
    if (sizeMb > MAX_FILE_MB) {
      setStatus({ type: "error", text: `File too large — limit is ${MAX_FILE_MB} MB.` });
      return;
    }
    setFile(f);
    setStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched((s) => ({ ...s, department: true }));
    if (!department) {
      setStatus({ type: "error", text: "Please select a department." });
      return;
    }

    setLoading(true);
    setStatus(null);

    let formData = new FormData();
    formData.append("department", department);
    formData.append("message", message);
    if (file) formData.append("file", file);

    try {
      await axios.post("http://localhost:8000/api/reports", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("staffToken")}`,
        },
      });

      setStatus({ type: "success", text: "Report submitted successfully!" });
      resetForm();
    } catch (err) {
      console.error("Axios error:", err);
      // Attempt to show a helpful error message
      if (err?.response?.status === 401) {
        setStatus({ type: "error", text: "Unauthorized — please sign in again." });
      } else if (err?.response?.data?.message) {
        setStatus({ type: "error", text: err.response.data.message });
      } else {
        setStatus({ type: "error", text: "Error submitting report. Try again later." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full text-black bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden">
        <div className="p-6 md:p-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-tr from-yellow-100 to-yellow-50">
              <FileText size={22} className="text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">Submit a Report</h2>
              <p className="text-sm text-gray-500 mt-1">Select department, attach a file (optional), and send your message.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-4">
            {/* department */}
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Department <span aria-hidden className="text-red-500">*</span></span>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                onBlur={() => setTouched((s) => ({ ...s, department: true }))}
                required
                aria-required
                className={`mt-2 block w-full rounded-lg border p-3 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition disabled:opacity-50 ${
                  touched.department && !department ? "border-red-300" : "border-gray-200"
                }`}
              >
                <option value="">-- Select Department --</option>
                {departments.map((dep, idx) => (
                  <option key={idx} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>
              {touched.department && !department && (
                <p className="mt-1 text-xs text-red-600">Department is required.</p>
              )}
            </label>

            {/* message */}
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Message <span className="text-sm text-gray-400">(optional)</span></span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter additional details..."
                maxLength={MAX_MESSAGE}
                rows={5}
                className="mt-2 block w-full rounded-lg border-gray-200 p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
              <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
                <span>{message.length} / {MAX_MESSAGE} chars</span>
                <span>Optional</span>
              </div>
            </label>

            {/* file upload */}
            <div>
              <span className="text-sm font-medium text-gray-700">Attachment <span className="text-sm text-gray-400">(optional)</span></span>

              <div
                ref={dropRef}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className="mt-2 flex items-center justify-between gap-4 rounded-lg border border-dashed border-gray-200 p-4 cursor-pointer hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <Upload size={18} className="text-yellow-600" />
                  <div className="text-sm text-gray-700">
                    {file ? (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {file.type?.startsWith("image/") && (
                            <img
                              src={URL.createObjectURL(file)}
                              alt="preview"
                              className="w-12 h-12 rounded-md object-cover border"
                            />
                          )}
                          <div>
                            <div className="font-medium">{file.name}</div>
                            <div className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">Drag & drop a file here, or click to browse (max {MAX_FILE_MB} MB)</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {file && (
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      aria-label="Remove file"
                      className="inline-flex items-center gap-2 rounded-md border px-3 py-1 text-xs shadow-sm hover:bg-gray-100"
                    >
                      <X size={14} /> Remove
                    </button>
                  )}

                  <label className="inline-block">
                    <input
                      type="file"
                      onChange={(e) => handleFile(e.target.files[0])}
                      className="sr-only"
                    />
                    <div className="inline-flex items-center gap-2 rounded-md bg-yellow-600 text-white px-3 py-2 text-sm font-medium shadow-sm hover:bg-yellow-700 transition">
                      <Upload size={14} /> Browse
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* status */}
            {status && (
              <div
                role="status"
                className={`mt-2 flex items-center gap-3 rounded-md px-4 py-2 text-sm ${
                  status.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                }`}
              >
                {status.type === "success" ? <Check size={16} /> : <X size={16} />}
                <div>{status.text}</div>
              </div>
            )}

            <div className="mt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-yellow-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-yellow-700 transition disabled:opacity-60"
              >
                {loading ? (
                  <svg
                    className="h-5 w-5 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                ) : (
                  <FileText size={16} />
                )}
                <span>{loading ? "Submitting..." : "Submit Report"}</span>
              </button>
            </div>

            <div className="text-xs text-gray-400 text-center">By submitting you agree that your report will be processed by the appropriate office.</div>
          </form>
        </div>
      </div>
    </div>
  );
}
