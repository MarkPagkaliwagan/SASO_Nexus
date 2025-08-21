import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

/**
 * AdmissionForm.jsx
 *
 * Beautiful, accessible multi-step Admission Form with conditional sections
 * for College / SHS / JHS / GS, transferee-only fields, 2x2 photo upload,
 * dynamic schedule dropdown (from Laravel API), and consent gating.
 *
 * UI: TailwindCSS (cards, grid, stepper, inputs), minimal dependencies.
 * API: expects
 *  - GET   /api/admission-schedules    -> [{ id, date_time, remaining }]
 *  - POST  /api/admissions             -> multipart/form-data
 */

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/", // e.g., http://localhost:8000
  headers: { "X-Requested-With": "XMLHttpRequest" },
  withCredentials: false,
});

const applicationTypes = [
  { key: "college", label: "College" },
  { key: "shs", label: "Senior High School" },
  { key: "jhs", label: "Junior High School" },
  { key: "gs", label: "Grade School" },
];

const acadYears = [
  "2025–2026",
  "2026–2027",
  "2027–2028",
];
const semesters = ["1st Semester", "2nd Semester", "Summer"];

const shsGradeLevels = ["Grade 11", "Grade 12"];
const jhsGradeLevels = ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"];
const gsGradeLevels = [
  "Nursery",
  "Kinder",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
];

// SHS tracks/strands
const SHS_OPTIONS = [
  {
    group: "GENERAL ACADEMIC TRACK",
    track: "GAS",
    strands: ["STEM", "HUMSS", "ABM", "GAS"],
  },
  {
    group: "TECHNICAL VOCATIONAL AND LIVELIHOOD TRACK (TVL)",
    track: "TVL",
    strands: ["Home Economics (Caregiving)", "Home Economics (Housekeeping)", "ICT"],
  },
  {
    group: "ARTS AND DESIGN TRACK",
    track: "Arts and Design",
    strands: ["Performing Arts", "Art Production"],
  },
  { group: "SPORTS TRACK", track: "Sports", strands: ["Sports"] },
];

const genders = ["Male", "Female", "Prefer not to say"];
const civilStatuses = ["Single", "Married", "Separated", "Widowed", "Other"];
const residences = ["With Parents", "With Relatives", "Boarding"];

const Stepper = ({ step, total }) => {
  const pct = Math.round(((step + 1) / total) * 100);
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium">Progress</p>
        <p className="text-sm font-semibold">{pct}%</p>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="h-2 bg-indigo-600 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 text-xs text-gray-500">Step {step + 1} of {total}</div>
    </div>
  );
};

