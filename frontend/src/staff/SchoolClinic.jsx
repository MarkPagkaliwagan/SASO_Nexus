import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Users,
  Home,
  Activity,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  File,
  LogOut,
  Volume2,
  Calendar,
} from "react-feather";
import { motion, AnimatePresence } from "framer-motion";
import spcLogo from "../images/SPC.png";
import sasoLogo from "../images/SASO.png";

// ✅ Keep only relevant components
import AdminPersonnel from "../DashboardContent/AdminPersonnel";
import AdminAnnouncement from "../DashboardContent/AdminAnnouncement";
import EventPosting from "../DashboardContent/EventPosting";
import ReportForm from "../components/ReportForm";

export default function StaffDashboard() {
  const navigate = useNavigate();

  // ✅ States
  const [showPopup, setShowPopup] = useState(false);
  const [activePanel, setActivePanel] = useState(() => {
    return localStorage.getItem("staffActivePanel") || "Dashboard";
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  // ✅ Detect touch devices
  useEffect(() => {
    const touch =
      "ontouchstart" in window ||
      (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
    setIsTouch(Boolean(touch));
  }, []);

  // ✅ Check login token
  useEffect(() => {
    const token = localStorage.getItem("staffToken");
    const role = localStorage.getItem("role");
    if (!token || role !== "staff") {
      navigate("/staff-login", { replace: true });
    }
    if (localStorage.getItem("showPopup") === "true") {
      setShowPopup(true);
      localStorage.removeItem("showPopup");
      setActivePanel("Dashboard");
      localStorage.setItem("staffActivePanel", "Dashboard");
    }
  }, [navigate]);

  // ✅ Save active panel
  useEffect(() => {
    localStorage.setItem("staffActivePanel", activePanel);
  }, [activePanel]);

  const handleClosePopup = () => setShowPopup(false);

  // ✅ Sidebar component
  const SidebarContent = ({ isMobile }) => {
    const itemBase =
      "flex items-center gap-3 text-left px-3 py-2 rounded-lg w-full truncate transition-all";
    const itemHover = !isTouch ? " hover:text-black hover:bg-yellow-500" : "";
    const dropdownItemBase =
      "text-sm text-left px-2 py-1 rounded w-full text-left";
    const dropdownItemHover = !isTouch ? " hover:bg-yellow-500/60" : "";
    const logoutHover = !isTouch ? " hover:bg-yellow-500" : "";

    return (
      <div className="flex flex-col h-full w-full">
        {/* 🔹 Logo Section */}
        <div className="p-4 border-b border-yellow-400/10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-base font-bold shadow-md">
            CL
          </div>
          <AnimatePresence>
            {(isExpanded || isMobile) && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="overflow-hidden"
              >
                <div className="text-lg font-semibold truncate">
                  San Pablo Colleges
                </div>
                <div className="text-xs text-yellow-200 truncate">
                  Clinic Staff Dashboard
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 🔹 Menu Section */}
        <div className="flex-1 p-3 mt-3 overflow-y-auto">
          <nav className="flex flex-col space-y-2">
            {/* 🔹 Dashboard */}
            <button
              onClick={() => {
                setActivePanel("Dashboard");
                setIsMobileMenuOpen(false);
              }}
              className={`${itemBase}${itemHover}`}
            >
              <Home size={18} />
              <AnimatePresence>
                {(isExpanded || isMobile) && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="truncate"
                  >
                    Dashboard
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* 🔹 Staff */}
            <button
              onClick={() => {
                setActivePanel("staffs");
                setIsMobileMenuOpen(false);
              }}
              className={`${itemBase}${itemHover}`}
            >
              <Users size={18} />
              <AnimatePresence>
                {(isExpanded || isMobile) && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="truncate"
                  >
                    Staff
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            
            {/* 🔹 Reports */}
            <button
              onClick={() => {
                setActivePanel("reports");
                setIsMobileMenuOpen(false);
              }}
              className={`${itemBase}${itemHover}`}
            >
              <File size={18} />
              <AnimatePresence>
                {(isExpanded || isMobile) && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="truncate"
                  >
                    Reports
                  </motion.span>
                )}
              </AnimatePresence>
            </button>


            {/* 🔹 Posting Dropdown */}
            <div>
              <button
                onClick={() => setOpenDropdown(!openDropdown)}
                className={`flex items-center gap-3 justify-between text-left px-3 py-2 rounded-lg w-full truncate transition-all${itemHover}`}
              >
                <div className="flex items-center gap-3">
                  <Activity size={18} />
                  <AnimatePresence>
                    {(isExpanded || isMobile) && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="truncate"
                      >
                        Posting
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                {(isExpanded || isMobile) &&
                  (openDropdown ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  ))}
              </button>

              <AnimatePresence>
                {openDropdown && (isExpanded || isMobile) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="ml-10 mt-1 flex flex-col space-y-1"
                  >
                    <button
                      onClick={() => {
                        setActivePanel("announcement");
                        setIsMobileMenuOpen(false);
                      }}
                      className={`${dropdownItemBase}${dropdownItemHover} flex items-center gap-2`}
                    >
                      <Volume2 size={16} />
                      Announcement
                    </button>
                    <button
                      onClick={() => {
                        setActivePanel("events");
                        setIsMobileMenuOpen(false);
                      }}
                      className={`${dropdownItemBase}${dropdownItemHover} flex items-center gap-2`}
                    >
                      <Calendar size={16} />
                      Events
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>
        </div>

        {/* 🔹 Logout */}
        <div className="p-4 border-t border-yellow-400/10">
          <button
            onClick={() => {
              localStorage.removeItem("staffToken");
              localStorage.removeItem("role");
              navigate("/staff/login", { replace: true });
            }}
            className={`w-full bg-yellow-600 px-4 py-2 rounded-lg text-white flex items-center gap-3 justify-center transition${logoutHover}`}
          >
            <CheckCircle size={18} />
            <AnimatePresence>
              {(isExpanded || isMobile) && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="truncate"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden bg-gradient-to-r from-slate-100 via-neutral-50 to-slate-200">
      {/* 🔹 Topbar (Mobile Only) */}
      <div className="md:hidden fixed top-0 left-0 w-full flex justify-between items-center bg-yellow-700 text-white z-50 h-14 px-4 shadow-md">
        <div className="flex items-center gap-3 truncate">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold shadow-sm">
            CL
          </div>
          <div className="text-lg font-semibold truncate">Clinic Staff</div>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* 🔹 Sidebar (Desktop) */}
      <motion.aside
        initial={{ width: 72 }}
        animate={{ width: isExpanded ? 280 : 72 }}
        transition={{ duration: 0.25 }}
        onMouseEnter={() => {
          if (!isTouch) setIsExpanded(true);
        }}
        onMouseLeave={() => {
          if (!isTouch) setIsExpanded(false);
        }}
        className="hidden md:flex bg-yellow-700 text-white flex-col h-screen fixed top-0 left-0 z-40 shadow-xl overflow-hidden"
      >
        <SidebarContent isMobile={false} />
      </motion.aside>

      {/* 🔹 Sidebar (Mobile) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.25 }}
            className="fixed top-0 left-0 w-72 h-full bg-yellow-700 text-white z-50 shadow-xl"
          >
            <SidebarContent isMobile={true} />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 🔹 Main Content */}
      <main className="flex-1 p-4 md:p-8 md:ml-20 overflow-auto w-full max-w-full mt-16 md:mt-0 transition">
        {activePanel === "Dashboard" && (
          <div className="relative w-full min-h-screen flex flex-col items-center justify-start text-center overflow-hidden pt-32 md:pt-40">
            <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all duration-300 pointer-events-none z-0" />

            <div className="relative z-10 flex flex-col items-center justify-center gap-8">
              <div className="flex items-center justify-center gap-12">
                <img
                  src={spcLogo}
                  alt="SPC Logo"
                  className="w-36 md:w-48 object-contain"
                />
                <img
                  src={sasoLogo}
                  alt="Clinic Logo"
                  className="w-32 md:w-44 object-contain"
                />
              </div>

              <h1 className="text-6xl md:text-8xl font-extrabold text-yellow-700 tracking-tight hover:text-yellow-500 transition-colors duration-300">
                SAN PABLO COLLEGES
              </h1>

              <h2 className="text-3xl md:text-5xl font-semibold text-gray-700 hover:text-yellow-500 transition-colors duration-300">
                Department of Clinic
              </h2>

              <span className="mt-4 text-2xl md:text-3xl font-medium text-yellow-800 hover:text-yellow-500 transition-colors duration-300">
                Staff Dashboard
              </span>
            </div>
          </div>
        )}

        {activePanel === "staffs" && <AdminPersonnel />}
        {activePanel === "announcement" && <AdminAnnouncement />}
        {activePanel === "events" && <EventPosting />}
        {activePanel === "reports" && <ReportForm />}

      </main>

      {/* 🔹 Popup After Login */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl shadow-lg p-6 md:p-8 max-w-md w-full text-center bg-white"
          >
            <CheckCircle size={48} className="text-yellow-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold truncate text-yellow-700">
              Login Verified
            </h2>
            <p className="text-gray-600 mt-2">
              You are now logged in as authorized Clinic Staff.
            </p>
            <button
              onClick={handleClosePopup}
              className="mt-6 bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg transition"
            >
              OK
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
