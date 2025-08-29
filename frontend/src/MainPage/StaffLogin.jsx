import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserTie, FaKey, FaEnvelope, FaEye, FaEyeSlash, FaInfoCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import spcLogo from '../images/SPC.png';
import sasoLogo from '../images/SASO.png';

export default function StaffLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showBranding, setShowBranding] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('staffToken');
    const role = localStorage.getItem('role');
    if (token && role === 'staff') {
      navigate('/staff-dashboard', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await api.post('/staff/login', { email, password });
      localStorage.setItem('staffToken', res.data.token);
      localStorage.setItem('staff', JSON.stringify(res.data.staff));
      localStorage.setItem('staffId', res.data.staff.id);
      localStorage.setItem('role', 'staff');
      localStorage.setItem('showPopup', 'true');
      navigate('/staff-dashboard');
    } catch (err) {
      setError('Invalid email or password.');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await api.post('/staff/forgot-password', { email: forgotEmail });
      setMessage('Reset token sent to your email.');
    } catch (err) {
      setError('Failed to send reset token.');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 bg-black overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: "url('/src/images/Campus.png')" }}
      />
      <div className="absolute inset-0 bg-black/70 z-0"></div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="relative z-10 flex w-full max-w-5xl bg-white/20 rounded-3xl shadow-2xl border border-white/30 overflow-hidden"
      >
        {/* LEFT PANEL (Branding Hover) */}
        <motion.div
          onMouseEnter={() => setShowBranding(true)}
          onMouseLeave={() => setShowBranding(false)}
          animate={{ width: showBranding ? '45%' : '6%' }}
          transition={{ duration: 0.5 }}
          className="relative flex flex-col justify-center items-center bg-gradient-to-b from-yellow-300/60 to-yellow-300/70 text-white overflow-hidden"
        >
          {/* Indicator icon */}
          {!showBranding && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-white/70"
            >
              <FaInfoCircle className="text-2xl animate-pulse" />
            </motion.div>
          )}

          {/* Branding Content */}
          {showBranding && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="p-10 text-center space-y-6 max-w-md"
            >
              <div className="flex items-center justify-center space-x-6">
                <img src={spcLogo} alt="SPC Logo" className="h-24 w-auto drop-shadow-xl" />
                <img src={sasoLogo} alt="SASO Logo" className="h-16 w-auto drop-shadow-xl" />
              </div>
              <h2 className="text-3xl font-extrabold">SASO Nexus</h2>
              <p className="text-lg font-medium opacity-90">Student Affairs & Services Office</p>
              <p className="text-sm leading-relaxed opacity-80">
                Welcome to the Staff Portal of SASO Nexus. Here you’ll be able to manage 
                your tasks, collaborate with other staff, and access important student 
                records. This system ensures better organization, faster communication, 
                and a smoother workflow for all staff members.
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* RIGHT PANEL (Form) */}
        <div className="flex-1 p-10 md:p-14 bg-white/10 backdrop-blur-lg">
          <AnimatePresence mode="wait">
            {!showForgot ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-3xl font-bold text-green-400 mb-3">Staff Login</h3>
                <p className="text-sm text-gray-200 mb-6">Sign in to your staff dashboard</p>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                {message && <p className="text-green-300 text-sm mb-4">{message}</p>}

                <form onSubmit={handleLogin} className="space-y-6">
                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block font-semibold mb-2 text-white/90">Email</label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-4 top-4 text-gray-300" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-400 bg-white/40 text-gray-900 shadow-inner"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block font-semibold mb-2 text-white/90">Password</label>
                    <div className="relative">
                      <FaKey className="absolute left-4 top-4 text-gray-300" />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-3 rounded-2xl border border-gray-400 bg-white/40 text-gray-900 shadow-inner"
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

                  {/* Forgot Password */}
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setShowForgot(true)}
                      className="text-sm text-green-200 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Login Button */}
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.05 }}
                    className="w-full bg-gradient-to-r from-green-400 to-green-600 text-white font-bold py-3 px-6 rounded-2xl shadow-xl"
                  >
                    Login
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <FaKey className="text-green-400 text-5xl mx-auto mb-3" />
                  <h2 className="text-3xl font-bold text-green-400">Forgot Password</h2>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-6">
                  <input
                    id="forgotEmail"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-400 bg-white/40 text-gray-900"
                    required
                  />
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  {message && <p className="text-green-300 text-sm">{message}</p>}

                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setShowForgot(false)}
                      className="text-sm text-gray-200 hover:underline"
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
      </motion.div>
    </div>
  );
}
