import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserTie, FaKey, FaEnvelope } from 'react-icons/fa';
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
    <div className="min-h-screen flex items-center justify-center px-4 ">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row bg-white rounded-3xl shadow-xl border border-gray-200 w-full max-w-5xl overflow-hidden"
      >
        {/* Left Panel - Branding */}
        <div className="md:w-1/2 bg-green-900 text-white flex flex-col justify-center items-center p-12 space-y-6 text-center">
          <div className="flex items-center space-x-6">
            <img src={spcLogo} alt="SPC Logo" className="h-32 w-auto" />
            <img src={sasoLogo} alt="SASO Logo" className="h-16 w-auto opacity-90" />
          </div>
          <h2 className="text-5xl font-extrabold tracking-tight select-none">SASO Nexus</h2>
          <p className="text-xl font-semibold opacity-90 select-none">
            Student Affairs & Services Office
          </p>
        </div>

        {/* Right Panel - Form */}
        <div className="md:w-1/2 p-12">
          <AnimatePresence mode="wait">
            {!showForgot ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-3xl font-bold text-green-900 mb-4 select-none">Staff Login</h3>
                <p className="text-sm text-gray-600 mb-6 select-none">Sign in to your staff dashboard</p>
                {error && <p className="text-red-600 text-sm mb-4 font-medium">{error}</p>}
                {message && <p className="text-green-700 text-sm mb-4 font-medium">{message}</p>}

                <form onSubmit={handleLogin} className="space-y-6 text-base">
                  <div>
                    <label htmlFor="email" className="block font-semibold mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-4 top-4 text-gray-400 text-lg pointer-events-none" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl 
                          focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500
                          hover:border-green-400 transition-all duration-300 ease-in-out
                          text-gray-900 font-medium"
                        required
                        autoComplete="username"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block font-semibold mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <FaKey className="absolute left-4 top-4 text-gray-400 text-lg pointer-events-none" />
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl 
                          focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500
                          hover:border-green-400 transition-all duration-300 ease-in-out
                          text-gray-900 font-medium"
                        required
                        autoComplete="current-password"
                      />
                    </div>
                  </div>

                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setShowForgot(true)}
                      className="text-sm text-green-700 font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-green-400"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-green-700 hover:bg-green-800 active:bg-green-900 
                      text-white font-extrabold py-3 px-6 rounded-xl shadow-md 
                      transition-all duration-300 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-green-300"
                  >
                    Login
                  </button>
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
                <div className="text-center mb-8 select-none">
                  <FaKey className="text-green-700 text-5xl mx-auto mb-3" />
                  <h2 className="text-3xl font-bold text-green-900">Forgot Password</h2>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-6 text-base">
                  <div>
                    <label htmlFor="forgotEmail" className="block font-semibold mb-2">
                      Email Address
                    </label>
                    <input
                      id="forgotEmail"
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl 
                        focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500
                        hover:border-green-400 transition-all duration-300 ease-in-out
                        text-gray-900 font-medium"
                      required
                      autoComplete="email"
                    />
                  </div>

                  {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
                  {message && <p className="text-green-700 text-sm font-medium">{message}</p>}

                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setShowForgot(false)}
                      className="text-sm text-gray-700 font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-gray-400"
                    >
                      Back to Login
                    </button>
                    <button
                      type="submit"
                      className="bg-green-700 hover:bg-green-800 active:bg-green-900 
                        text-white font-extrabold py-3 px-6 rounded-xl shadow-md 
                        transition-all duration-300 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-green-300"
                    >
                      Send Reset
                    </button>
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
