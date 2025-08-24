import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaLock, FaEnvelope } from 'react-icons/fa';
import { motion } from 'framer-motion';
import api from '../services/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [userType, setUserType] = useState('admin'); // 'admin' or 'staff'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      await api.post(`/${userType}/reset-password`, {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      setMessage('Password reset successful. Redirecting...');
      setTimeout(() => navigate(`/${userType}/login`), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    }
  };

  return (
    <div className="min-h-screen flex px-4 pt-20">
      {/* Left panel - Form */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 max-w-md shadow-xl rounded-lg p-8"
        style={{ backgroundColor: 'transparent' }}
      >
        <div className="text-center mb-6">
          <FaLock className="text-green-600 text-4xl mx-auto" />
          <h2 className="text-3xl font-extrabold text-green-700 mt-2">Reset Password</h2>
        </div>

        {/* Role selector */}
        <div className="mb-6 text-center">
          <label className="font-semibold mr-4">Select Role:</label>
          <select
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
            className="border rounded px-3 py-1 focus:outline-none focus:ring focus:ring-green-300"
          >
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
          </select>
        </div>

        {message && <p className="text-green-600 text-sm mb-3">{message}</p>}
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className="w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-transform duration-300 ease-in-out transform hover:scale-105"
          >
            Reset Password
          </button>
        </form>
      </motion.div>

      {/* Right panel - Branding */}
      <div className="flex-1 flex flex-col justify-center items-center pl-16">
        <h1 className="text-6xl font-extrabold select-none cursor-default flex items-center space-x-4">
          {/* SASO with smaller hover effect */}
          <motion.span
            whileHover={{ scale: 1.1 }}
            className="text-green-600"
            style={{ userSelect: 'none' }}
          >
            SASO
          </motion.span>

          {/* Nexus with normal size */}
          <span className="text-gray-700 font-light select-none">Nexus</span>
        </h1>

        <motion.div
          whileHover={{ scale: 1.3 }}
          className="mt-8 px-8 py-6 border-4 border-green-600 rounded-lg text-green-600 text-4xl font-extrabold select-none cursor-pointer"
          style={{ userSelect: 'none' }}
        >
          SPC
        </motion.div>

        <p className="mt-10 max-w-xs text-center text-gray-600 font-medium tracking-wide">
          Enhance your experience with advanced features and seamless access.
        </p>
      </div>
    </div>
  );
}
