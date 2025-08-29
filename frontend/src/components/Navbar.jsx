import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ChevronRight,
  Shield,
  Users,
  Leaf,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import spcLogo from "/src/images/SPC.png";
import sasoLogo from "/src/images/SASO.png";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const lastScroll = useRef(0);

  const menuRef = useRef(null);
  const loginDropdownRef = useRef(null);

  const adminToken = localStorage.getItem("token");
  const staffToken = localStorage.getItem("staffToken");

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

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setShowNavbar(currentScroll < lastScroll.current || currentScroll < 50);
      lastScroll.current = currentScroll;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Admissions", path: "/admissions" },
    { name: "Announcement", path: "/announcement" },
    { name: "Exit Schedule", path: "/Exit" },
    { name: "Personnel", path: "/personnel" },
  ];

  const isLoggedIn = adminToken || staffToken;

  return (
    <>
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: showNavbar ? 0 : -120 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="fixed top-0 left-0 w-full z-50 bg-white shadow-md"
        style={{ paddingTop: "0.75rem", paddingBottom: "0.75rem" }}
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          {/* Logo Section */}
          <div
            className="flex items-center gap-2 cursor-pointer min-w-0"
            onClick={() => navigate("/")}
          >
            <img
              src={spcLogo}
              alt="SPC"
              className="h-10 w-10 object-contain flex-shrink-0"
              style={{ background: "transparent" }}
            />
            <img
              src={sasoLogo}
              alt="SASO"
              className="h-10 w-10 object-contain flex-shrink-0"
              style={{ background: "transparent" }}
            />
            <div className="flex flex-col leading-tight min-w-0">
              <h1 className="font-bold text-sm sm:text-base md:text-lg truncate text-gray-900">
                San Pablo Colleges
              </h1>
              <p className="text-gray-700 text-xs sm:text-sm truncate">
                Student Affairs and Services Office
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          {!isLoggedIn && (
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
                        ? "text-yellow-600 font-semibold"
                        : "text-gray-900 hover:text-yellow-500"
                    }`}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}

              {/* Login Dropdown */}
              <div className="relative" ref={loginDropdownRef}>
                <button
                  onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
                  className="px-4 py-2 bg-green-900/10 text-black rounded-md font-medium hover:bg-yellow-500 transition flex items-center gap-1"
                >
                  Login ▾
                </button>
                <AnimatePresence>
                  {loginDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-40 bg-white text-gray-900 rounded-xl shadow-lg z-20 overflow-hidden"
                    >
                      <Link
                        to="/admin/login"
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={() => setLoginDropdownOpen(false)}
                      >
                        Admin
                      </Link>
                      <Link
                        to="/staff/login"
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={() => setLoginDropdownOpen(false)}
                      >
                        Staff
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>
          )}

          {/* Mobile Burger */}
          {!isLoggedIn && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-green-100 transition ml-auto"
            >
              {menuOpen ? (
                <X size={28} className="text-black hover:text-gray-600 transition" />
              ) : (
                <Menu size={28} className="text-black hover:text-gray-600 transition" />
              )}
            </button>
          )}
        </div>

        {/* Mobile Nav Overlay */}
        {!isLoggedIn && (
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                ref={menuRef}
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="fixed top-0 right-0 w-full sm:w-3/4 md:w-1/2 h-screen 
                   bg-gradient-to-br from-green-900 via-emerald-800 to-green-700 
                   text-yellow-200 flex flex-col justify-between z-40 shadow-2xl"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-green-700">
                  <h2 className="text-xl font-bold text-yellow-300 tracking-wide flex items-center gap-2">
                    <Leaf className="w-5 h-5" /> Navigation
                  </h2>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="text-yellow-300 hover:text-yellow-400 transition"
                  >
                    <X className="w-7 h-7" />
                  </button>
                </div>

                {/* Nav Links */}
                <motion.div
                  initial="hidden"
                  animate="show"
                  variants={{
                    show: { transition: { staggerChildren: 0.15 } },
                  }}
                  className="flex flex-col items-center space-y-6 mt-10"
                >
                  {navLinks.map((link) => (
                    <motion.div
                      key={link.name}
                      variants={{
                        hidden: { opacity: 0, x: 30 },
                        show: { opacity: 1, x: 0 },
                      }}
                    >
                      <Link
                        to={link.path}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 text-2xl font-medium tracking-wide 
                           hover:text-yellow-400 hover:translate-x-2 
                           transition-all duration-300"
                      >
                        <ChevronRight className="w-6 h-6" /> {link.name}
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Footer Login Buttons */}
                <div className="flex flex-col space-y-4 px-6 pb-8">
                  <Link
                    to="/admin/login"
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 text-lg font-semibold 
                       bg-gradient-to-r from-yellow-400 to-yellow-500 text-green-900 
                       px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition"
                  >
                    <Shield className="w-5 h-5" /> Admin Login
                  </Link>

                  <Link
                    to="/staff/login"
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 text-lg font-semibold 
                       bg-gradient-to-r from-yellow-400 to-yellow-500 text-green-900 
                       px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition"
                  >
                    <Users className="w-5 h-5" /> Staff Login
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.header>

      {/* Padding for content */}
      <div style={{ height: "70px" }}></div>
    </>
  );
}
