import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PALETTE = {
  cardBg: "#ffffff",
  green: "#1B4332",
  gold: "#D4AF37",
  white: "#ffffff",
  text: "#1E1E1E",
  border: "#E8E8E8",
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
      // Always prioritize "Office In Charge" at the very top
      if (a.position === "Office In Charge" && b.position !== "Office In Charge") return -1;
      if (b.position === "Office In Charge" && a.position !== "Office In Charge") return 1;

      // Then sort by rank (Head > Staff > Student Assistant)
      const rankA = rankOrder.indexOf(a.position) !== -1 ? rankOrder.indexOf(a.position) : rankOrder.length;
      const rankB = rankOrder.indexOf(b.position) !== -1 ? rankOrder.indexOf(b.position) : rankOrder.length;
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
    hidden: { opacity: 0, y: 12, scale: 0.995 },
    show: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <div
      className="relative min-h-screen p-6 bg-fixed bg-cover bg-center"
      style={{ backgroundImage: "url('/src/images/Campus2.jpg')" }}
    >
      <div className="absolute inset-0 bg-[#003332]/50 z-0"></div>

      <div className="relative z-10 mt-[80px] max-w-7xl mx-auto">
        <style>{`
          .id-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); 
            gap: 16px; 
          }

          .person-card {
            background: linear-gradient(145deg, ${PALETTE.white}, #f9f9f9);
            border: 2px solid ${PALETTE.gold};
            border-radius: 16px;
            display: flex;
            gap: 12px;
            align-items: center;
            padding: 14px;
            cursor: pointer;
            height: 190px;
            box-shadow: 0 6px 14px rgba(0,0,0,0.08);
            transition: all 0.25s ease;
            position: relative;
            overflow: hidden;
          }

          .person-card::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            height: 5px;
            width: 100%;
            background: ${PALETTE.green};
            border-top-left-radius: 12px;
            border-top-right-radius: 12px;
          }

          .person-card:hover {
            transform: translateY(-6px) scale(1.02);
            box-shadow: 0 10px 30px rgba(0, 80, 40, 0.2);
            border-color: ${PALETTE.green};
          }

          .id-photo {
            width: 96px;
            height: 120px;
            object-fit: cover;
            border-radius: 10px;
            border: 2px solid ${PALETTE.gold};
          }

          .id-info {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            min-width: 0;
          }

          .id-name {
            font-weight: 800;
            color: ${PALETTE.green};
            font-size: 1rem;
          }

          .id-position {
            color: ${PALETTE.gold};
            font-weight: 600;
            font-size: 0.9rem;
          }

          .id-meta {
            color: #3a3a3a;
            font-size: 0.83rem;
          }

          .badge-id {
            background: ${PALETTE.green};
            color: ${PALETTE.white};
            font-weight: 700;
            padding: 4px 8px;
            border-radius: 8px;
            font-size: 0.82rem;
            border: 1px solid ${PALETTE.gold};
          }

          @media (max-width:640px) {
            .person-card { height: auto; flex-direction: row; padding:10px; }
            .id-photo { width:76px; height:96px; }
          }
        `}</style>

        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45 }}
          className="mb-6 text-center"
        >
          <div className="text-center my-6">
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-[#D4AF37] via-yellow-400 to-[#006400] bg-clip-text text-transparent drop-shadow-lg tracking-wide">
              Personnel Directory
            </h1>
            <p className="text-[#f1f1f1] text-sm mt-2 italic opacity-90">
              Discover and connect with our dedicated personnel team.
            </p>
          </div>


          <div className="controls flex flex-col md:flex-row items-center gap-3 mt-4 max-w-3xl mx-auto">
            <div className="relative flex-1 w-full">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, position, or email"
                className="pl-10 pr-4 py-2 rounded-xl w-full shadow focus:outline-none focus:ring-2 border border-slate-200"
                style={{ color: PALETTE.text }}
              />
              <div className="absolute left-3 top-2.5">
                <Search size={16} color="#6b7280" />
              </div>
            </div>

            <div>
              <select
                value={activeUnit}
                onChange={(e) => setActiveUnit(e.target.value)}
                className="rounded-lg p-2 text-[14px] w-full shadow cursor-pointer transition bg-white border border-slate-200 hover:border-[#1B4332]"
                style={{ color: PALETTE.text }}
              >
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.header>
        <main>
          {loading ? (
            <div className="id-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="person-card animate-pulse"></div>
              ))}
            </div>
          ) : (
            <>
              {/* --- OFFICE IN CHARGE --- */}
              {filtered.some((p) => p.position === "Office In Charge") && (
                <div className="mb-10">


                  <div className="flex justify-center">
                    {filtered
                      .filter((p) => p.position === "Office In Charge")
                      .map((m) => (
                        <motion.article
                          key={m.id}
                          variants={cardVariants}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setModalPerson(m)}
                          className="person-card w-[340px]"
                        >
                          <img
                            src={getProfileUrl(m.profile, m.updated_at)}
                            alt={m.fullName || "Profile"}
                            onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
                            className="id-photo"
                          />
                          <div className="id-info">
                            <div>
                              <div className="id-name">{m.fullName}</div>
                              <div className="id-position">{m.position}</div>
                              <div className="id-meta">{m.unit}</div>
                            </div>
                            <div className="flex justify-end">
                              <div className="badge-id">ID {m.id}</div>
                            </div>
                          </div>
                        </motion.article>
                      ))}
                  </div>

                </div>
              )}

              <motion.div
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.05 } } }}
                className="id-grid"
              >
                {(activeUnit === "All"
                  ? filtered.filter((p) => p.position !== "Office In Charge")
                  : sectioned[activeUnit]?.filter((p) => p.position !== "Office In Charge") || []
                ).map((m) => (
                  <motion.article
                    key={m.id}
                    variants={cardVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setModalPerson(m)}
                    className="person-card"
                  >
                    <img
                      src={getProfileUrl(m.profile, m.updated_at)}
                      alt={m.fullName || "Profile"}
                      onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
                      className="id-photo"
                    />
                    <div className="id-info">
                      <div>
                        <div className="id-name">{m.fullName}</div>
                        <div className="id-position">{m.position}</div>
                        <div className="id-meta">{m.unit}</div>
                      </div>
                      <div className="flex justify-end">
                        <div className="badge-id">ID {m.id}</div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            </>
          )}
        </main>



        {/* Modal */}
        <AnimatePresence>
          {modalPerson && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ background: "rgba(0,0,0,0.5)" }}
              onClick={() => setModalPerson(null)}
            >
              <motion.div
                initial={{ y: 40, scale: 0.98, opacity: 0 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                exit={{ y: 20, scale: 0.98, opacity: 0 }}
                transition={{ type: "spring", stiffness: 280, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                className="relative rounded-2xl p-6 w-96 max-w-full shadow-xl bg-white border-2 border-[#D4AF37]"
              >
                <button
                  onClick={() => setModalPerson(null)}
                  className="absolute right-5 top-5 hover:rotate-90 transition"
                >
                  <X color={PALETTE.green} />
                </button>

                <div className="flex flex-col items-center gap-4">
                  <img
                    src={getProfileUrl(modalPerson.profile, modalPerson.updated_at)}
                    alt={modalPerson.fullName || "Profile"}
                    onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
                    className="w-32 h-32 rounded-xl object-cover border-2 border-[#D4AF37]"
                  />

                  <div className="text-xl font-bold text-[#1B4332]">
                    {modalPerson.fullName}
                  </div>
                  <div className="text-[#D4AF37] font-semibold">
                    {modalPerson.position}
                  </div>

                  <div className="mt-4 w-full grid grid-cols-1 gap-2 text-sm text-[#1E1E1E]">
                    <div><strong>ID:</strong> {modalPerson.id}</div>
                    <div><strong>Unit:</strong> {modalPerson.unit || "Unassigned"}</div>
                    <div><strong>Email:</strong> {modalPerson.email || "—"}</div>
                    <div><strong>Contact:</strong> {modalPerson.contact || "—"}</div>
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
