import React, { useEffect, useState } from "react";
import axios from "axios";
import { ClipboardList, UserCheck, Layers } from "lucide-react";

const ICONS = [ClipboardList, UserCheck, Layers]; // cycling icons for department cards

const ExitDashboard = () => {
  const [exitData, setExitData] = useState([]);

  const ACCENT_COLORS = ["#16A34A", "#F59E0B", "#22C55E", "#FBBF24", "#059669"]; // green & yellow accents

  useEffect(() => {
    const fetchExitData = () => {
      axios
        .get("http://localhost:8000/api/analytics/exit-bookings")
        .then((res) => setExitData(res.data || []))
        .catch((err) => console.error(err));
    };

    fetchExitData();
    const interval = setInterval(fetchExitData, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalExit = exitData.reduce((sum, item) => sum + (item.total || 0), 0);

  return (
    <div className="min-h-screen p-6">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-8">
        <ClipboardList className="w-8 h-8" style={{ color: "#F59E0B" }} />
        <h1 className="text-3xl font-extrabold" style={{ color: "#064e3b" }}>
          Exit Bookings Dashboard
        </h1>
      </div>

      {/* CARDS */}
      <div className="flex flex-wrap gap-6 mb-12">
        {/* Total Exit Bookings */}
        <div
          className="flex-1 min-w-[220px] max-w-xs rounded-2xl shadow-lg p-5 flex items-center gap-4 transition-transform transform hover:scale-105"
          style={{ background: "white" }}
        >
          <div
            className="p-3 rounded-lg"
            style={{ background: "#ecfdf5" }}
          >
            <UserCheck className="w-6 h-6" style={{ color: "#16A34A" }} />
          </div>
          <div>
            <div
              className="text-sm font-semibold"
              style={{ color: "#065f46" }}
            >
              Total Exit Bookings
            </div>
            <div
              className="text-2xl font-extrabold"
              style={{ color: "#064e3b" }}
            >
              {totalExit}
            </div>
          </div>
        </div>

        {/* Per Department Cards */}
        {exitData.map((item, idx) => {
          const Icon = ICONS[idx % ICONS.length];
          const accent = ACCENT_COLORS[idx % ACCENT_COLORS.length];
          return (
            <div
              key={idx}
              className="flex-1 min-w-[220px] max-w-xs rounded-2xl shadow-lg p-4 flex items-center gap-4 transition-transform transform hover:scale-105"
              style={{ background: "white", borderLeft: `6px solid ${accent}` }}
            >
              <div className="p-3 rounded-md" style={{ background: "#f8fafc" }}>
                <Icon className="w-6 h-6" style={{ color: accent }} />
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: "#065f46" }}>
                  {item.department}
                </div>
                <div className="text-2xl font-bold" style={{ color: "#064e3b" }}>
                  {item.total}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExitDashboard;
