import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  BarChart2,
  Users,
  FileText,
  Home,
  Activity,
  Clipboard,
  User,
  Menu,
  X,
  Bell,
  Moon,
  Sun,
} from "react-feather";
import { motion, AnimatePresence } from "framer-motion";
import StaffPanel from "../AdminContent/StaffPanel";
import AdminPersonnel from "../AdminContent/AdminPersonnel";
import AdminDepartment from "../AdminContent/AdminAnnouncement";
import DashboardContent from "../AdminContent/AdminDashboard"; // updated
import AdminSchedule from "../AdminContent/AdminSchedule";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [activePanel, setActivePanel] = useState(() => {
    return localStorage.getItem("activePanel") || "dashboard";
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
    }
    if (localStorage.getItem('showPopup') === 'true') {
      setShowPopup(true);
      localStorage.removeItem('showPopup');

      // 👉 reset panel sa dashboard kapag galing login
      setActivePanel("dashboard");
      localStorage.setItem("activePanel", "dashboard");
    }
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem("activePanel", activePanel);
  }, [activePanel]);

  // 🌙 Toggle dark mode
  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
    setDarkMode(!darkMode);
  };

  const handleClosePopup = () => setShowPopup(false);

  const menuItems = [
    { icon: <Home size={18} />, label: "Dashboard", panel: "dashboard" },
    { icon: <FileText size={18} />, label: "Admission Forms" },
    { icon: <BarChart2 size={18} />, label: "Reports" },
    { icon: <Clipboard size={18} />, label: "Schedule", panel: "schedule" },
    { icon: <Users size={18} />, label: "Personnel", panel: "personnel" },
    { icon: <User size={18} />, label: "Staffs", panel: "staffs" },
    {
      icon: <Activity size={18} />,
      label: "Announcement",
      panel: "departments",
    },
    { icon: <Bell size={18} />, label: "Notification", panel: "notification" },
    {
      icon: darkMode ? <Sun size={18} /> : <Moon size={18} />,
      label: "Dark Mode",
      action: toggleDarkMode,
    },
  ];

  const SidebarContent = ({ isMobile }) => (
    <div className="flex flex-col h-full w-full">
      <div className="p-4 border-b border-green-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold">
          SP
        </div>
        <AnimatePresence>
          {(isExpanded || isMobile) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="text-lg font-semibold truncate">
                San Pablo Colleges
              </div>
              <div className="text-xs text-green-200 truncate">
                {" "}
                Student Affairs & Services Office{" "}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 p-2 mt-2 overflow-y-auto">
        <nav className="flex flex-col space-y-2">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (item.panel) setActivePanel(item.panel);
                if (item.action) item.action();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 hover:text-green-200 text-left px-2 py-2 rounded-md hover:bg-green-800 w-full truncate"
            >
              {item.icon}
              <AnimatePresence>
                {(isExpanded || isMobile) && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-green-800">
        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/admin/login");
          }}
          className="w-full bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-white flex items-center gap-3 justify-center"
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

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden transition-colors duration-300">
      <div className="md:hidden fixed top-0 left-0 w-full flex justify-between items-center bg-[rgb(6,73,26)] text-white z-50 h-14 px-4">
        <div className="flex items-center gap-3 truncate">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold">
            SP
          </div>
          <div className="text-lg font-semibold truncate">
            San Pablo Colleges
          </div>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <motion.aside
        initial={{ width: 64 }}
        animate={{ width: isExpanded ? 256 : 64 }}
        transition={{ duration: 0.2 }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className="hidden md:flex bg-[rgb(6,73,26)] text-white flex-col h-screen fixed top-0 left-0 z-40 shadow-md overflow-hidden"
      >
        <SidebarContent isMobile={false} />
      </motion.aside>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-0 w-64 h-full bg-[rgb(6,73,26)] text-white z-50 shadow-md"
          >
            <SidebarContent isMobile={true} />
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 p-4 md:p-8 md:ml-16 overflow-auto w-full max-w-full mt-16 md:mt-0">
        {activePanel === "dashboard" && <DashboardContent />}

        {activePanel === "staffs" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <StaffPanel />
          </motion.div>
        )}

        {activePanel === "schedule" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <AdminSchedule />
          </motion.div>
        )}

        {activePanel === "personnel" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <AdminPersonnel />
          </motion.div>
        )}

        {activePanel === "departments" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <AdminDepartment />
          </motion.div>
        )}

        {activePanel === "notification" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6 rounded-xl shadow-lg transition-colors duration-300 bg-white dark:bg-gray-800 text-black dark:text-white">
              <h2 className="text-xl font-bold mb-4 text-[rgb(6,73,26)] dark:text-green-300">
                Notifications
              </h2>
              <p className="text-gray-700 dark:text-gray-200">
                No new notifications at the moment.
              </p>
            </div>
          </motion.div>
        )}
      </main>

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl shadow-lg p-6 md:p-8 max-w-md w-full text-center bg-white dark:bg-gray-800 text-black dark:text-white"
          >
            <CheckCircle
              size={48}
              className="text-green-600 dark:text-green-300 mx-auto mb-4"
            />
            <h2 className="text-xl font-bold truncate text-[rgb(6,73,26)] dark:text-green-300">
              Login Verified
            </h2>
            <p className="text-gray-600 dark:text-gray-200 mt-2">
              You are now logged in as authorized SASO Admin.
            </p>
            <button
              onClick={handleClosePopup}
              className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition"
            >
              OK
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
