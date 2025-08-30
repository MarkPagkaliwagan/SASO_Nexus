// ViewForm.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
} from "react-icons/fi";
import SPCLogo from "../images/SPC.png";

/**
 * ViewForm.jsx
 * - Read-only grouped view for application
 * - Flat color palette, lively borders for cards + inputs, subtle animations
 * - Keep all fields intact
 *
 * Palette decisions (Tailwind classes):
 * - Primary accent: teal (teal-500 / teal-700) for input borders & positive badges
 * - Header accent: indigo-600 for section headings (serif font recommended)
 * - Muted negative: gray-400/500 for negative states
 *
 * Make sure tailwind is configured. For nicer headings add Playfair Display in index.html:
 * <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
 */

export default function ViewForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);

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
    return `http://127.0.0.1:8000/storage/${path}`;
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
      <div className="p-8 text-center text-red-600">
        Applicant not found or could not load details.
      </div>
    );
  }

  // Derived booleans
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

  // framer variants for sections
  const sectionVariants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0 },
  };

  // small helper: animated hover style (box shadow) for motion components
  const hoverStyle = {
    boxShadow: "0 12px 30px rgba(16,24,40,0.08)",
    borderColor: "rgba(20,184,166,0.25)", // teal-400-ish
  };

  return (
    <div className="py-8 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.997 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.22 }}
        className="max-w-6xl mx-auto bg-white rounded-2xl shadow-md"
      >
        <div className="p-6 md:p-8">
          {/* Header */}
          <header className="flex flex-col md:flex-row items-center md:items-end gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 flex items-center justify-center rounded-md bg-teal-50 border border-teal-100">
                <img src={SPCLogo} alt="SPC Logo" className="w-12 h-12 object-contain" />
              </div>

              <div>
                <h1
                  className="text-2xl md:text-3xl font-serif font-semibold text-indigo-700"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  San Pablo Colleges
                </h1>
                <p className="text-sm text-slate-600">Application For Admission</p>
                <p className="text-xs text-slate-500 mt-1">
                  Hermanos Belen St. San Pablo City • Tel. No. (049) 562-4688
                </p>
              </div>
            </div>

            <div className="ml-auto text-right">
              <div className="text-sm text-slate-500">Application ID</div>
              <div className="text-lg font-semibold text-slate-800">{formatValue(applicant.id)}</div>
            </div>
          </header>

          {/* 📝 APPLICATION INFORMATION */}
          <motion.section
            initial="hidden"
            animate="show"
            variants={sectionVariants}
            transition={{ duration: 0.28 }}
            whileHover={{ ...hoverStyle }}
            className="mb-6 rounded-lg border border-teal-100 bg-teal-50/60 p-4"
            style={{ borderStyle: "solid" }}
          >
            <SectionHeader icon={<FiFileText />} title="📝 APPLICATION INFORMATION" subtitle="Read-only" accent="indigo-700" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
              <InputRO label="id" value={formatValue(applicant.id)} />
              <InputRO label="applicationType" value={formatValue(applicant.applicationType)} />
              <InputRO label="academicYear" value={formatValue(applicant.academicYear)} />
              <InputRO label="semester" value={formatValue(applicant.semester)} />
              <InputRO label="firstChoice" value={formatValue(applicant.firstChoice)} />
              <InputRO label="secondChoice" value={formatValue(applicant.secondChoice)} />
              <InputRO label="schedule_id" value={formatValue(applicant.schedule_id)} />

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
          </motion.section>

          {/* 👤 PERSONAL INFORMATION */}
          <motion.section
            initial="hidden"
            animate="show"
            variants={sectionVariants}
            transition={{ duration: 0.28, delay: 0.04 }}
            whileHover={{ ...hoverStyle }}
            className="mb-6 rounded-lg border border-slate-100 bg-white p-4"
            style={{ borderStyle: "solid" }}
          >
            <SectionHeader icon={<FiUser />} title="👤 PERSONAL INFORMATION" subtitle="Includes contact & photo" accent="indigo-700" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start mt-3">
              {/* Photo */}
              <div className="col-span-1">
                <div className="w-44 h-56 border rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center border-teal-100">
                  {photoUrl(applicant.photo_path) ? (
                    <img src={photoUrl(applicant.photo_path)} alt="Applicant" className="object-cover w-full h-full" />
                  ) : (
                    <div className="text-slate-400 text-sm flex flex-col items-center gap-2">
                      <FiCamera size={20} />
                      <span>No Photo</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 text-xs text-slate-500">
                  Uploaded: {formatValue(applicant.photo_path) === "N/A" ? "—" : "Yes"}
                </div>
              </div>

              <div className="col-span-3 grid grid-cols-1 md:grid-cols-3 gap-3">
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
            className="mb-6 rounded-lg border border-teal-50 bg-teal-50/20 p-4"
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
            className="mb-6 rounded-lg border border-slate-100 bg-white p-4"
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

          {/* Footer */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-slate-500">SASO NEXUS</div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-md shadow-sm"
            >
              <FiChevronLeft /> Back
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ---------- Helper components ---------- */

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
      className={`inline-flex items-center text-sm font-medium px-3 py-1 rounded-full gap-2 ${
        present ? "bg-teal-50 text-teal-700" : "bg-gray-100 text-slate-600"
      }`}
    >
      {present ? <FiCheckCircle /> : <FiXCircle />}
      <span className="text-xs">{present ? textPresent : textAbsent}</span>
    </div>
  );
}

/* read-only input with lively flat-colored border + hover/focus */
function InputRO({ label, value, icon = null }) {
  return (
    <div className="group">
      <label className="text-xs text-slate-600 flex items-center gap-2">
        {icon && <span className="text-teal-500">{icon}</span>}
        <span className="capitalize">{label}</span>
      </label>

      <input
        readOnly
        value={value ?? ""}
        className="w-full mt-1 p-2 border rounded-md bg-white border-teal-200 hover:border-teal-300 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition"
      />
    </div>
  );
}
