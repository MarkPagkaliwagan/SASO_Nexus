import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Users,
  Home,
  Activity,
  Clipboard,
  UserCheck,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  LogOut,
  Volume2,
  FileText ,
  Calendar
} from "react-feather";
import { motion, AnimatePresence } from "framer-motion";
import spcLogo from "../images/SPC.png";
import sasoLogo from "../images/SASO.png";
// ✅ Import ng mga content panels
import StaffPanel from "../DashboardContent/StaffPanel";
import AdminPersonnel from "../DashboardContent/AdminPersonnel";
import AdminAnnouncement from "../DashboardContent/AdminAnnouncement";
import EventPosting from "../DashboardContent/EventPosting";
import AdminSchedule from "../DashboardContent/AdminSchedule";
import AdminExitSchedule from "../DashboardContent/AdminExitSchedule";
import ExamCreate from "../DashboardContent/ExamCreate";
import ExamList from "../DashboardContent/ExamList";
import ExamScheduleAnalytics from "../DashboardContent/ExamScheduleAnalytics";
import ExitAnalytics from "../DashboardContent/ExitAnalytics";
import ExamsAnalytics from "../DashboardContent/ExamsAnalytics";
import AdminReport from "../components/AdminReport";


export default function AdminDashboard() {
  const navigate = useNavigate();

  // ✅ States
  const [showPopup, setShowPopup] = useState(false);
  const [activePanel, setActivePanel] = useState(() => {
    return localStorage.getItem("activePanel") || "Dashboard";
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [openDashboard, setOpenDashboard] = useState(false); // Dashboard dropdown
  const [isTouch, setIsTouch] = useState(false);

  // ✅ Detect touch devices
  useEffect(() => {
    const touch = ("ontouchstart" in window) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
    setIsTouch(Boolean(touch));
  }, []);

  // ✅ Check login token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/admin/login");
    }
    if (localStorage.getItem("showPopup") === "true") {
      setShowPopup(true);
      localStorage.removeItem("showPopup");
      setActivePanel("Dashboard");
      localStorage.setItem("activePanel", "Dashboard");
    }
  }, [navigate]);

  // ✅ Save active panel
  useEffect(() => {
    localStorage.setItem("activePanel", activePanel);
  }, [activePanel]);

  const handleClosePopup = () => setShowPopup(false);

  const menuItems = [
    { icon: <Clipboard size={18} />, label: "Admission Schedule", panel: "schedule" },
    { icon: <Users size={18} />, label: "List of Personnel", panel: "personnel" },
    { icon: <UserCheck size={18} />, label: "Staffs Account", panel: "staffs" },
    { icon: <LogOut size={18} />, label: "Exit Interview", panel: "exit" },
    { icon: <UserCheck size={18} />, label: "Create Examination", panel: "ExamCreate" },
    { icon: <Clipboard size={18} />, label: "Examination List", panel: "ExamList" },
    { icon: <FileText size={18} />, label: "Report", panel: "AdminReport" },

    
  ];

  // ✅ Sidebar component
  const SidebarContent = ({ isMobile }) => {
    const itemBase = "flex items-center gap-3 text-left px-3 py-2 rounded-lg w-full truncate transition-all";
    const itemHover = !isTouch ? " hover:text-black hover:bg-yellow-500" : "";
    const dropdownItemBase = "text-sm text-left px-2 py-1 rounded w-full text-left";
    const dropdownItemHover = !isTouch ? " hover:bg-yellow-500/60" : "";
    const logoutHover = !isTouch ? " hover:bg-yellow-500" : "";

    return (
      <div className="flex flex-col h-full w-full">
        {/* 🔹 Logo Section */}
        <div className="p-4 border-b border-yellow-400/10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-base font-bold shadow-md">
            SP
          </div>
          <AnimatePresence>
            {(isExpanded || isMobile) && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="overflow-hidden"
              >
                <div className="text-lg font-semibold truncate">San Pablo Colleges</div>
                <div className="text-xs text-green-200 truncate">Student Affairs & Services Office</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 🔹 Menu Section */}
        <div className="flex-1 p-3 mt-3 overflow-y-auto">
          <nav className="flex flex-col space-y-2">

            {/* 🔹 Dashboard Dropdown */}
            <div>
              <button
                onClick={() => setOpenDashboard(!openDashboard)}
                className={`flex items-center gap-3 justify-between text-left px-3 py-2 rounded-lg w-full truncate transition-all${itemHover}`}
              >
                <div className="flex items-center gap-3">
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
                </div>
                {(isExpanded || isMobile) &&
                  (openDashboard ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
              </button>

              <AnimatePresence>
                {openDashboard && (isExpanded || isMobile) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="ml-10 mt-1 flex flex-col space-y-1"
                  >

                    <button
                      onClick={() => { setActivePanel("ExamScheduleAnalytics"); setIsMobileMenuOpen(false); }}
                      className={`${dropdownItemBase}${dropdownItemHover} flex items-center gap-2`}
                    >
                      <Clipboard size={16} />
                      Exam Schedule Analytics
                    </button>

                    <button
                      onClick={() => { setActivePanel("ExitAnalytics"); setIsMobileMenuOpen(false); }}
                      className={`${dropdownItemBase}${dropdownItemHover} flex items-center gap-2`}
                    >
                      <LogOut size={16} />
                      Exit Schedule Analytics
                    </button>

                    <button
                      onClick={() => { setActivePanel("ExamsAnalytics"); setIsMobileMenuOpen(false); }}
                      className={`${dropdownItemBase}${dropdownItemHover} flex items-center gap-2`}
                    >
                      <Clipboard size={16} />
                      Examination Analytics
                    </button>

                    {/* 🔹 Note: Add more Dashboard dropdown items below as needed */}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>


            {/* 🔹 Other menu items */}
            {menuItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (item.panel) setActivePanel(item.panel);
                  setIsMobileMenuOpen(false);
                }}
                className={`${itemBase}${itemHover}`}
              >
                {item.icon}
                <AnimatePresence>
                  {(isExpanded || isMobile) && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="truncate">
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            ))}

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
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="truncate">
                        Posting
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                {(isExpanded || isMobile) &&
                  (openDropdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
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
                      onClick={() => { setActivePanel("announcement"); setIsMobileMenuOpen(false); }}
                      className={`${dropdownItemBase}${dropdownItemHover} flex items-center gap-2`}
                    >
                      <Volume2 size={16} />
                      Announcement
                    </button>
                    <button
                      onClick={() => { setActivePanel("events"); setIsMobileMenuOpen(false); }}
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
              localStorage.removeItem("token");
              navigate("/admin/login");
            }}
            className={`w-full bg-emerald-900 px-4 py-2 rounded-lg text-white flex items-center gap-3 justify-center transition${logoutHover}`}
          >
            <CheckCircle size={18} />
            <AnimatePresence>
              {(isExpanded || isMobile) && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="truncate">
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
      <div className="md:hidden fixed top-0 left-0 w-full flex justify-between items-center bg-[rgb(6,73,26)] text-white z-50 h-14 px-4 shadow-md">
        <div className="flex items-center gap-3 truncate">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold shadow-sm">
            SP
          </div>
          <div className="text-lg font-semibold truncate">San Pablo Colleges</div>
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
        onMouseEnter={() => { if (!isTouch) setIsExpanded(true); }}
        onMouseLeave={() => { if (!isTouch) setIsExpanded(false); }}
        className="hidden md:flex bg-emerald-900/90 text-white flex-col h-screen fixed top-0 left-0 z-40 shadow-xl overflow-hidden"
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
            className="fixed top-0 left-0 w-72 h-full bg-[rgb(6,73,26)] text-white z-50 shadow-xl"
          >
            <SidebarContent isMobile={true} />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 🔹 Main Content */}
      <main className="flex-1 p-4 md:p-8 md:ml-20 overflow-auto w-full max-w-full mt-16 md:mt-0 transition">
        {activePanel === "Dashboard" && (
          <div className="relative w-full min-h-screen flex flex-col items-center justify-start text-center overflow-hidden pt-32 md:pt-40">
            {/* Hover overlay effect */}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all duration-300 pointer-events-none z-0" />

            {/* Logo and Titles */}
            <div className="relative z-10 flex flex-col items-center justify-center gap-8">
              <div className="flex items-center justify-center gap-12">
                <img
                  src={spcLogo}
                  alt="SPC Logo"
                  className="w-36 md:w-48 object-contain"
                />
                <img
                  src={sasoLogo}
                  alt="SASO Logo"
                  className="w-32 md:w-44 object-contain"
                />
              </div>

              <h1 className="text-6xl md:text-8xl font-extrabold text-[rgb(6,73,26)] tracking-tight hover:text-yellow-500 transition-colors duration-300">
                SAN PABLO COLLEGES
              </h1>

              <h2 className="text-3xl md:text-5xl font-semibold text-gray-700 hover:text-yellow-500 transition-colors duration-300">
                Student Affairs & Services Office
              </h2>

              <span className="mt-4 text-2xl md:text-3xl font-medium text-emerald-800 hover:text-yellow-500 transition-colors duration-300">
                Admin Dashboard
              </span>
            </div>
          </div>
        )}

        {activePanel === "staffs" && <StaffPanel />}
        {activePanel === "schedule" && <AdminSchedule />}
        {activePanel === "personnel" && <AdminPersonnel />}
        {activePanel === "announcement" && <AdminAnnouncement />}
        {activePanel === "events" && <EventPosting />}
        {activePanel === "exit" && <AdminExitSchedule />}
        {activePanel === "ExamCreate" && <ExamCreate />}
        {activePanel === "ExamList" && <ExamList />}
        {activePanel === "ExamScheduleAnalytics" && <ExamScheduleAnalytics />}
        {activePanel === "ExitAnalytics" && <ExitAnalytics />}
        {activePanel === "ExamsAnalytics" && <ExamsAnalytics />}
        {activePanel === "AdminReport" && <AdminReport />}

        

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
            <CheckCircle size={48} className="text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold truncate text-[rgb(6,73,26)]">Login Verified</h2>
            <p className="text-gray-600 mt-2">
              You are now logged in as authorized SASO Admin.
            </p>
            <button
              onClick={handleClosePopup}
              className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
            >
              OK
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
