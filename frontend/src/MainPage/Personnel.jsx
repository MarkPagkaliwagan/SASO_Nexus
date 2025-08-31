import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Mail, Phone, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// New refined palette
const PALETTE = {
  cardBg: "#ffffff",
  accent1: "#6366f1", // soft indigo
  accent2: "#1e293b",
  highlight: "#0ea5e9", // cyan blue
  text: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
};

const unitsOrder = [
  "Guidance Office",
  "Student Formation and Development Unit (SFDU)",
  "School Clinic",
  "Campus Ministry",
  "Sports Development Unit",
];

const rankOrder = ["Head", "Staff", "Student Assistant"];

const api = axios.create({ baseURL: "http://127.0.0.1:8000/api" });
const PLACEHOLDER = `${window.location.origin}/placeholder.png`;

export default function Personnel() {
  const [personnels, setPersonnels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeUnit, setActiveUnit] = useState("All");
  const [modalPerson, setModalPerson] = useState(null);

  useEffect(() => {
    let mounted = true;
    api
      .get("/personnel")
      .then((res) => {
        if (!mounted) return;
        setPersonnels(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => mounted && setPersonnels([]))
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  const getProfileUrl = (profile, updatedAt) => {
    if (!profile) return PLACEHOLDER;
    const base = profile.startsWith("http")
      ? profile
      : `http://127.0.0.1:8000/${profile.startsWith("storage/") ? profile : "storage/" + profile}`;
    const v = updatedAt ? new Date(updatedAt).getTime() : 0;
    return `${base}?v=${v}`;
  };

  const units = useMemo(() => ["All", ...unitsOrder], []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = personnels.filter((p) => {
      if (activeUnit !== "All" && p.unit?.trim() !== activeUnit) return false;
      if (!q) return true;
      return (
        (p.fullName || "").toLowerCase().includes(q) ||
        (p.position || "").toLowerCase().includes(q) ||
        (p.email || "").toLowerCase().includes(q)
      );
    });

    return result.sort((a, b) => {
      const rankA =
        rankOrder.indexOf(a.position) !== -1
          ? rankOrder.indexOf(a.position)
          : rankOrder.length;
      const rankB =
        rankOrder.indexOf(b.position) !== -1
          ? rankOrder.indexOf(b.position)
          : rankOrder.length;
      return rankA - rankB;
    });
  }, [personnels, query, activeUnit]);

  const sectioned = useMemo(() => {
    const map = {};
    (unitsOrder || []).forEach((u) => (map[u] = []));
    filtered.forEach((p) => {
      const u = p.unit?.trim() || "Unassigned";
      if (!map[u]) map[u] = [];
      map[u].push(p);
    });
    return map;
  }, [filtered]);

  const cardVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1 },
  };

return (
  <div
    className="relative min-h-screen p-6 text-[15px] sm:text-[16px] bg-fixed bg-cover bg-center "
    style={{
      backgroundImage: "url('/src/images/Campus2.jpg')", // ilagay path ng background image mo
    }}
  >
    {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-[#003332]/50 bg-opacity-10 z-0"></div>

    {/* MAIN CONTENT */}
    <div className="relative z-10 mt-[30px]">
      <style>{`
        .person-card { 
          background: ${PALETTE.cardBg}; 
          border: 1px solid ${PALETTE.border}; 
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          display: flex; 
          flex-direction: row; 
          align-items: center; 
          gap: 20px;
          cursor: pointer;
        }
        .person-card:hover { 
          transform: translateY(-6px) scale(1.02); 
          box-shadow: 0 16px 30px rgba(16,24,40,0.12);
        }
        .person-img { 
          width: 120px; 
          height: 120px; 
          object-fit: cover; 
          border-radius: 14px; 
          flex-shrink: 0; 
        }
        .info { flex: 1; min-width: 0; }
        .position-text { color: ${PALETTE.accent2}; font-weight: 600; font-size: 0.95rem; }
        .name-text { color: ${PALETTE.text}; font-weight: 700; font-size: 1.1rem; }
        .meta-text { color: ${PALETTE.muted}; font-size: 0.85rem; }
        @media (max-width: 640px) { 
          .controls { flex-direction: column; align-items: stretch; gap: 12px; }
          .person-card { flex-direction: column; text-align: center; }
          .person-img { margin-bottom: 12px; }
          .info { text-align: center; }
        }
      `}</style>

 {/* HEADER */}
<motion.header
  initial={{ y: -40, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ duration: 0.6 }}
  className="max-w-4xl mx-auto mb-10 text-center space-y-3"
>
  {/* Title */}
  <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r text-[#e3d151] bg-clip-text text-transparent drop-shadow-sm">
    Personnel Directory
  </h1>

  {/* Subtitle */}
  <p className="text-[#FFE18F] text-base md:text-lg leading-relaxed">
    Welcome! Here you can browse and connect with our dedicated San Pablo Colleges Student Affairs and Service Office
    personnel.Find their contact details, roles, and more with just a few clicks.
  </p>


        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="controls flex flex-col md:flex-row items-center gap-3 mt-6"
        >
          <div className="relative flex-1 w-full">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, position, or email"
              className="pl-10 pr-4 py-2 rounded-xl text-[15px] w-full shadow-sm focus:outline-none focus:ring-2 bg-white border border-slate-200"
              style={{
                color: PALETTE.text,
              }}
            />
            <div className="absolute left-3 top-2.5">
              <Search size={18} color={PALETTE.muted} />
            </div>
          </div>

          <div>
            <select
              value={activeUnit}
              onChange={(e) => setActiveUnit(e.target.value)}
              className="rounded-lg p-2 text-[15px] w-full shadow-sm cursor-pointer 
              hover:scale-[1.02] transition bg-white border border-slate-200"
              style={{
                color: PALETTE.text,
              }}
            >
              {units.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </motion.div>
      </motion.header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto">
        {loading ? (
          <div className="grid gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="person-card rounded-2xl p-6"
                style={{ minHeight: 160 }}
              >
                <div className="w-28 h-28 rounded-lg bg-gray-100 animate-pulse" />
                <div className="info">
                  <div className="mt-2 h-5 w-2/3 rounded bg-gray-100 animate-pulse" />
                  <div className="mt-2 h-4 w-1/2 rounded bg-gray-100 animate-pulse" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.06 } } }}
            className="space-y-6"
          >
            {(activeUnit === "All" ? filtered : sectioned[activeUnit] || []).map((m) => (
              <motion.article
                key={m.id}
                variants={cardVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setModalPerson(m)}
                className="person-card rounded-2xl p-6"
              >
                <img
                  src={getProfileUrl(m.profile, m.updated_at)}
                  alt={m.fullName || "Profile"}
                  onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
                  className="person-img"
                />
                <div className="info">
                  <div className="name-text">{m.fullName}</div>
                  <div className="position-text">{m.position}</div>
                  <div className="meta-text">{m.email}</div>
                  <div className="meta-text">{m.contact}</div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        )}
      </main>

      {/* MODAL */}
      <AnimatePresence>
        {modalPerson && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: "rgba(2,6,23,0.55)" }}
            onClick={() => setModalPerson(null)}
          >
            <motion.div
              initial={{ y: 40, scale: 0.95, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 20, scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative rounded-2xl p-6 w-96 max-w-full shadow-xl bg-white border border-slate-200"
              style={{
                zIndex: 999,
              }}
            >
              <button
                onClick={() => setModalPerson(null)}
                className="absolute right-5 top-5 hover:rotate-90 transition"
              >
                <X color={PALETTE.muted} />
              </button>
              <div className="flex flex-col items-center gap-4">
                <img
                  src={getProfileUrl(modalPerson.profile, modalPerson.updated_at)}
                  alt={modalPerson.fullName || "Profile"}
                  onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
                  className="w-32 h-32 rounded-xl object-cover shadow"
                />
                <div style={{ color: PALETTE.text, fontWeight: 800, fontSize: 20 }}>
                  {modalPerson.fullName}
                </div>
                <div style={{ color: PALETTE.accent2, fontSize: 16 }}>
                  {modalPerson.position}
                </div>
                <div className="mt-4 w-full flex flex-col gap-3">
                  <a
                    href={`mailto:${modalPerson.email}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition bg-slate-50"
                    style={{ color: PALETTE.text }}
                  >
                    <Mail size={16} />{" "}
                    <span style={{ color: PALETTE.muted }}>{modalPerson.email}</span>
                  </a>
                  <a
                    href={`tel:${modalPerson.contact}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition bg-slate-50"
                    style={{ color: PALETTE.text }}
                  >
                    <Phone size={16} />{" "}
                    <span style={{ color: PALETTE.muted }}>{modalPerson.contact}</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
       </AnimatePresence>
    </div>
  </div>  
);
}
