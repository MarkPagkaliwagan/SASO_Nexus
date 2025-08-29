import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaKey,
  FaEnvelope,
  FaInfoCircle,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import spcLogo from "../images/SPC.png";
import sasoLogo from "/src/images/SASO.png";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showBranding, setShowBranding] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && role === "admin") navigate("/admin/dashboard");
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await api.post("/admin/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("admin", JSON.stringify(res.data.admin));
      localStorage.setItem("role", "admin");
      localStorage.setItem("showPopup", "true");
      navigate("/admin/dashboard");
    } catch (err) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.post("/admin/forgot-password", { email: forgotEmail });
      setMessage("Reset token sent to your email.");
    } catch (err) {
      setError("Failed to send reset token.");
    }
  };

  const floatingShapes = [
    { size: 80, top: "10%", left: "5%", color: "rgba(34,197,94,0.4)" },
    { size: 100, top: "30%", left: "70%", color: "rgba(34,197,94,0.3)" },
    { size: 60, top: "70%", left: "20%", color: "rgba(34,197,94,0.35)" },
  ];

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 bg-black overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: "url('/src/images/Campus.png')" }}
      />
      <div className="absolute inset-0 bg-black/70 z-0"></div>

      {/* Floating Shapes */}
      {floatingShapes.map((shape, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full filter blur-2xl"
          style={{
            width: shape.size,
            height: shape.size,
            top: shape.top,
            left: shape.left,
            backgroundColor: shape.color,
          }}
          animate={{ y: [0, 20, 0], x: [0, 15, 0] }}
          transition={{ duration: 6, repeat: Infinity, repeatType: "mirror" }}
        />
      ))}

      {/* MAIN CARD */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, type: "spring", stiffness: 100 }}
        className="relative z-10 flex flex-col md:flex-row w-full max-w-6xl bg-white/20 rounded-3xl shadow-2xl border border-white/30 overflow-hidden hover:scale-[1.01] transition-transform duration-500"
      >
        {/* LEFT PANEL (Branding Hover for Desktop) */}
        <motion.div
          onMouseEnter={() => setShowBranding(true)}
          onMouseLeave={() => setShowBranding(false)}
          animate={{ width: showBranding ? "50%" : "5%" }}
          transition={{ duration: 0.5 }}
          className="relative flex flex-col justify-center items-center bg-gradient-to-b from-green-700/60 to-green-900/60 text-white overflow-hidden 
            md:w-[5%] md:hover:w-[50%] w-full"
        >
          {/* Indicator Icon */}
          {!showBranding && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-white/70 hidden md:block"
            >
              <FaInfoCircle className="text-2xl animate-pulse" />
            </motion.div>
          )}

          {/* Branding Content for Desktop */}
          {showBranding && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="p-6 md:p-10 text-center space-y-6 max-w-md hidden md:block"
            >
              <div className="flex items-center justify-center space-x-6">
                <motion.img
                  src={spcLogo}
                  alt="SPC Logo"
                  className="h-28 w-auto drop-shadow-xl"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                />
                <motion.img
                  src={sasoLogo}
                  alt="SASO Logo"
                  className="h-20 w-auto drop-shadow-xl"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                />
              </div>
              <h2 className="text-4xl font-extrabold">SASO Nexus</h2>
              <p className="text-lg font-semibold opacity-90">
                Student Affairs & Services Office
              </p>
              <p className="text-sm leading-relaxed opacity-80">
                Welcome to the Admin Portal of SASO Nexus. Here you can access
                student services, manage important records, and oversee campus
                activities with ease. Our system is designed to provide seamless
                tools for admin staff, ensuring efficiency, transparency, and
                better student engagement. Hover anytime to review guidelines,
                updates, and key notes about managing your dashboard.
              </p>
            </motion.div>
          )}
        </motion.div>

{/* RIGHT PANEL (Mobile + Desktop Form) */}
<div className="flex-1 w-full">

  {/* Branding Content for Mobile */}
  <div className="md:hidden bg-green-800/30 backdrop-blur-md rounded-t-2xl shadow-md p-6 text-center space-y-4">
    <div className="flex items-center justify-center space-x-6">
      <img
        src={spcLogo}
        alt="SPC Logo"
        className="h-16 w-auto drop-shadow-xl"
      />
      <img
        src={sasoLogo}
        alt="SASO Logo"
        className="h-14 w-auto drop-shadow-xl"
      />
    </div>
    <h2 className="text-2xl font-extrabold">SASO Nexus</h2>
    <p className="text-sm font-medium opacity-90">
      Student Affairs & Services Office
    </p>
    <p className="text-xs leading-relaxed opacity-80">
      Welcome to the Admin Portal. Access student services and manage campus
      activities anytime, anywhere.
    </p>
  </div>

  {/* Login Section */}
  <div className="bg-white/90 backdrop-blur-md rounded-b-2xl shadow-md p-6 sm:p-8 md:p-14">
    <AnimatePresence mode="wait">
      {!showForgot ? (
        <motion.div
          key="login"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.4 }}
        >
          <h3 className="text-3xl font-bold text-green-400 mb-3">
            Admin Login
          </h3>
          <p className="text-sm text-gray-700 mb-6">
            Sign in to your dashboard
          </p>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {message && (
            <p className="text-green-600 text-sm mb-4">{message}</p>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block font-semibold mb-2 text-gray-700"
              >
                Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-4 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-300 bg-white shadow-inner text-gray-900"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block font-semibold mb-2 text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <FaKey className="absolute left-4 top-4 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 rounded-2xl border border-gray-300 bg-white shadow-inner text-gray-900"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-gray-600 hover:text-gray-900"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="text-sm text-green-600 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              className={`w-full bg-gradient-to-r from-green-400 to-green-600 text-white font-bold py-3 px-6 rounded-2xl shadow-xl ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Loading..." : "Login"}
            </motion.button>
          </form>
        </motion.div>
      ) : (
        <motion.div
          key="forgot"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center mb-8">
            <FaKey className="text-green-400 text-5xl mx-auto mb-3" />
            <h2 className="text-3xl font-bold text-green-400">
              Forgot Password
            </h2>
            <p className="text-sm text-gray-600">
              Enter your email to reset your password.
            </p>
          </div>

          <form onSubmit={handleForgotPassword} className="space-y-6">
            <input
              id="forgotEmail"
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-gray-300 bg-white text-gray-900"
              required
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {message && <p className="text-green-600 text-sm">{message}</p>}

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setShowForgot(false)}
                className="text-sm text-gray-600 hover:underline"
              >
                Back to Login
              </button>
              <motion.button
                type="submit"
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-r from-green-400 to-green-600 text-white font-bold py-3 px-6 rounded-2xl shadow-xl"
              >
                Send Reset
              </motion.button>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
</div>

      </motion.div>
    </div>
  );
}
