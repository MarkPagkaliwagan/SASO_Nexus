import React, { useEffect, useState } from "react";
import axios from "axios";
import { formatDistanceToNow, parseISO, isValid, format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { FaBell, FaRegClock } from "react-icons/fa";

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  // Fetch announcements
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    axios
      .get("http://127.0.0.1:8000/api/announcements")
      .then((res) => {
        if (!mounted) return;
        setAnnouncements(Array.isArray(res.data) ? res.data : []);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load announcements.");
        setAnnouncements([]);
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Just now";
    try {
      const parsed = parseISO(timestamp);
      if (isValid(parsed)) return formatDistanceToNow(parsed, { addSuffix: true });
    } catch (e) {}
    return format(new Date(timestamp || Date.now()), "MMM dd, yyyy hh:mm a");
  };

  // Check if new (less than 24h)
  const isNew = (timestamp) => {
    if (!timestamp) return false;
    const parsed = new Date(timestamp);
    const diff = Date.now() - parsed.getTime();
    return diff < 1000 * 60 * 60 * 24;
  };

  return (
    <div
      className="relative min-h-screen py-12 px-4 md:px-6 lg:px-8 text-slate-100 bg-fixed bg-cover bg-center"
      style={{ backgroundImage: "url('/src/images/Campus2.jpg')" }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-[#003332]/50 bg-opacity-10 z-0"></div>

      <div className="relative z-10 w-full mx-auto mt-[50px]">
        {/* Header */}
        <header className="w-full mb-12">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl shadow-lg p-8 md:p-12 text-center w-full">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-white/10 ring-2 ring-white/20 hover:scale-110 transition-transform">
                <FaBell className="w-8 h-8 text-amber-300" />
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-wide text-white drop-shadow">
              Welcome to the SPC Announcement Page!
            </h1>
            <p className="mt-4 text-sm md:text-lg text-slate-200 max-w-4xl mx-auto">
              Hi SPCian! Welcome to your one-stop hub for everything from the Student Affairs and
              Services Office. This page keeps you updated with the latest campus news, event
              schedules, student services, important deadlines, and opportunities designed to help
              you thrive academically, socially, and personally.
            </p>
          </div>
        </header>

        {/* Announcements 22 */}
        <main className="space-y-4 w-full max-w-4xl mx-auto">
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/4 rounded-xl p-4 animate-pulse w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10" />
                    <div className="flex-1">
                      <div className="h-3 bg-white/10 rounded w-3/5 mb-2" />
                      <div className="h-2 bg-white/10 rounded w-1/3" />
                    </div>
                  </div>
                  <div className="mt-3 h-20 bg-white/8 rounded" />
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="bg-red-600/20 text-red-200 p-4 rounded-md">Error: {error}</div>
          )}

          {!loading && !error && announcements.length === 0 && (
            <div className="bg-white/6 p-6 rounded-xl text-slate-300">
              No announcements yet. Check back later or reach out to Student Affairs.
            </div>
          )}

          <AnimatePresence>
            {!loading &&
              announcements.map((a) => (
                <motion.article
                  key={a.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ type: "spring", stiffness: 220, damping: 18 }}
                  onClick={() => setSelectedAnnouncement(a)}
                  className="cursor-pointer bg-white rounded-xl shadow-lg p-6 text-slate-800 w-full transform transition-transform duration-200 hover:scale-105 hover:shadow-2xl"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div className="flex items-start gap-4 md:gap-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                      {a.department ? String(a.department).charAt(0) : "S"}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-base mb-1">{a.department}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <FaRegClock className="w-3 h-3" />
                            <span>{formatTimestamp(a.created_at)}</span>
                          </div>
                        </div>

                        {isNew(a.created_at) && (
                          <div className="text-xs bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-semibold">
                            NEW
                          </div>
                        )}
                      </div>

                      <div className="mt-3 text-sm text-slate-700 space-y-2 break-words">
                        {a.title && (
                          <div className="font-bold text-slate-800 mb-2">{a.title}</div>
                        )}
                        {a.announcement.split("\n").map((line, i) => (
                          <p key={i} className="leading-relaxed">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>

                  {(a.image || a.video) && (
                    <div className="mt-4 flex flex-col items-center gap-3 w-full">
                      {a.image && (
                        <img
                          src={`http://127.0.0.1:8000/storage/${a.image}`}
                          alt={a.title || "announcement image"}
                          className="rounded-lg object-cover w-full max-w-full"
                        />
                      )}

                      {a.video && (
                        <video
                          src={`http://127.0.0.1:8000/storage/${a.video}`}
                          controls
                          className="rounded-lg w-full"
                        />
                      )}
                    </div>
                  )}

                  <div className="mt-4 border-t pt-2 border-slate-100/10 text-sm text-slate-400 italic">
                    Posted by {a.department} • {formatTimestamp(a.created_at)}
                  </div>
                </motion.article>
              ))}
          </AnimatePresence>
        </main>

  {/* Modal */}
<AnimatePresence>
  {selectedAnnouncement && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm pt-20"
      onClick={() => setSelectedAnnouncement(null)}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-white rounded-2xl shadow-2xl w-11/12 md:w-3/4 lg:w-1/2 max-h-[85vh] overflow-y-auto p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-semibold transition-colors"
          onClick={() => setSelectedAnnouncement(null)}
          aria-label="Close modal"
        >
          &times;
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800 leading-tight">
            {selectedAnnouncement.title || "Announcement"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {selectedAnnouncement.department} • {formatTimestamp(selectedAnnouncement.created_at)}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-4 text-gray-700 text-base leading-relaxed">
          {selectedAnnouncement.announcement.split("\n").map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>

        {/* Image / Video */}
        {(selectedAnnouncement.image || selectedAnnouncement.video) && (
          <div className="mt-6 flex flex-col gap-4">
            {selectedAnnouncement.image && (
              <img
                src={`http://127.0.0.1:8000/storage/${selectedAnnouncement.image}`}
                alt={selectedAnnouncement.title || "announcement image"}
                className="rounded-xl w-full object-cover shadow-md"
              />
            )}
            {selectedAnnouncement.video && (
              <video
                src={`http://127.0.0.1:8000/storage/${selectedAnnouncement.video}`}
                controls
                className="rounded-xl w-full shadow-md"
              />
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

      </div>
    </div>
  );
}
