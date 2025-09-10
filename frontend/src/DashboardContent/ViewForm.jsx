import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  FiFileText,
  FiUser,
  FiUsers,
  FiBook,
  FiCamera,
  FiChevronLeft,
  FiCheckCircle,
  FiXCircle,
  FiMail,
  FiPhone,
  FiCalendar,
  FiPrinter,
  FiClipboard,
  FiAward
} from "react-icons/fi";

import SPCLogo from "../images/SPC.png";

export default function ViewForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [printMode, setPrintMode] = useState(false);
  const [exporting, setExporting] = useState(false);
  const printRef = useRef(null);

const [results, setResults] = useState({
  // College (MAT, APT, GWA)
  mat_rs: "",
  mat_iq: "",
  mat_percentile: "",
  mat_classification: "",
  apt_verbal_rs: "",
  apt_verbal_percentile: "",
  apt_verbal_classification: "",
  apt_num_rs: "",
  apt_num_percentile: "",
  apt_num_classification: "",
  apt_total_rs: "",
  apt_total_percentile: "",
  apt_total_classification: "",
  gwa_percentile: "",
  gwa_classification: "",

  // SHS (CFIT & OLSAT)
  cfit_rs: "",
  cfit_iq: "",
  cfit_pc: "",
  cfit_classification: "",
  olsat_verbal_rs: "",
  olsat_verbal_ss: "",
  olsat_verbal_percentile: "",
  olsat_verbal_stanine: "",
  olsat_verbal_classification: "",
  olsat_nonverbal_rs: "",
  olsat_nonverbal_ss: "",
  olsat_nonverbal_pc: "",
  olsat_nonverbal_stanine: "",
  olsat_nonverbal_classification: "",
  olsat_total_rs: "",
  olsat_total_ss: "",
  olsat_total_pc: "",
  olsat_total_stanine: "",
  olsat_total_classification: "",

  // JHS (VCAT)
  vc_rs: "",
  vc_pc: "",
  vr_rs: "",
  vr_pc: "",
  fr_rs: "",
  fr_pc: "",
  qr_rs: "",
  qr_pc: "",
  verbal_rs: "",
  verbal_pc: "",
  nonverbal_rs: "",
  nonverbal_pc: "",
  overall_rs: "",
  overall_pc: "",

  // Common
  remarks: "",
});


  const handleChange = (e) => {
    const { name, value } = e.target;
    setResults((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitResults = async () => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/applications/${id}/results`, // use id
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(results),
        }
      );

      if (!res.ok) throw new Error("Failed to submit results");

      alert("Results submitted successfully!");
    } catch (err) {
      console.error("Error submitting results:", err);
      alert("Failed to submit results.");
    }
  };


  const formatValue = (v) => {
    if (v === null || v === undefined) return "N/A";
    if (typeof v === "string" && v.trim() === "") return "N/A";
    return String(v);
  };

  const hasValue = (v) => {
    if (v === null || v === undefined) return false;
    if (typeof v === "string" && v.trim() === "") return false;
    return true;
  };

  const photoUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return `/storage/${path}`;
  };

  useEffect(() => {
    setLoading(true);
    fetch(`http://127.0.0.1:8000/api/applications/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch applicant");
        return res.json();
      })
      .then((data) => setApplicant(data))
      .catch((err) => {
        console.error("Fetch applicant error:", err);
        setApplicant(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="text-lg font-medium">Loading applicant details…</div>
      </div>
    );
  }

  if (!applicant) {
    return (
      <div className="p-8 text-center text-red-600">Applicant not found or could not load details.</div>
    );
  }

  const declarationExists = hasValue(applicant.declaration);

  const alumnusRaw = applicant.is_parent_alumnus;
  const isParentAlumnus =
    alumnusRaw === true ||
    alumnusRaw === 1 ||
    (typeof alumnusRaw === "string" && ["1", "true", "yes", "y"].includes(alumnusRaw.trim().toLowerCase()));

  const transfereeFields = [
    applicant.transferee_school_name,
    applicant.transferee_course,
    applicant.transferee_major,
    applicant.transferee_school_address,
    applicant.transferee_school_year_attended,
  ];
  const hasTransferee = transfereeFields.some(hasValue);

  const sectionVariants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0 },
  };

  const hoverStyle = {
    boxShadow: "0 12px 30px rgba(16,24,40,0.08)",
    borderColor: "rgba(20,184,166,0.25)",
  };

  const handlePrint = async () => {
    setPrintMode(true);
    requestAnimationFrame(() => {
      window.print();
      setTimeout(() => setPrintMode(false), 600);
    });
  };

  // --- Download PDF as screenshot (folio 8.5in x 13in) ---
  const downloadPdf = async () => {
    try {
      setExporting(true);
      const element = printRef.current;
      if (!element) throw new Error("Printable element not found");

      element.classList.add("exporting");
      await new Promise((r) => setTimeout(r, 80));

      const widthMm = 8.5 * 25.4;
      const heightMm = 13 * 25.4;

      const canvas = await html2canvas(element, {
        scale: Math.min(2, window.devicePixelRatio || 1),
        useCORS: true,
        allowTaint: false,
        backgroundColor: window.getComputedStyle(element).backgroundColor || null,
        ignoreElements: (el) => el.classList && el.classList.contains("no-export"),
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const imgProps = { width: canvas.width, height: canvas.height };

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [widthMm, heightMm],
      });

      // ✅ Fit to folio page (choose smaller ratio)
      const ratio = Math.min(widthMm / imgProps.width, heightMm / imgProps.height);
      const pdfWidth = imgProps.width * ratio;
      const pdfHeight = imgProps.height * ratio;

      const marginX = (widthMm - pdfWidth) / 2;
      const marginY = (heightMm - pdfHeight) / 2;

      pdf.addImage(imgData, "PNG", marginX, marginY, pdfWidth, pdfHeight);

      const fileName = `application-${applicant.id || "form"}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("Failed to generate PDF. See console for details.");
    } finally {
      const element = printRef.current;
      if (element) element.classList.remove("exporting");
      setExporting(false);
    }
  };

  // helper to render an InputRO for a given field key (keeps label same as key)
  const renderField = (key) => {
    return <InputRO key={key} label={key} value={formatValue(applicant?.[key])} />;
  };

  return (
    <div className="py-8 px-4 md:px-6 print:bg-white overflow-x-hidden" style={{ minHeight: "100vh" }}>
      {/* Inline styles for fonts + print rules — paste fonts into public/index.html for best result */}
      <style>{`
        /* Suggested fonts in public/index.html:
           <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
        */

        :root{--accent:#0d9488;--muted:#64748b;--heading:#3730a3}

        /* Print page settings: folio portrait roughly 8.5in x 13in */
        @page { size: 8.5in 13in; margin: 0mm; }

        @media print {
          /* hide everything except the print container to ensure single-page output */
          body * { visibility: hidden; }
          .print-container, .print-container * { visibility: visible; }
          .print-container { position: absolute; left: 0; top: 0; width: 100%; }

          /* ensure no extra page breaks inside sections */
          .no-break { page-break-inside: avoid; }

          /* make inputs non-interactive in print */
          input[readonly] { border: none; background: transparent; }
          .photo-box img { max-width: 3.3in; max-height: 4.5in; object-fit: cover; }

          /* hide UI controls when printing */
          .no-print { display: none !important; }
        }

        /* small accessibility improvements */
        .label-cap { text-transform: capitalize; }

        /* hide elements with .no-export during html2canvas capturing as well */
        .exporting .no-export { display: none !important; }

        /* Ensure the exported image doesn't have extra whitespace */
        .print-container { background: white; }

      `}</style>

      {/* Exporting overlay (generating PDF) */}
      {exporting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg p-6 shadow-lg flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" />
            <div className="text-sm font-medium">Preparing PDF… Please wait</div>
          </div>
        </div>
      )}

      <motion.div
        ref={printRef}
        initial={{ opacity: 0, scale: 0.997 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.22 }}
        className={`w-full mx-auto bg-gray-50 rounded-2xl shadow-md text-black mt-[64px] print-container ${printMode ? "printing" : ""}`}
      >
        <div className="p-6 md:p-8">
          {/* Header */}
          <header className="flex flex-col md:flex-row items-center md:items-end gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 flex items-center justify-center rounded-md bg-gradient-to-br from-teal-50 to-white border border-teal-100">
                <img src={SPCLogo} alt="SPC Logo" className="w-12 h-12 object-contain" />
              </div>

              <div>
                <h1
                  className="text-2xl md:text-3xl font-serif font-semibold"
                  style={{ color: 'var(--heading)', fontFamily: "'Playfair Display', serif" }}
                >
                  San Pablo Colleges
                </h1>
                <p className="text-sm text-slate-600">Application For Admission</p>
                <p className="text-xs text-slate-500 mt-1">Hermanos Belen St. San Pablo City • Tel. No. (049) 562-4688</p>
              </div>
            </div>

            <div className="ml-auto text-right flex items-center gap-3 no-export">
              <div className="text-sm text-slate-500 mr-3 text-right">
                <div>Application ID</div>
                <div className="text-lg font-semibold text-slate-800">{formatValue(applicant.id)}</div>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md shadow-sm no-print"
                  aria-label="Print form"
                >
                  <FiPrinter /> Print (Folio)
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={downloadPdf}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-sm"
                  aria-label="Download PDF"
                >
                  {exporting ? (
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /></svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M8 9l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  )}

                  <span className="ml-1">Download PDF</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 rounded-md shadow-sm border"
                >
                  <FiChevronLeft /> Back
                </motion.button>
              </div>
            </div>
          </header>

          {/* 📝 APPLICATION INFORMATION */}
          <motion.section
            initial="hidden"
            animate="show"
            variants={sectionVariants}
            transition={{ duration: 0.28 }}
            whileHover={{ ...hoverStyle }}
            className="mb-6 rounded-lg border border-teal-100 bg-teal-50/60 p-4 no-break"
            style={{ borderStyle: "solid" }}
          >
            <SectionHeader icon={<FiFileText />} title="📝 APPLICATION INFORMATION" subtitle="Read-only (visual arrangement only — no fields removed)" accent="indigo-700" />

            {/* build ordered fields array depending on applicationType (keeps all fields present) */}
            {(() => {
              const t = String(applicant.applicationType ?? "").toLowerCase();

              // master set of fields that originally appeared in this section
              const allFields = [
                "id", "applicationType", "academicYear", "semester",
                "firstChoice", "secondChoice", "schedule_id",
                "lrn", "gradeLevel", "shsGradeLevel", "shsStrand", "track", "strand",
                "last_school_name", "last_school_address", "school_year_attended",
                "date_of_graduation", "honors", "memberships"
              ];

              // default order (logical grouping)
              let ordered = [
                "id", "applicationType", "academicYear", "semester",
                "firstChoice", "secondChoice", "schedule_id",
                "lrn", "gradeLevel", "shsGradeLevel", "shsStrand", "track", "strand",
                "last_school_name", "last_school_address", "school_year_attended",
                "date_of_graduation", "honors", "memberships"
              ];

              // college: prioritize choices & schedule and then transferee/college-specific later (we keep all fields)
              if (t.includes("college")) {
                ordered = [
                  "firstChoice", "secondChoice", "schedule_id",
                  "id", "applicationType", "academicYear", "semester",
                  "last_school_name", "last_school_address", "school_year_attended",
                  "lrn", "gradeLevel", "honors", "memberships",
                  "shsGradeLevel", "shsStrand", "track", "strand",
                  "date_of_graduation"
                ];
              }

              // SHS: prioritize shs fields
              else if (t.includes("shs") || t.includes("senior") || t.includes("grade 11") || t.includes("grade 12") || t.includes("senior high")) {
                ordered = [
                  "shsGradeLevel", "shsStrand", "track", "strand",
                  "id", "applicationType", "academicYear", "semester",
                  "last_school_name", "last_school_address", "school_year_attended",
                  "lrn", "gradeLevel", "honors", "memberships",
                  "firstChoice", "secondChoice", "schedule_id", "date_of_graduation"
                ];
              }

              // Grade School / JHS: prioritize LRN and gradeLevel
              else if (t.includes("grade school") || t.includes("elementary") || t.includes("jhs") || t.includes("junior") || t.includes("grade ")) {
                ordered = [
                  "lrn", "gradeLevel", "last_school_name", "last_school_address",
                  "id", "applicationType", "academicYear", "semester",
                  "school_year_attended", "date_of_graduation", "honors", "memberships",
                  "firstChoice", "secondChoice", "schedule_id", "shsGradeLevel", "shsStrand", "track", "strand"
                ];
              }

              // ensure we include any missing fields from allFields (no removals)
              const finalOrdered = [
                ...ordered,
                ...allFields.filter((f) => !ordered.includes(f))
              ];

              return (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
                  {finalOrdered.map((key) => renderField(key))}
                  {/* declaration kept as separate input + badge (same as before) */}
                  <div className="md:col-span-1">
                    <label className="text-xs text-slate-600 block">declaration</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        readOnly
                        value={formatValue(applicant.declaration)}
                        className="flex-1 p-2 border rounded-md bg-white border-teal-200 hover:border-teal-300 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition"
                      />
                      <Badge present={declarationExists} textPresent="Yes" textAbsent="No" />
                    </div>
                  </div>
                </div>
              );
            })()}
          </motion.section>

          {/* 👤 PERSONAL INFORMATION */}
          <motion.section
            initial="hidden"
            animate="show"
            variants={sectionVariants}
            transition={{ duration: 0.28, delay: 0.04 }}
            whileHover={{ ...hoverStyle }}
            className="mb-6 rounded-lg border border-slate-100 bg-white p-4 no-break"
            style={{ borderStyle: "solid" }}
          >
            <SectionHeader icon={<FiUser />} title="👤 PERSONAL INFORMATION" subtitle="Includes contact & photo" accent="indigo-700" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start mt-3">
              {/* Photo */}
              <div className="col-span-1">
                <div className="w-44 h-56 border rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center border-teal-100 photo-box">
                  {photoUrl(applicant.photo_path) ? (
                    // crossOrigin allows html2canvas to use the image if backend provides CORS header
                    <img
                      src={photoUrl(applicant.photo_path)}
                      alt="Applicant"
                      className="object-cover w-full h-full"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="text-slate-400 text-sm flex flex-col items-center gap-2">
                      <FiCamera size={20} />
                      <span>No Photo</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 text-xs text-slate-500">Uploaded: {formatValue(applicant.photo_path) === "N/A" ? "—" : "Yes"}</div>
              </div>

              <div className="col-span-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* keep every field intact */}
                <InputRO label="nameFamily" value={formatValue(applicant.nameFamily)} icon={<FiUser />} />
                <InputRO label="nameGiven" value={formatValue(applicant.nameGiven)} icon={<FiUser />} />
                <InputRO label="nameMiddle" value={formatValue(applicant.nameMiddle)} icon={<FiUser />} />

                <InputRO label="gender" value={formatValue(applicant.gender)} />
                <InputRO label="dob" value={formatValue(applicant.dob)} icon={<FiCalendar />} />
                <InputRO label="age" value={formatValue(applicant.age)} />

                <InputRO label="placeOfBirth" value={formatValue(applicant.placeOfBirth)} />
                <InputRO label="civilStatus" value={formatValue(applicant.civilStatus)} />
                <InputRO label="religion" value={formatValue(applicant.religion)} />

                <InputRO label="citizenship" value={formatValue(applicant.citizenship)} />
                <InputRO label="address" value={formatValue(applicant.address)} />
                <InputRO label="street" value={formatValue(applicant.street)} />

                <InputRO label="barangay" value={formatValue(applicant.barangay)} />
                <InputRO label="city" value={formatValue(applicant.city)} />
                <InputRO label="zip" value={formatValue(applicant.zip)} />

                <InputRO label="residence" value={formatValue(applicant.residence)} />
                <InputRO label="email" value={formatValue(applicant.email)} icon={<FiMail />} />
                <InputRO label="mobile" value={formatValue(applicant.mobile)} icon={<FiPhone />} />

                <InputRO label="tel" value={formatValue(applicant.tel)} />
                <InputRO label="photo_path" value={formatValue(applicant.photo_path)} />
                <div />
              </div>
            </div>
          </motion.section>

          {/* 👨‍👩‍👧 FAMILY BACKGROUND */}
          <motion.section
            initial="hidden"
            animate="show"
            variants={sectionVariants}
            transition={{ duration: 0.28, delay: 0.08 }}
            whileHover={{ ...hoverStyle }}
            className="mb-6 rounded-lg border border-teal-50 bg-teal-50/20 p-4 no-break"
            style={{ borderStyle: "solid" }}
          >
            <SectionHeader icon={<FiUsers />} title="👨‍👩‍👧 FAMILY BACKGROUND" subtitle="Father / Mother / Parent Alumni" accent="indigo-700" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
              <div>
                <h4 className="font-medium mb-2 font-serif text-indigo-700" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Father’s Information
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  <InputRO label="father_name" value={formatValue(applicant.father_name)} />
                  <InputRO label="father_address" value={formatValue(applicant.father_address)} />
                  <InputRO label="father_tel" value={formatValue(applicant.father_tel)} />
                  <InputRO label="father_citizenship" value={formatValue(applicant.father_citizenship)} />
                  <InputRO label="father_occupation" value={formatValue(applicant.father_occupation)} />
                  <InputRO label="father_office_address" value={formatValue(applicant.father_office_address)} />
                  <InputRO label="father_office_tel" value={formatValue(applicant.father_office_tel)} />
                  <InputRO label="father_education" value={formatValue(applicant.father_education)} />
                  <InputRO label="father_last_school" value={formatValue(applicant.father_last_school)} />
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2 font-serif text-indigo-700" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Mother’s Information
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  <InputRO label="mother_name" value={formatValue(applicant.mother_name)} />
                  <InputRO label="mother_address" value={formatValue(applicant.mother_address)} />
                  <InputRO label="mother_tel" value={formatValue(applicant.mother_tel)} />
                  <InputRO label="mother_citizenship" value={formatValue(applicant.mother_citizenship)} />
                  <InputRO label="mother_occupation" value={formatValue(applicant.mother_occupation)} />
                  <InputRO label="mother_office_address" value={formatValue(applicant.mother_office_address)} />
                  <InputRO label="mother_office_tel" value={formatValue(applicant.mother_office_tel)} />
                  <InputRO label="mother_education" value={formatValue(applicant.mother_education)} />
                  <InputRO label="mother_last_school" value={formatValue(applicant.mother_last_school)} />
                </div>
              </div>
            </div>

            <div className="mt-6 border-t pt-4">
              <h4 className="font-medium mb-2">Parent Alumni Info</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                <InputRO label="is_parent_alumnus" value={formatValue(applicant.is_parent_alumnus)} />
                <InputRO label="parent_alumni_year" value={formatValue(applicant.parent_alumni_year)} />
                <InputRO label="parent_alumni_level_course" value={formatValue(applicant.parent_alumni_level_course)} />

                <div className="md:col-span-3 mt-2 flex items-center gap-3">
                  <Badge present={isParentAlumnus} textPresent="Parent is an alumnus" textAbsent="Not listed as alumnus" />
                  {!isParentAlumnus && <div className="text-xs text-slate-500 italic">Note: Parent is not listed as alumnus.</div>}
                </div>
              </div>
            </div>
          </motion.section>

          {/* 🎓 EDUCATIONAL BACKGROUND */}
          <motion.section
            initial="hidden"
            animate="show"
            variants={sectionVariants}
            transition={{ duration: 0.28, delay: 0.12 }}
            whileHover={{ ...hoverStyle }}
            className="mb-6 rounded-lg border border-slate-100 bg-white p-4 no-break"
            style={{ borderStyle: "solid" }}
          >
            <SectionHeader icon={<FiBook />} title="🎓 EDUCATIONAL BACKGROUND" subtitle="Basic Education & Transferee" accent="indigo-700" />

            <div className="mb-4 mt-3">
              <h4 className="font-medium mb-2">Basic Education (GS/JHS/SHS)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <InputRO label="lrn" value={formatValue(applicant.lrn)} />
                <InputRO label="gradeLevel" value={formatValue(applicant.gradeLevel)} />
                <InputRO label="shsGradeLevel" value={formatValue(applicant.shsGradeLevel)} />
                <InputRO label="shsStrand" value={formatValue(applicant.shsStrand)} />
                <InputRO label="track" value={formatValue(applicant.track)} />
                <InputRO label="strand" value={formatValue(applicant.strand)} />
                <InputRO label="last_school_name" value={formatValue(applicant.last_school_name)} />
                <InputRO label="last_school_address" value={formatValue(applicant.last_school_address)} />
                <InputRO label="school_year_attended" value={formatValue(applicant.school_year_attended)} />
                <InputRO label="date_of_graduation" value={formatValue(applicant.date_of_graduation)} />
                <InputRO label="honors" value={formatValue(applicant.honors)} />
                <InputRO label="memberships" value={formatValue(applicant.memberships)} />
              </div>
            </div>

            <div className="mt-4 border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">College / Transferee</h4>
                <Badge present={hasTransferee} textPresent="Transferee info present" textAbsent="No transferee info" />
              </div>

              {!hasTransferee && <div className="mb-3 text-xs italic text-slate-500">Note: Transferee information not provided.</div>}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <InputRO label="transferee_school_name" value={formatValue(applicant.transferee_school_name)} />
                <InputRO label="transferee_course" value={formatValue(applicant.transferee_course)} />
                <InputRO label="transferee_major" value={formatValue(applicant.transferee_major)} />
                <div className="md:col-span-3">
                  <InputRO label="transferee_school_address" value={formatValue(applicant.transferee_school_address)} />
                </div>
                <InputRO label="transferee_school_year_attended" value={formatValue(applicant.transferee_school_year_attended)} />
              </div>
            </div>
          </motion.section>

          {applicant.applicationType === "College" ? (
            // ✅ Kapag COLLEGE → ipakita yung table
            <motion.section
              initial="hidden"
              animate="show"
              transition={{ duration: 0.3, delay: 0.15 }}
              whileHover={{ scale: 1.01 }}
              className="mb-6 rounded-2xl border border-green-200 bg-white p-6 shadow-md"
            >
              <h2 className="text-lg font-bold text-green-700 text-center mb-2">
                APPLICATION STATUS (DO NOT FILL THIS AREA)
              </h2>

              <div className="overflow-x-auto mt-4">
                <table className="w-full border border-green-300 text-sm text-gray-700">
                  <thead className="bg-green-50 text-green-800 text-center">
                    <tr>
                      <th colSpan="4" className="border border-green-300 px-3 py-2 font-semibold">CFIT</th>
                      <th colSpan="9" className="border border-green-300 px-3 py-2 font-semibold">CQT</th>
                      <th colSpan="2" className="border border-green-300 px-3 py-2 font-semibold">GWA</th>
                      <th rowSpan="2" className="border border-green-300 px-3 py-2 font-semibold">REMARKS</th>
                    </tr>
                    <tr>
                      <th className="border border-green-300 px-3 py-2">RS</th>
                      <th className="border border-green-300 px-3 py-2">IQ</th>
                      <th className="border border-green-300 px-3 py-2">%ile</th>
                      <th className="border border-green-300 px-3 py-2">Classification</th>
                      <th colSpan="3" className="border border-green-300 px-3 py-2 font-semibold">Verbal</th>
                      <th colSpan="3" className="border border-green-300 px-3 py-2 font-semibold">Numerical</th>
                      <th colSpan="3" className="border border-green-300 px-3 py-2 font-semibold">Total</th>
                      <th className="border border-green-300 px-3 py-2">%ile</th>
                      <th className="border border-green-300 px-3 py-2">Classification</th>
                    </tr>
                    <tr>
                      <th colSpan="2"></th><th></th><th></th>
                      <th className="border border-green-300 px-3 py-2">RS</th>
                      <th className="border border-green-300 px-3 py-2">%ile</th>
                      <th className="border border-green-300 px-3 py-2">Classification</th>
                      <th className="border border-green-300 px-3 py-2">RS</th>
                      <th className="border border-green-300 px-3 py-2">%ile</th>
                      <th className="border border-green-300 px-3 py-2">Classification</th>
                      <th className="border border-green-300 px-3 py-2">RS</th>
                      <th className="border border-green-300 px-3 py-2">%ile</th>
                      <th className="border border-green-300 px-3 py-2">Classification</th>
                      <th colSpan="2"></th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-green-50 transition text-center">
                      {/* MAT */}
                      <td><input name="mat_rs" value={results.mat_rs} onChange={handleChange} className="w-full p-2 border border-green-300 rounded-md" /></td>
                      <td><input name="mat_iq" value={results.mat_iq} onChange={handleChange} className="w-full p-2 border border-green-300 rounded-md" /></td>
                      <td><input name="mat_percentile" value={results.mat_percentile} onChange={handleChange} className="w-full p-2 border border-green-300 rounded-md" /></td>
                      <td><input name="mat_classification" value={results.mat_classification} onChange={handleChange} className="w-full p-2 border border-green-300 rounded-md" /></td>

                      {/* APT Verbal */}
                      <td><input name="apt_verbal_rs" value={results.apt_verbal_rs} onChange={handleChange} className="w-full p-2 border border-green-300 rounded-md" /></td>
                      <td><input name="apt_verbal_percentile" value={results.apt_verbal_percentile} onChange={handleChange} className="w-full p-2 border border-green-300 rounded-md" /></td>
                      <td><input name="apt_verbal_classification" value={results.apt_verbal_classification} onChange={handleChange} className="w-full p-2 border border-green-300 rounded-md" /></td>

                      {/* APT Numerical */}
                      <td><input name="apt_num_rs" value={results.apt_num_rs} onChange={handleChange} className="w-full p-2 border border-green-300 rounded-md" /></td>
                      <td><input name="apt_num_percentile" value={results.apt_num_percentile} onChange={handleChange} className="w-full p-2 border border-green-300 rounded-md" /></td>
                      <td><input name="apt_num_classification" value={results.apt_num_classification} onChange={handleChange} className="w-full p-2 border border-green-300 rounded-md" /></td>

                      {/* APT Total */}
                      <td><input name="apt_total_rs" value={results.apt_total_rs} onChange={handleChange} className="w-full p-2 border border-green-300 rounded-md" /></td>
                      <td><input name="apt_total_percentile" value={results.apt_total_percentile} onChange={handleChange} className="w-full p-2 border border-green-300 rounded-md" /></td>
                      <td><input name="apt_total_classification" value={results.apt_total_classification} onChange={handleChange} className="w-full p-2 border border-green-300 rounded-md" /></td>

                      {/* GWA */}
                      <td><input name="gwa_percentile" value={results.gwa_percentile} onChange={handleChange} className="w-full p-2 border border-green-300 rounded-md" /></td>
                      <td><input name="gwa_classification" value={results.gwa_classification} onChange={handleChange} className="w-full p-2 border border-green-300 rounded-md" /></td>

                      {/* Remarks */}
                      <td>
                        <select name="remarks" value={results.remarks} onChange={handleChange} className="w-full p-2 border border-green-300 rounded-md bg-white">
                          <option value="">Select</option>
                          <option value="Waitlisted">Waitlisted</option>
                          <option value="Passed">Passed</option>
                        </select>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-slate-500">SASO NEXUS</div>
                <button
                  type="button"
                  onClick={handleSubmitResults}
                  className="px-10 py-2 bg-emerald-900 text-white font-semibold rounded-lg shadow hover:bg-yellow-400 transition"
                >
                  Submit
                </button>
              </div>
            </motion.section>

          ) : applicant.applicationType === "Senior High School" ? (
            <motion.section
              initial="hidden"
              animate="show"
              transition={{ duration: 0.3, delay: 0.15 }}
              whileHover={{ scale: 1.01 }}
              className="mb-6 rounded-2xl border border-green-200 bg-white p-6 shadow-md"
            >
              <h2 className="text-lg font-bold text-green-700 text-center mb-2">
                APPLICATION STATUS (DO NOT FILL THIS AREA)
              </h2>

              <div className="overflow-x-auto mt-4">
                <table className="w-full border border-green-300 text-sm text-gray-700">
                  <thead className="bg-green-50 text-green-800 text-center">
                    <tr>
                      <th colSpan="4" className="border border-blue-300 px-3 py-2 font-semibold">CFIT</th>
                      <th colSpan="15" className="border border-blue-300 px-3 py-2 font-semibold">OLSAT</th>
                      <th rowSpan="3" className="border border-blue-300 px-3 py-2 font-semibold">Remarks</th>
                    </tr>
                    <tr>
                      <th className="border border-blue-300 px-3 py-2">RS</th>
                      <th className="border border-blue-300 px-3 py-2">IQ</th>
                      <th className="border border-blue-300 px-3 py-2">PC</th>
                      <th className="border border-blue-300 px-3 py-2">Classification</th>

                      <th colSpan="5" className="border border-blue-300 px-3 py-2 font-semibold">Verbal</th>
                      <th colSpan="5" className="border border-blue-300 px-3 py-2 font-semibold">Non-Verbal</th>
                      <th colSpan="5" className="border border-blue-300 px-3 py-2 font-semibold">Total</th>
                    </tr>
                    <tr>
                      {/* OLSAT Verbal */}
                      <th colSpan="4"></th>
                      <th className="border border-blue-300 px-3 py-2">RS</th>
                      <th className="border border-blue-300 px-3 py-2">SS</th>
                      <th className="border border-blue-300 px-3 py-2">%ILE</th>
                      <th className="border border-blue-300 px-3 py-2">Stanine</th>
                      <th className="border border-blue-300 px-3 py-2">Classification</th>

                      {/* OLSAT Non-Verbal */}
                      <th className="border border-blue-300 px-3 py-2">RS</th>
                      <th className="border border-blue-300 px-3 py-2">SS</th>
                      <th className="border border-blue-300 px-3 py-2">PC</th>
                      <th className="border border-blue-300 px-3 py-2">Stanine</th>
                      <th className="border border-blue-300 px-3 py-2">Classification</th>

                      {/* OLSAT Total */}
                      <th className="border border-blue-300 px-3 py-2">RS</th>
                      <th className="border border-blue-300 px-3 py-2">SS</th>
                      <th className="border border-blue-300 px-3 py-2">PC</th>
                      <th className="border border-blue-300 px-3 py-2">Stanine</th>
                      <th className="border border-blue-300 px-3 py-2">Classification</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-blue-50 transition text-center">
                      {/* CFIT */}
                      <td><input name="cfit_rs" value={results.cfit_rs} onChange={handleChange} className="w-full p-2 border border-blue-300 rounded-md" /></td>
                      <td><input name="cfit_iq" value={results.cfit_iq} onChange={handleChange} className="w-full p-2 border border-blue-300 rounded-md" /></td>
                      <td><input name="cfit_pc" value={results.cfit_pc} onChange={handleChange} className="w-full p-2 border border-blue-300 rounded-md" /></td>
                      <td><input name="cfit_classification" value={results.cfit_classification} onChange={handleChange} className="w-full p-2 border border-blue-300 rounded-md" /></td>

                      {/* OLSAT Verbal */}
                      <td><input name="olsat_verbal_rs" value={results.olsat_verbal_rs} onChange={handleChange} className="w-full p-2 border border-blue-300 rounded-md" /></td>
                      <td><input name="olsat_verbal_ss" value={results.olsat_verbal_ss} onChange={handleChange} className="w-full p-2 border border-blue-300 rounded-md" /></td>
                      <td><input name="olsat_verbal_percentile" value={results.olsat_verbal_percentile} onChange={handleChange} className="w-full p-2 border border-blue-300 rounded-md" /></td>
                      <td><input name="olsat_verbal_stanine" value={results.olsat_verbal_stanine} onChange={handleChange} className="w-full p-2 border border-blue-300 rounded-md" /></td>
                      <td><input name="olsat_verbal_classification" value={results.olsat_verbal_classification} onChange={handleChange} className="w-full p-2 border border-blue-300 rounded-md" /></td>

                      {/* OLSAT Non-Verbal */}
                      <td><input name="olsat_nonverbal_rs" value={results.olsat_nonverbal_rs} onChange={handleChange} className="w-full p-2 border border-blue-300 rounded-md" /></td>
                      <td><input name="olsat_nonverbal_ss" value={results.olsat_nonverbal_ss} onChange={handleChange} className="w-full p-2 border border-blue-300 rounded-md" /></td>
                      <td><input name="olsat_nonverbal_pc" value={results.olsat_nonverbal_pc} onChange={handleChange} className="w-full p-2 border border-blue-300 rounded-md" /></td>
                      <td><input name="olsat_nonverbal_stanine" value={results.olsat_nonverbal_stanine} onChange={handleChange} className="w-full p-2 border border-blue-300 rounded-md" /></td>
                      <td><input name="olsat_nonverbal_classification" value={results.olsat_nonverbal_classification} onChange={handleChange} className="w-full p-2 border border-blue-300 rounded-md" /></td>

                      {/* OLSAT Total */}
                      <td><input name="olsat_total_rs" value={results.olsat_total_rs} onChange={handleChange} className="w-full p-2 border border-blue-300 rounded-md" /></td>
                      <td><input name="olsat_total_ss" value={results.olsat_total_ss} onChange={handleChange} className="w-full p-2 border border-blue-300 rounded-md" /></td>
                      <td><input name="olsat_total_pc" value={results.olsat_total_pc} onChange={handleChange} className="w-full p-2 border border-blue-300 rounded-md" /></td>
                      <td><input name="olsat_total_stanine" value={results.olsat_total_stanine} onChange={handleChange} className="w-full p-2 border border-blue-300 rounded-md" /></td>
                      <td><input name="olsat_total_classification" value={results.olsat_total_classification} onChange={handleChange} className="w-full p-2 border border-blue-300 rounded-md" /></td>

                      {/* Remarks */}
                      <td>
                        <select name="remarks" value={results.remarks} onChange={handleChange} className="w-full p-2 border border-blue-300 rounded-md bg-white">
                          <option value="">Select</option>
                          <option value="Waitlisted">Waitlisted</option>
                          <option value="Passed">Passed</option>
                        </select>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-slate-500">SASO NEXUS</div>
                <button
                  type="button"
                  onClick={handleSubmitResults}
                  className="px-10 py-2 bg-emerald-900 text-white font-semibold rounded-lg shadow hover:bg-yellow-400 transition"
                >
                  Submit
                </button>
              </div>
            </motion.section>
          ) : applicant.applicationType === "Junior High School" ? (
            <motion.section
              initial="hidden"
              animate="show"
              transition={{ duration: 0.3, delay: 0.15 }}
              whileHover={{ scale: 1.01 }}
              className="mb-6 rounded-2xl border border-green-200 bg-white p-6 shadow-md"
            >
              <h2 className="text-lg font-bold text-green-700 text-center mb-2">
                APPLICATION STATUS (DO NOT FILL THIS AREA)
              </h2>

              <div className="overflow-x-auto mt-4">
                <table className="w-full border border-green-300 text-sm text-gray-700">
                  <thead className="bg-green-50 text-green-800 text-center">
                    {/* Level 1 */}
                    <tr>
                      <th colSpan="4" className="border border-green-300 px-3 py-2">Verbal</th>
                      <th colSpan="4" className="border border-green-300 px-3 py-2">Non-Verbal</th>
                      <th colSpan="4" className="border border-green-300 px-3 py-2">Total</th>
                      <th colSpan="2" className="border border-green-300 px-3 py-2">Over-all Total</th>
                      <th rowSpan="3" className="border border-green-300 px-3 py-2">Remarks</th>
                    </tr>

                    {/* Level 2 */}
                    <tr>
                      <th colSpan="2" className="border border-green-300 px-3 py-2">VC</th>
                      <th colSpan="2" className="border border-green-300 px-3 py-2">VR</th>
                      <th colSpan="2" className="border border-green-300 px-3 py-2">FR</th>
                      <th colSpan="2" className="border border-green-300 px-3 py-2">QR</th>
                      <th colSpan="2" className="border border-green-300 px-3 py-2">VERBAL</th>
                      <th colSpan="2" className="border border-green-300 px-3 py-2">NON-VERBAL</th>
                      <th colSpan="2" className="border border-green-300 px-3 py-2">TOTAL</th>
                    </tr>

                    {/* Level 3 */}
                    <tr>
                      {Array(7).fill(0).map((_, i) => (
                        <React.Fragment key={i}>
                          <th className="border border-green-300 px-3 py-2">RS</th>
                          <th className="border border-green-300 px-3 py-2">PC</th>
                        </React.Fragment>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    <tr className="hover:bg-green-50 transition text-center">
                      {/* VC */}
                      <td><input name="vc_rs" value={results.vc_rs} onChange={handleChange} className="w-full p-2 border border-green-300 rounded-md" /></td>
                      <td><input name="vc_pc" value={results.vc_pc} onChange={handleChange} className="w-full p-2 border border-green-300 rounded-md" /></td>

                      {/* VR */}
                      <td><input name="vr_rs" value={results.vr_rs} onChange={handleChange} className="w-full p-2 border border-green-300 rounded-md" /></td>
                      <td><input name="vr_pc" value={results.vr_pc} onChange={handleChange} className="w-full p-2 border border-green-300 rounded-md" /></td>

                      {/* FR */}
                      <td><input name="fr_rs" value={results.fr_rs} onChange={handleChange} className="w-full p-2 border border-green-300 rounded-md" /></td>
                      <td><input name="fr_pc" value={results.fr_pc} onChange={handleChange} className="w-full p-2 border border-green-300 rounded-md" /></td>

                      {/* QR */}
                      <td><input name="qr_rs" value={results.qr_rs} onChange={handleChange} className="w-full p-2 border border-green-300 rounded-md" /></td>
                      <td><input name="qr_pc" value={results.qr_pc} onChange={handleChange} className="w-full p-2 border border-green-300 rounded-md" /></td>

                      {/* Verbal */}
                      <td><input name="verbal_rs" value={results.verbal_rs} onChange={handleChange} className="w-full p-2 border border-green-300 rounded-md" /></td>
                      <td><input name="verbal_pc" value={results.verbal_pc} onChange={handleChange} className="w-full p-2 border border-green-300 rounded-md" /></td>

                      {/* Non-Verbal */}
                      <td><input name="nonverbal_rs" value={results.nonverbal_rs} onChange={handleChange} className="w-full p-2 border border-green-300 rounded-md" /></td>
                      <td><input name="nonverbal_pc" value={results.nonverbal_pc} onChange={handleChange} className="w-full p-2 border border-green-300 rounded-md" /></td>

                      {/* Total */}
                      <td><input name="overall_rs" value={results.overall_rs} onChange={handleChange} className="w-full p-2 border border-green-300 rounded-md" /></td>
                      <td><input name="overall_pc" value={results.overall_pc} onChange={handleChange} className="w-full p-2 border border-green-300 rounded-md" /></td>

                      {/* Remarks */}
                      <td>
                        <select name="remarks" value={results.remarks} onChange={handleChange} className="w-full p-2 border border-green-300 rounded-md bg-white">
                          <option value="">Select</option>
                          <option value="Waitlisted">Waitlisted</option>
                          <option value="Passed">Passed</option>
                        </select>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-slate-500">SASO NEXUS</div>
                <button
                  type="button"
                  onClick={handleSubmitResults}
                  className="px-10 py-2 bg-emerald-900 text-white font-semibold rounded-lg shadow hover:bg-yellow-400 transition"
                >
                  Submit
                </button>
              </div>
            </motion.section>
          ) : (
            <div className="mb-6 rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center shadow-sm">
              <p className="text-sm text-gray-600">
                Application status not required for this level.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>

  );
}


function SectionHeader({ icon, title, subtitle, accent = "indigo-700" }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="text-teal-600">{icon}</div>
        <div>
          <div className={`text-sm font-serif font-semibold`} style={{ color: "#334155", fontFamily: "'Playfair Display', serif" }}>
            {title}
          </div>
          {subtitle && <div className="text-xs text-slate-500">{subtitle}</div>}
        </div>
      </div>
    </div>
  );
}

function Badge({ present, textPresent = "Yes", textAbsent = "No" }) {
  return (
    <div
      className={`inline-flex items-center text-sm font-medium px-3 py-1 rounded-full gap-2 ${present ? "bg-teal-50 text-teal-700" : "bg-gray-100 text-slate-600"
        }`}
    >
      {present ? <FiCheckCircle /> : <FiXCircle />}
      <span className="text-xs">{present ? textPresent : textAbsent}</span>
    </div>
  );
}

function InputRO({ label, value, icon = null }) {
  return (
    <div className="group">
      <label className="text-xs text-slate-600 flex items-center gap-2">
        {icon && <span className="text-teal-500">{icon}</span>}
        <span className="label-cap">{label}</span>
      </label>
      <input
        readOnly
        value={value ?? ""}
        className="w-full mt-1 p-2 border rounded-md bg-white border-teal-200 hover:border-teal-300 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition"
      />
    </div>
  );
}
