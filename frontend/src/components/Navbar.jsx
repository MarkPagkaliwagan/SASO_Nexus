import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import spcLogo from "/src/images/SPC.png";
import sasoLogo from "/src/images/SASO.png";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const menuRef = useRef(null);
  const loginDropdownRef = useRef(null);

  const adminToken = localStorage.getItem("token");
  const staffToken = localStorage.getItem("staffToken");
  const admin = localStorage.getItem("admin");
  const staff = localStorage.getItem("staff");

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedMode);
    document.documentElement.classList.toggle("dark", savedMode);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      document.documentElement.classList.toggle("dark", !prev);
      localStorage.setItem("darkMode", !prev);
      return !prev;
    });
  };

  useEffect(() => {
    const handler = (e) => {
      if (
        loginDropdownRef.current &&
        !loginDropdownRef.current.contains(e.target)
      ) {
        setLoginDropdownOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";
  }, [menuOpen]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Admissions", path: "/admissions" },
    { name: "Units | Announcement", path: "/departments" },
    { name: "Personnel", path: "/personnel" },
    { name: "Contact", path: "/contact" },
  ];

  const onAdminPage = location.pathname.startsWith("/admin");
  const onStaffPage = location.pathname.startsWith("/staff");

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-green-900/90 text-white shadow-md"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo Section */}
        <div
          className="flex items-center gap-2 cursor-pointer min-w-0"
          onClick={() => navigate("/")}
        >
          <img
            src={spcLogo}
            alt="SPC"
            className="h-10 w-10 rounded-lg shadow-md object-contain flex-shrink-0"
          />
          <img
            src={sasoLogo}
            alt="SASO"
            className="h-10 w-10 rounded-lg shadow-md object-contain flex-shrink-0"
          />
          <div className="flex flex-col leading-tight min-w-0">
            <h1 className="font-bold text-sm sm:text-base md:text-lg truncate">
              San Pablo Colleges
            </h1>
            <p className="text-gray-200 text-xs sm:text-sm truncate">
              Student Affairs and Services Office
            </p>
          </div>
        </div>

        {/* Desktop Nav (show only on large screens) */}
        <nav className="hidden lg:flex items-center gap-6 flex-shrink">
          {navLinks.map((link) => (
            <motion.div
              key={link.name}
              className="relative"
              whileHover={{ scale: 1.05 }}
            >
              <Link
                to={link.path}
                className={`transition-colors px-2 py-1 ${
                  isActive(link.path)
                    ? "text-yellow-400 font-semibold"
                    : "hover:text-yellow-300"
                }`}
              >
                {link.name}
              </Link>
              {isActive(link.path) && (
                <motion.div
                  layoutId="active-underline"
                  className="absolute bottom-0 left-0 w-full h-[2px] bg-yellow-400 rounded"
                />
              )}
            </motion.div>
          ))}

          {/* Admin/Staff/Login */}
          <div className="flex items-center gap-3 relative">
            {!adminToken && !staffToken && (
              <div className="relative" ref={loginDropdownRef}>
                <button
                  onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
                  className="px-4 py-2 bg-yellow-400 text-green-900 rounded-full font-medium hover:bg-yellow-300 transition"
                >
                  Login ▾
                </button>
                <AnimatePresence>
                  {loginDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-40 bg-white text-green-900 rounded-xl shadow-lg z-20 overflow-hidden"
                    >
                      <Link
                        to="/admin/login"
                        className="block px-4 py-2 hover:bg-yellow-100"
                        onClick={() => setLoginDropdownOpen(false)}
                      >
                        Admin
                      </Link>
                      <Link
                        to="/staff/login"
                        className="block px-4 py-2 hover:bg-yellow-100"
                        onClick={() => setLoginDropdownOpen(false)}
                      >
                        Staff
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {adminToken && admin && onAdminPage && (
              <>
                <Link
                  to="/admin/dashboard"
                  className="px-4 py-2 bg-green-700 rounded-full hover:bg-green-600 transition"
                >
                  Admin
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 rounded-full hover:bg-red-500 transition"
                >
                  Logout
                </button>
              </>
            )}

            {staffToken && staff && !admin && onStaffPage && (
              <>
                <Link
                  to="/staff-dashboard"
                  className="px-4 py-2 bg-green-700 rounded-full hover:bg-green-600 transition"
                >
                  Staff
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 rounded-full hover:bg-red-500 transition"
                >
                  Logout
                </button>
              </>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="ml-2 flex items-center justify-center p-2 rounded-full hover:bg-yellow-400 hover:text-black transition"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </nav>

        {/* Burger Menu (show when lg:hidden) */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden z-20 p-2 rounded hover:bg-green-800 transition ml-auto"
          aria-label="Toggle Menu"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="fixed top-0 right-0 w-full sm:w-3/4 md:w-1/2 h-screen bg-green-950/95 text-white flex flex-col items-center justify-center space-y-6 z-40 p-6"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className={`text-2xl sm:text-3xl font-medium transition-colors ${
                  isActive(link.path)
                    ? "text-yellow-400"
                    : "hover:text-yellow-300"
                }`}
              >
                {link.name}
              </Link>
            ))}

            {!adminToken && !staffToken && (
              <div className="flex flex-col space-y-3 w-full items-center">
                <Link
                  to="/admin/login"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-center text-lg bg-yellow-400 text-green-900 px-6 py-2 rounded-full hover:bg-yellow-300 transition"
                >
                  Admin Login
                </Link>
                <Link
                  to="/staff/login"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-center text-lg bg-yellow-400 text-green-900 px-6 py-2 rounded-full hover:bg-yellow-300 transition"
                >
                  Staff Login
                </Link>
              </div>
            )}

            {adminToken && admin && onAdminPage && (
              <div className="flex flex-col space-y-3 w-full items-center">
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-center text-lg bg-green-700 px-6 py-2 rounded-full hover:bg-green-600 transition"
                >
                  Admin
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-center text-lg bg-red-600 px-6 py-2 rounded-full hover:bg-red-500 transition"
                >
                  Logout
                </button>
              </div>
            )}

            {staffToken && staff && !admin && onStaffPage && (
              <div className="flex flex-col space-y-3 w-full items-center">
                <Link
                  to="/staff-dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-center text-lg bg-green-700 px-6 py-2 rounded-full hover:bg-green-600 transition"
                >
                  Staff
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-center text-lg bg-red-600 px-6 py-2 rounded-full hover:bg-red-500 transition"
                >
                  Logout
                </button>
              </div>
            )}

            {/* Dark Mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="mt-4 flex items-center justify-center px-6 py-2 rounded-full bg-yellow-400 text-green-900 hover:bg-yellow-300 w-full text-center transition"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              <span className="ml-2 text-lg">
                {darkMode ? "Light Mode" : "Dark Mode"}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
