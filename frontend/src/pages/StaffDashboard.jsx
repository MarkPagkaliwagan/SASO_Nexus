import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle, BarChart2, Users, FileText, Home, Activity, Clipboard
} from 'react-feather';
import { motion } from 'framer-motion';
import api from '../services/api'; // ✅ Ensure this exists

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [staffData, setStaffData] = useState(null);

  const token = localStorage.getItem('staffToken');
  const role = localStorage.getItem('role');
  const staffId = localStorage.getItem('staffId');

  const fetchStaffData = async () => {
    try {
      const response = await api.get(`/staff/${staffId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaffData(response.data);
    } catch (err) {
      console.error('Error fetching staff data:', err);
    }
  };

  useEffect(() => {
    if (!token || role !== 'staff') {
      navigate('/staff-login', { replace: true });
      return;
    }

    if (localStorage.getItem('showPopup') === 'true') {
      fetchStaffData().then(() => {
        setShowPopup(true);
        localStorage.removeItem('showPopup');
      });
    } else {
      fetchStaffData();
    }
  }, [navigate]);

  const handleClosePopup = () => setShowPopup(false);

  // ✅ Logout function
  const handleLogout = () => {
    localStorage.removeItem('staffToken');
    localStorage.removeItem('role');
    localStorage.removeItem('staffId');
    navigate('/staff-login', { replace: true });
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 h-full bg-green-600 text-white p-6 flex flex-col justify-between">
        <div>
          <div className="text-2xl font-bold mb-6">SASO Staff</div>
          <nav className="flex flex-col space-y-4">
            <a href="#" className="flex items-center gap-3 hover:text-green-200"><Home size={18} /> Dashboard</a>
            <a href="#" className="flex items-center gap-3 hover:text-green-200"><FileText size={18} /> Tasks</a>
            <a href="#" className="flex items-center gap-3 hover:text-green-200"><BarChart2 size={18} /> Reports</a>
            <a href="#" className="flex items-center gap-3 hover:text-green-200"><Clipboard size={18} /> Schedule</a>
            <a href="#" className="flex items-center gap-3 hover:text-green-200"><Users size={18} /> Team</a>
            <a href="#" className="flex items-center gap-3 hover:text-green-200"><Activity size={18} /> Activity</a>
          </nav>
        </div>

        {/* ✅ Logout button */}
        <div>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center justify-center gap-2"
          >
            <CheckCircle size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white shadow-lg rounded-xl p-10 w-full max-w-2xl text-center"
        >
          <h1 className="text-3xl font-bold text-green-700">
            Welcome, {staffData ? staffData.name : 'Staff'}!
          </h1>
          <p className="mt-4 text-gray-700">
            You are now inside the SASO Staff Dashboard.
          </p>

          {staffData && (
            <div className="mt-6 text-left text-gray-600">
              <p><strong>Email:</strong> {staffData.email}</p>
              <p><strong>Position:</strong> {staffData.position || 'Not set'}</p>
            </div>
          )}
        </motion.div>
      </main>

      {/* Popup */}
      {showPopup && staffData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center"
          >
            <CheckCircle size={48} className="text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-green-700">Login Verified</h2>
            <p className="text-gray-600 mt-2">You are now logged in as SASO staff.</p>
            <p className="text-gray-700 mt-2">
              <strong>Staff ID:</strong> {staffData.id}
            </p>
            <button
              onClick={handleClosePopup}
              className="mt-6 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
            >
              OK
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