export default function AdmissionForm() {
  const TOTAL_STEPS = 4; // 1: Application Type & Program; 2: Personal; 3: Family; 4: Education + Upload + Schedule + Consent
  const [step, setStep] = useState(0);

  // schedules from backend
  const [schedules, setSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [scheduleError, setScheduleError] = useState("");

  // photo preview
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverMessage, setServerMessage] = useState("");

  const [form, setForm] = useState({
    // Application Type
    application_type: "college",

    // College
    college_acad_year: acadYears[0],
    college_semester: semesters[0],
    college_transferee: "No",
    college_first_choice: "",
    college_second_choice: "",

    // SHS
    shs_grade_level: shsGradeLevels[0],
    shs_transferee: "No",
    shs_track: SHS_OPTIONS[0].track,
    shs_strand: SHS_OPTIONS[0].strands[0],

    // JHS
    jhs_grade_level: jhsGradeLevels[0],
    jhs_transferee: "No",

    // GS
    gs_grade_level: gsGradeLevels[0],
    gs_transferee: "No",

    // Personal Data
    last_name: "",
    first_name: "",
    middle_name: "",
    gender: genders[0],
    address_no: "",
    address_street: "",
    address_barangay: "",
    address_city_province: "",
    address_zip: "",
    tel_no: "",
    mobile_no: "",
    email: "",
    birth_date: "",
    birth_place: "",
    age: "", // auto compute from birth_date
    religion: "",
    civil_status: civilStatuses[0],
    citizenship: "",
    residence: residences[0],

    // Family - Father
    father_name: "",
    father_home_address: "",
    father_phone: "",
    father_citizenship: "",
    father_occupation: "",
    father_office_address: "",
    father_office_tel: "",
    father_educational_attainment: "",
    father_last_school_attended: "",

    // Family - Mother
    mother_name: "",
    mother_home_address: "",
    mother_phone: "",
    mother_citizenship: "",
    mother_occupation: "",
    mother_office_address: "",
    mother_office_tel: "",
    mother_educational_attainment: "",
    mother_last_school_attended: "",

    // Alumni
    parent_alumnus: "No",
    alumni_school_year: "",
    alumni_level_course: "",

    // Educational Background
    lrn_no: "",
    last_school_name: "",
    last_school_track: "",
    last_school_strand: "",
    last_school_address: "",
    last_school_year_attended: "",
    graduation_date: "",

    // Transferee Only section (shown when any transferee === 'Yes')
    tr_last_school_attended: "",
    tr_course_degree: "",
    tr_major: "",
    tr_school_address: "",
    tr_school_year_attended: "",

    awards: "",
    memberships: "",

    // Upload + Schedule + Consent
    photo_file: null,
    admission_schedule_id: "",
    consent: false,
  });

  // Derived: should Transferee section show?
  const showTransfereeSection = useMemo(() => {
    return (
      form.college_transferee === "Yes" ||
      form.shs_transferee === "Yes" ||
      form.jhs_transferee === "Yes" ||
      form.gs_transferee === "Yes"
    );
  }, [form.college_transferee, form.shs_transferee, form.jhs_transferee, form.gs_transferee]);

  const currentLabel = useMemo(() => {
    switch (form.application_type) {
      case "college":
        return "This is an application for: College Level";
      case "shs":
        return "This is an application for: SHS Level";
      case "jhs":
        return "This is an application for: JUNIOR HIGH SCHOOL LEVELS";
      case "gs":
        return "This is an application for: Grade School LEVELS";
      default:
        return "Application";
    }
  }, [form.application_type]);

  // Fetch schedules
  useEffect(() => {
    let isMounted = true;
    const fetchSchedules = async () => {
      try {
        setLoadingSchedules(true);
        setScheduleError("");
        const { data } = await API.get("/api/admission-schedules");
        if (!isMounted) return;
        setSchedules(Array.isArray(data?.data) ? data.data : data);
      } catch (e) {
        setScheduleError("Hindi ma-load ang schedules. Paki-refresh.");
      } finally {
        setLoadingSchedules(false);
      }
    };
    fetchSchedules();
    return () => { isMounted = false; };
  }, []);

  // Auto-compute age
  useEffect(() => {
    if (!form.birth_date) return;
    const today = new Date();
    const b = new Date(form.birth_date);
    let age = today.getFullYear() - b.getFullYear();
    const m = today.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--;
    setForm((f) => ({ ...f, age: String(isNaN(age) ? "" : age) }));
  }, [form.birth_date]);

  const update = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const clearForm = () => {
    setForm({
      ...form,
      // reset all text fields
      college_first_choice: "",
      college_second_choice: "",
      last_name: "",
      first_name: "",
      middle_name: "",
      address_no: "",
      address_street: "",
      address_barangay: "",
      address_city_province: "",
      address_zip: "",
      tel_no: "",
      mobile_no: "",
      email: "",
      birth_date: "",
      birth_place: "",
      age: "",
      religion: "",
      citizenship: "",
      father_name: "",
      father_home_address: "",
      father_phone: "",
      father_citizenship: "",
      father_occupation: "",
      father_office_address: "",
      father_office_tel: "",
      father_educational_attainment: "",
      father_last_school_attended: "",
      mother_name: "",
      mother_home_address: "",
      mother_phone: "",
      mother_citizenship: "",
      mother_occupation: "",
      mother_office_address: "",
      mother_office_tel: "",
      mother_educational_attainment: "",
      mother_last_school_attended: "",
      parent_alumnus: "No",
      alumni_school_year: "",
      alumni_level_course: "",
      lrn_no: "",
      last_school_name: "",
      last_school_track: "",
      last_school_strand: "",
      last_school_address: "",
      last_school_year_attended: "",
      graduation_date: "",
      tr_last_school_attended: "",
      tr_course_degree: "",
      tr_major: "",
      tr_school_address: "",
      tr_school_year_attended: "",
      awards: "",
      memberships: "",
      photo_file: null,
      admission_schedule_id: "",
      consent: false,
    });
    setPhotoPreview(null);
    setStep(0);
    setServerMessage("");
  };

  const onPhotoChange = async (file) => {
    if (!file) return;
    // Client-side validation: <= 2MB, image, roughly square
    if (!file.type.startsWith("image/")) {
      alert("Pakitiyak na larawan (image) ang ina-upload.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Max 2MB ang laki ng picture.");
      return;
    }
    // Check approximate square
    const img = new Image();
    img.onload = () => {
      const ratio = img.width / img.height;
      if (ratio < 0.9 || ratio > 1.1) {
        alert("Dapat halos square ang 2x2 picture (1:1 aspect ratio).");
      }
    };
    img.src = URL.createObjectURL(file);
    setPhotoPreview(URL.createObjectURL(file));
    update("photo_file", file);
  };

  const submit = async () => {
    if (!form.consent) {
      alert("Kailangan i-check ang consent bago magsumite.");
      return;
    }
    try {
      setSubmitting(true);
      setServerMessage("");
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "photo_file") return; // add after
        if (typeof v === "boolean") fd.append(k, v ? "1" : "0");
        else fd.append(k, v ?? "");
      });
      if (form.photo_file) fd.append("photo_file", form.photo_file);

      const { data } = await API.post("/api/admissions", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setServerMessage(
        data?.message || "Matagumpay na naisumite ang iyong application."
      );
      // optional: clear core fields but keep type
      // clearForm();
    } catch (e) {
      const err = e?.response?.data;
      const msg = err?.message || err?.error || "Nagka-error sa pagsumite.";
      if (err?.errors) {
        console.error("Validation errors:", err.errors);
      }
      setServerMessage(msg);
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ----------------------- RENDER HELPERS -----------------------
  const SectionCard = ({ title, subtitle, children }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );

  const Field = ({ label, required, children }) => (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );

  const TextInput = (props) => (
    <input
      {...props}
      className={
        "w-full rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 " +
        (props.className || "")
      }
    />
  );

  const Select = ({ options, value, onChange, ...rest }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
      className="w-full rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );

  const Radio = ({ name, value, current, onChange, label }) => (
    <label className="inline-flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        name={name}
        value={value}
        checked={current === value}
        onChange={(e) => onChange(e.target.value)}
        className="text-indigo-600 focus:ring-indigo-500"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );

  // ----------------------- STEPS -----------------------
  const Step1 = () => (
    <>
      <SectionCard title="APPLICATION TYPE" subtitle="Piliin ang iyong level. Lalabas ang kaukulang seksyon batay sa pinili mo.">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {applicationTypes.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => update("application_type", t.key)}
              className={`rounded-2xl border p-3 text-sm font-medium transition ${
                form.application_type === t.key
                  ? "bg-indigo-600 text-white border-indigo-600 shadow"
                  : "bg-white text-gray-800 border-gray-300 hover:border-indigo-400"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="text-sm text-gray-600 mt-2">{currentLabel}</div>
      </SectionCard>

      {form.application_type === "college" && (
        <SectionCard title="College Section">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Academic Year" required>
              <Select
                options={acadYears}
                value={form.college_acad_year}
                onChange={(v) => update("college_acad_year", v)}
              />
            </Field>
            <Field label="Semester" required>
              <Select
                options={semesters}
                value={form.college_semester}
                onChange={(v) => update("college_semester", v)}
              />
            </Field>
            <Field label="Transferee" required>
              <div className="flex items-center gap-6">
                <Radio
                  name="college_transferee"
                  value="Yes"
                  current={form.college_transferee}
                  onChange={(v) => update("college_transferee", v)}
                  label="Yes"
                />
                <Radio
                  name="college_transferee"
                  value="No"
                  current={form.college_transferee}
                  onChange={(v) => update("college_transferee", v)}
                  label="No"
                />
              </div>
            </Field>
            <Field label="1st Choice" required>
              <TextInput
                type="text"
                placeholder="Your 1st course/program"
                value={form.college_first_choice}
                onChange={(e) => update("college_first_choice", e.target.value)}
              />
            </Field>
            <Field label="2nd Choice">
              <TextInput
                type="text"
                placeholder="Your 2nd course/program"
                value={form.college_second_choice}
                onChange={(e) => update("college_second_choice", e.target.value)}
              />
            </Field>
          </div>
        </SectionCard>
      )}

      {form.application_type === "shs" && (
        <SectionCard title="Senior High School Section">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Grade level" required>
              <Select
                options={shsGradeLevels}
                value={form.shs_grade_level}
                onChange={(v) => update("shs_grade_level", v)}
              />
            </Field>
            <Field label="Transferee" required>
              <div className="flex items-center gap-6">
                <Radio
                  name="shs_transferee"
                  value="Yes"
                  current={form.shs_transferee}
                  onChange={(v) => update("shs_transferee", v)}
                  label="Yes"
                />
                <Radio
                  name="shs_transferee"
                  value="No"
                  current={form.shs_transferee}
                  onChange={(v) => update("shs_transferee", v)}
                  label="No"
                />
              </div>
            </Field>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Track" required>
              <select
                className="w-full rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                value={form.shs_track}
                onChange={(e) => {
                  const newTrack = e.target.value;
                  const grp = SHS_OPTIONS.find((g) => g.track === newTrack) || SHS_OPTIONS[0];
                  update("shs_track", newTrack);
                  update("shs_strand", grp.strands[0]);
                }}
              >
                {SHS_OPTIONS.map((g) => (
                  <option key={g.track} value={g.track}>
                    {g.group}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Strand" required>
              <select
                className="w-full rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                value={form.shs_strand}
                onChange={(e) => update("shs_strand", e.target.value)}
              >
                {(SHS_OPTIONS.find((g) => g.track === form.shs_track) || SHS_OPTIONS[0]).strands.map(
                  (s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  )
                )}
              </select>
            </Field>
          </div>
        </SectionCard>
      )}

      {form.application_type === "jhs" && (
        <SectionCard title="Junior High School Section">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Grade level" required>
              <Select
                options={jhsGradeLevels}
                value={form.jhs_grade_level}
                onChange={(v) => update("jhs_grade_level", v)}
              />
            </Field>
            <Field label="Transferee" required>
              <div className="flex items-center gap-6">
                <Radio
                  name="jhs_transferee"
                  value="Yes"
                  current={form.jhs_transferee}
                  onChange={(v) => update("jhs_transferee", v)}
                  label="Yes"
                />
                <Radio
                  name="jhs_transferee"
                  value="No"
                  current={form.jhs_transferee}
                  onChange={(v) => update("jhs_transferee", v)}
                  label="No"
                />
              </div>
            </Field>
          </div>
        </SectionCard>
      )}

      {form.application_type === "gs" && (
        <SectionCard title="Grade School Section">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Grade level" required>
              <Select
                options={gsGradeLevels}
                value={form.gs_grade_level}
                onChange={(v) => update("gs_grade_level", v)}
              />
            </Field>
            <Field label="Transferee" required>
              <div className="flex items-center gap-6">
                <Radio
                  name="gs_transferee"
                  value="Yes"
                  current={form.gs_transferee}
                  onChange={(v) => update("gs_transferee", v)}
                  label="Yes"
                />
                <Radio
                  name="gs_transferee"
                  value="No"
                  current={form.gs_transferee}
                  onChange={(v) => update("gs_transferee", v)}
                  label="No"
                />
              </div>
            </Field>
          </div>
        </SectionCard>
      )}

      <SectionCard title="DIRECTIONS" subtitle="Fill in all necessary information as accurately as possible. Write N/A for items that do not apply to you.">
        <p className="text-sm text-gray-700 leading-relaxed">
          Please complete all required fields. Maaari ring i-save ang draft sa iyong browser (auto-retain habang bukas ang page).
        </p>
      </SectionCard>
    </>
  );

  const Step2 = () => (
    <>
      <SectionCard title="PERSONAL DATA">
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Family Name" required>
            <TextInput value={form.last_name} onChange={(e) => update("last_name", e.target.value)} />
          </Field>
          <Field label="Given Name" required>
            <TextInput value={form.first_name} onChange={(e) => update("first_name", e.target.value)} />
          </Field>
          <Field label="Middle Name">
            <TextInput value={form.middle_name} onChange={(e) => update("middle_name", e.target.value)} />
          </Field>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <Field label="Gender" required>
            <Select options={genders} value={form.gender} onChange={(v) => update("gender", v)} />
          </Field>
          <Field label="Date of Birth" required>
            <TextInput type="date" value={form.birth_date} onChange={(e) => update("birth_date", e.target.value)} />
          </Field>
          <Field label="Age">
            <TextInput type="number" value={form.age} onChange={(e) => update("age", e.target.value)} />
          </Field>
          <Field label="Place of Birth">
            <TextInput value={form.birth_place} onChange={(e) => update("birth_place", e.target.value)} />
          </Field>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <Field label="Religion">
            <TextInput value={form.religion} onChange={(e) => update("religion", e.target.value)} />
          </Field>
          <Field label="Civil Status">
            <Select options={civilStatuses} value={form.civil_status} onChange={(v) => update("civil_status", v)} />
          </Field>
          <Field label="Citizenship">
            <TextInput value={form.citizenship} onChange={(e) => update("citizenship", e.target.value)} />
          </Field>
          <Field label="Residence">
            <Select options={residences} value={form.residence} onChange={(v) => update("residence", v)} />
          </Field>
        </div>

        <div className="grid md:grid-cols-5 gap-4">
          <Field label="No.">
            <TextInput value={form.address_no} onChange={(e) => update("address_no", e.target.value)} />
          </Field>
          <Field label="Street">
            <TextInput value={form.address_street} onChange={(e) => update("address_street", e.target.value)} />
          </Field>
          <Field label="Barangay">
            <TextInput value={form.address_barangay} onChange={(e) => update("address_barangay", e.target.value)} />
          </Field>
          <Field label="City/Municipality/Province">
            <TextInput value={form.address_city_province} onChange={(e) => update("address_city_province", e.target.value)} />
          </Field>
          <Field label="Zip code">
            <TextInput value={form.address_zip} onChange={(e) => update("address_zip", e.target.value)} />
          </Field>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Tel. No.">
            <TextInput value={form.tel_no} onChange={(e) => update("tel_no", e.target.value)} />
          </Field>
          <Field label="Mobile No." required>
            <TextInput value={form.mobile_no} onChange={(e) => update("mobile_no", e.target.value)} />
          </Field>
          <Field label="E-mail Address" required>
            <TextInput type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
          </Field>
        </div>
      </SectionCard>
    </>
  );

  const Step3 = () => (
    <>
      <SectionCard title="FAMILY BACKGROUND">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Father */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">FATHER</h3>
            <div className="space-y-3">
              <Field label="Name">
                <TextInput value={form.father_name} onChange={(e) => update("father_name", e.target.value)} />
              </Field>
              <Field label="Home Address">
                <TextInput value={form.father_home_address} onChange={(e) => update("father_home_address", e.target.value)} />
              </Field>
              <Field label="Tel. No./Mobile No.">
                <TextInput value={form.father_phone} onChange={(e) => update("father_phone", e.target.value)} />
              </Field>
              <Field label="Citizenship">
                <TextInput value={form.father_citizenship} onChange={(e) => update("father_citizenship", e.target.value)} />
              </Field>
              <Field label="Occupation">
                <TextInput value={form.father_occupation} onChange={(e) => update("father_occupation", e.target.value)} />
              </Field>
              <Field label="Office Address">
                <TextInput value={form.father_office_address} onChange={(e) => update("father_office_address", e.target.value)} />
              </Field>
              <Field label="Office Tel. No.">
                <TextInput value={form.father_office_tel} onChange={(e) => update("father_office_tel", e.target.value)} />
              </Field>
              <Field label="Educational Attainment">
                <TextInput
                  value={form.father_educational_attainment}
                  onChange={(e) => update("father_educational_attainment", e.target.value)}
                />
              </Field>
              <Field label="Last School Attended">
                <TextInput
                  value={form.father_last_school_attended}
                  onChange={(e) => update("father_last_school_attended", e.target.value)}
                />
              </Field>
            </div>
          </div>

          {/* Mother */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">MOTHER</h3>
            <div className="space-y-3">
              <Field label="Name">
                <TextInput value={form.mother_name} onChange={(e) => update("mother_name", e.target.value)} />
              </Field>
              <Field label="Home Address">
                <TextInput value={form.mother_home_address} onChange={(e) => update("mother_home_address", e.target.value)} />
              </Field>
              <Field label="Tel. No./Mobile No.">
                <TextInput value={form.mother_phone} onChange={(e) => update("mother_phone", e.target.value)} />
              </Field>
              <Field label="Citizenship">
                <TextInput value={form.mother_citizenship} onChange={(e) => update("mother_citizenship", e.target.value)} />
              </Field>
              <Field label="Occupation">
                <TextInput value={form.mother_occupation} onChange={(e) => update("mother_occupation", e.target.value)} />
              </Field>
              <Field label="Office Address">
                <TextInput value={form.mother_office_address} onChange={(e) => update("mother_office_address", e.target.value)} />
              </Field>
              <Field label="Office Tel. No.">
                <TextInput value={form.mother_office_tel} onChange={(e) => update("mother_office_tel", e.target.value)} />
              </Field>
              <Field label="Educational Attainment">
                <TextInput
                  value={form.mother_educational_attainment}
                  onChange={(e) => update("mother_educational_attainment", e.target.value)}
                />
              </Field>
              <Field label="Last School Attended">
                <TextInput
                  value={form.mother_last_school_attended}
                  onChange={(e) => update("mother_last_school_attended", e.target.value)}
                />
              </Field>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 pt-4">
          <Field label="Are your father or mother an alumnus of San Pablo Colleges?">
            <div className="flex items-center gap-6">
              <Radio
                name="parent_alumnus"
                value="Yes"
                current={form.parent_alumnus}
                onChange={(v) => update("parent_alumnus", v)}
                label="YES"
              />
              <Radio
                name="parent_alumnus"
                value="No"
                current={form.parent_alumnus}
                onChange={(v) => update("parent_alumnus", v)}
                label="NO"
              />
            </div>
          </Field>
          <Field label="If YES, school year graduated">
            <TextInput value={form.alumni_school_year} onChange={(e) => update("alumni_school_year", e.target.value)} />
          </Field>
          <Field label="Level/Course">
            <TextInput value={form.alumni_level_course} onChange={(e) => update("alumni_level_course", e.target.value)} />
          </Field>
        </div>
      </SectionCard>
    </>
  );

  const Step4 = () => (
    <>
      <SectionCard title="EDUCATIONAL BACKGROUND">
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="LRN No.">
            <TextInput value={form.lrn_no} onChange={(e) => update("lrn_no", e.target.value)} />
          </Field>
          <Field label="Name of School last attended">
            <TextInput
              value={form.last_school_name}
              onChange={(e) => update("last_school_name", e.target.value)}
            />
          </Field>
          <Field label="Track">
            <TextInput value={form.last_school_track} onChange={(e) => update("last_school_track", e.target.value)} />
          </Field>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Field label="School Address">
            <TextInput value={form.last_school_address} onChange={(e) => update("last_school_address", e.target.value)} />
          </Field>
          <Field label="Strand">
            <TextInput value={form.last_school_strand} onChange={(e) => update("last_school_strand", e.target.value)} />
          </Field>
          <Field label="School year attended">
            <TextInput
              placeholder="e.g., 2023–2024"
              value={form.last_school_year_attended}
              onChange={(e) => update("last_school_year_attended", e.target.value)}
            />
          </Field>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Date of Graduation">
            <TextInput type="date" value={form.graduation_date} onChange={(e) => update("graduation_date", e.target.value)} />
          </Field>
          <div className="md:col-span-2" />
        </div>

        {showTransfereeSection && (
          <div className="mt-6 border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-2">For Transferee Only</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Name of School Last Attended">
                <TextInput
                  value={form.tr_last_school_attended}
                  onChange={(e) => update("tr_last_school_attended", e.target.value)}
                />
              </Field>
              <Field label="Course/Degree">
                <TextInput
                  value={form.tr_course_degree}
                  onChange={(e) => update("tr_course_degree", e.target.value)}
                />
              </Field>
              <Field label="Major">
                <TextInput value={form.tr_major} onChange={(e) => update("tr_major", e.target.value)} />
              </Field>
              <Field label="School Address">
                <TextInput
                  value={form.tr_school_address}
                  onChange={(e) => update("tr_school_address", e.target.value)}
                />
              </Field>
              <Field label="School Year Attended">
                <TextInput
                  value={form.tr_school_year_attended}
                  onChange={(e) => update("tr_school_year_attended", e.target.value)}
                />
              </Field>
            </div>
          </div>
        )}

        <div className="grid gap-4 mt-4">
          <Field label="List of honors/awards for academic excellence…">
            <textarea
              className="w-full rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              rows={3}
              value={form.awards}
              onChange={(e) => update("awards", e.target.value)}
            />
          </Field>
          <Field label="List of membership in school/outside organizations">
            <textarea
              className="w-full rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              rows={3}
              value={form.memberships}
              onChange={(e) => update("memberships", e.target.value)}
            />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="2x2 Profile Photo" subtitle="Upload 2x2 picture with white background (max 2MB).">
        <div className="grid md:grid-cols-3 gap-6 items-start">
          <div>
            <div className="aspect-square w-40 h-40 rounded-xl border bg-gray-50 overflow-hidden flex items-center justify-center">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-gray-500">2x2 Preview</span>
              )}
            </div>
          </div>
          <div className="md:col-span-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onPhotoChange(e.target.files?.[0])}
            />
            <p className="text-xs text-gray-500 mt-2">Tip: Plain white background, face clearly visible.</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Please choose your Schedule" subtitle="Dynamic: posted by admin with set limits.">
        {loadingSchedules ? (
          <div className="text-sm text-gray-600">Loading schedules…</div>
        ) : scheduleError ? (
          <div className="text-sm text-red-600">{scheduleError}</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Date & Time" required>
              <select
                className="w-full rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                value={form.admission_schedule_id}
                onChange={(e) => update("admission_schedule_id", e.target.value)}
              >
                <option value="">— Select schedule —</option>
                {schedules.map((s) => (
                  <option key={s.id} value={s.id}>
                    {new Date(s.date_time).toLocaleString()} ({s.remaining} slots left)
                  </option>
                ))}
              </select>
            </Field>
          </div>
        )}
      </SectionCard>

      <SectionCard title="DECLARATION OF CONSENT">
        <p className="text-sm text-gray-700 leading-relaxed">
          I express consent for the school to collect, store, and process my personal data. I understand that my
          consent does not preclude the existence of other criteria for lawful processing of personal data, and does
          not waive any of my rights under the Data Privacy Act of 2012 and other applicable laws. Furthermore, I
          certify that the information given herein is correct and complete.
        </p>
        <label className="mt-3 inline-flex items-center gap-2">
          <input
            type="checkbox"
            className="rounded text-indigo-600 focus:ring-indigo-500"
            checked={form.consent}
            onChange={(e) => update("consent", e.target.checked)}
          />
          <span className="text-sm">I have read and fully understood the above declaration and give my consent.</span>
        </label>
      </SectionCard>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Admission Application Form</h1>
          <p className="text-sm text-gray-600 mt-1">
            Please complete the form. Fields with * are required. UI/UX optimized for clarity and speed.
          </p>
        </div>

        <Stepper step={step} total={TOTAL_STEPS} />

        {step === 0 && <Step1 />}
        {step === 1 && <Step2 />}
        {step === 2 && <Step3 />}
        {step === 3 && <Step4 />}

        {/* Actions */}
        <div className="flex items-center justify-between mt-6">
          <button
            type="button"
            onClick={clearForm}
            className="px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-gray-700"
          >
            Clear
          </button>
          <div className="flex items-center gap-3">
            {step > 0 && (
              <button
                type="button"
                onClick={back}
                className="px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-gray-700"
              >
                Back
              </button>
            )}
            {step < TOTAL_STEPS - 1 ? (
              <button
                type="button"
                onClick={next}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={submit}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Submit"}
              </button>
            )}
          </div>
        </div>

        {serverMessage && (
          <div className="mt-4 p-3 rounded-xl border bg-gray-50 text-sm text-gray-800">
            {serverMessage}
          </div>
        )}

        <div className="h-10" />
      </div>
    </div>
  );
}
