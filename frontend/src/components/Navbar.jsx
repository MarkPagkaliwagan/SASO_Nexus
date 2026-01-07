import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Shield,
  Users,
  Leaf,
  Sun,
  Moon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import spcLogo from "/src/images/SPC.png";
import sasoLogo from "/src/images/SASO.png";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const lastScroll = useRef(0);
  const menuRef = useRef(null);
  const loginDropdownRef = useRef(null);
  const servicesDropdownRef = useRef(null);

  const adminToken = localStorage.getItem("token");
  const staffToken = localStorage.getItem("staffToken");
  const isLoggedIn = adminToken || staffToken;

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

  // close menus when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (
        loginDropdownRef.current &&
        !loginDropdownRef.current.contains(e.target)
      ) {
        setLoginDropdownOpen(false);
      }
      if (
        servicesDropdownRef.current &&
        !servicesDropdownRef.current.contains(e.target)
      ) {
        setServicesDropdownOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";
  }, [menuOpen]);

  // hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setShowNavbar(currentScroll < lastScroll.current || currentScroll < 60);
      lastScroll.current = currentScroll;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // close menus on navigation
  useEffect(() => {
    setMenuOpen(false);
    setLoginDropdownOpen(false);
    setServicesDropdownOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Admissions", path: "/admissions" },
    { name: "Announcement", path: "/announcement" },
    { name: "Exit Schedule", path: "/Exit" },
    { name: "Personnel", path: "/personnel" },
  ];

  const services = [
    { name: "Guidance Office", path: "/services/guidance" },
    { name: "Student Formation and Development Unit (SFDU)", path: "/services/sfdu" },
    { name: "School Clinic", path: "/services/clinic" },
    { name: "Campus Ministry", path: "/services/ministry" },
    { name: "Sports Development Unit", path: "/services/sports" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: showNavbar ? 0 : -140 }}
        transition={{ type: "spring", stiffness: 140, damping: 22 }}
        className="fixed top-0 left-0 w-full z-50"
      >
        <div className="backdrop-blur-sm bg-white/60 dark:bg-slate-900/50 border-b border-slate-200/30 dark:border-slate-700/40">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 lg:py-4 flex items-center gap-4 justify-between">
            {/* Logo / Brand */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-3 min-w-0 group focus:outline-none"
              aria-label="Go home"
            >
              <div className="flex-shrink-0 flex items-center gap-2">
                <img src={spcLogo} alt="SPC" className="h-10 w-10 object-contain" />
                <img src={sasoLogo} alt="SASO" className="h-10 w-10 object-contain" />
              </div>

              <div className="text-left min-w-0">
                <h1 className="font-semibold text-sm sm:text-base md:text-lg truncate text-slate-900 dark:text-slate-100 group-hover:opacity-90">
                  San Pablo Colleges
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 truncate">
                  Student Affairs and Services Office
                </p>
              </div>
            </button>

            {/* Desktop nav */}
            {!isLoggedIn && (
              <nav className="hidden lg:flex items-center gap-6 flex-1 justify-center">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`group relative px-2 py-1 transition-transform transform hover:-translate-y-0.5 inline-flex items-center ${
                      isActive(link.path)
                        ? "text-amber-500 font-semibold"
                        : "text-slate-800 dark:text-slate-100/90"
                    }`}
                  >
                    <span className="relative z-10">{link.name}</span>
                    <span
                      className={`absolute left-0 -bottom-1 h-0.5 rounded-full bg-amber-400 transition-all duration-250 transform origin-left ${
                        isActive(link.path) ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                    />
                  </Link>
                ))}

                {/* Services Dropdown */}
                <div className="relative" ref={servicesDropdownRef}>
                  <button
                    onClick={() => setServicesDropdownOpen((s) => !s)}
                    className="group relative px-2 py-1 inline-flex items-center gap-1 text-slate-800 dark:text-slate-100/90 hover:-translate-y-0.5 transition"
                  >
                    <span>Services</span>
                    <ChevronDown size={16} />
                  </button>

                  <AnimatePresence>
                    {servicesDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18 }}
                        className="absolute left-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200/40 z-30"
                      >
                        <ul className="py-2">
                          {services.map((service) => (
                            <li key={service.name}>
                              <Link
                                to={service.path}
                                onClick={() => setServicesDropdownOpen(false)}
                                className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                              >
                                {service.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </nav>
            )}

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* dark mode */}
              <button
                onClick={toggleDarkMode}
                aria-pressed={darkMode}
                className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Toggle dark mode"
              >
                {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
              </button>

              {/* Login Dropdown */}
              {!isLoggedIn && (
                <div className="relative" ref={loginDropdownRef}>
                  <button
                    onClick={() => setLoginDropdownOpen((s) => !s)}
                    aria-haspopup="true"
                    aria-expanded={loginDropdownOpen}
                    className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-400 text-slate-900 font-medium shadow-md hover:scale-105 transition"
                  >
                    Login ▾
                  </button>

                  <AnimatePresence>
                    {loginDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 mt-3 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200/40 overflow-hidden z-30"
                      >
                        <div className="p-3">
                          <p className="text-xs text-slate-500 dark:text-slate-300 mb-2">Choose login type</p>
                          <Link
                            to="/admin/login"
                            onClick={() => setLoginDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                          >
                            <Shield className="w-4 h-4 text-amber-400" />
                            <div>
                              <div className="text-sm font-medium text-slate-800 dark:text-slate-100">Admin</div>
                              <div className="text-xs text-slate-500 dark:text-slate-300">Manage site, announcements</div>
                            </div>
                          </Link>

                          <Link
                            to="/staff/login"
                            onClick={() => setLoginDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-md mt-1 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                          >
                            <Users className="w-4 h-4 text-emerald-400" />
                            <div>
                              <div className="text-sm font-medium text-slate-800 dark:text-slate-100">Staff</div>
                              <div className="text-xs text-slate-500 dark:text-slate-300">Access student & schedule tools</div>
                            </div>
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* mobile burger */}
              {!isLoggedIn && (
<button
  onClick={() => setMenuOpen((s) => !s)}
className="lg:hidden p-2 rounded-md text-slate-800 dark:text-slate-100 hover:bg-slate-200/40 dark:hover:bg-slate-700/40 transition-colors duration-200"
  aria-label="Toggle menu"
>
  {menuOpen ? <X size={22} /> : <Menu size={22} />}
</button>

              )}
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {menuOpen && !isLoggedIn && (
            <motion.div
              ref={menuRef}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 220, damping: 28 }}
              className="fixed inset-0 z-40 pointer-events-auto"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.45 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40"
                onClick={() => setMenuOpen(false)}
              />

              <div className="absolute right-0 top-0 h-full w-full sm:w-96 md:w-1/2 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-emerald-900/95 text-amber-100 shadow-2xl backdrop-blur-lg">
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700/30">
                  <div className="flex items-center gap-3">
                    <Leaf className="w-5 h-5 text-amber-300" />
                    <h3 className="text-lg font-semibold tracking-wide">Navigation</h3>
                  </div>
                  <button onClick={() => setMenuOpen(false)} className="p-2 rounded-md hover:bg-white/5 transition">
                    <X />
                  </button>
                </div>

                <motion.nav
                  initial="hidden"
                  animate="show"
                  variants={{ show: { transition: { staggerChildren: 0.08 } } }}
                  className="px-6 py-8 flex flex-col gap-6"
                >
                  {navLinks.map((link) => (
                    <motion.div
                      key={link.name}
                      variants={{ hidden: { opacity: 0, x: 32 }, show: { opacity: 1, x: 0 } }}
                    >
                      <Link
                        to={link.path}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-4 text-2xl font-medium hover:translate-x-2 transform transition"
                      >
                        <ChevronRight className="w-6 h-6" /> {link.name}
                      </Link>
                    </motion.div>
                  ))}

                  {/* Services section for mobile */}
                  <div className="mt-4">
                    <h4 className="text-xl font-semibold mb-2 text-amber-300">Services</h4>
                    <ul className="flex flex-col gap-2">
                      {services.map((s) => (
                        <li key={s.name}>
                          <Link
                            to={s.path}
                            onClick={() => setMenuOpen(false)}
                            className="block pl-8 text-lg hover:text-amber-400 transition"
                          >
                            {s.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.nav>

                <div className="px-6 pb-10 flex flex-col gap-3">
                  <Link
                    to="/admin/login"
                    onClick={() => setMenuOpen(false)}
                    className="w-full inline-flex items-center justify-center gap-3 py-3 rounded-xl bg-amber-400 text-slate-900 font-semibold shadow hover:scale-105 transform transition"
                  >
                    <Shield className="w-5 h-5" /> Admin Login
                  </Link>

                  <Link
                    to="/staff/login"
                    onClick={() => setMenuOpen(false)}
                    className="w-full inline-flex items-center justify-center gap-3 py-3 rounded-xl bg-emerald-500 text-slate-900 font-semibold shadow hover:scale-105 transform transition"
                  >
                    <Users className="w-5 h-5" /> Staff Login
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
