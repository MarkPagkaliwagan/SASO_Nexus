import React from 'react';
import { Routes, Route, useLocation } from "react-router-dom";
import AdminLogin from "./MainPage/AdminLogin";
import AdminDashboard from "./MainPage/AdminDashboard";
import StaffLogin from "./MainPage/StaffLogin";
import StaffDashboard from "./MainPage/StaffDashboard";
import Home from './MainPage/Home';
import ResetPassword from './MainPage/ResetPassword';
import Personnel from './MainPage/Personnel';
import Department from './MainPage/Department';
import Admission from './MainPage/Admission';
import AdmissionForm from "./components/AdmissionForm";


import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';

function App() {
  const location = useLocation();
  const noNavbarPaths = ['/admin/dashboard', '/staff-dashboard'];
  const hideNavbar = noNavbarPaths.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      {!hideNavbar && <Navbar />}

      {/* Main content */}
      <div className={`${hideNavbar ? 'px-4 flex-grow mb-8' : 'pt-[100px] px-4 flex-grow mb-8'}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/staff/login" element={<StaffLogin />} />
          <Route
            path="/staff-dashboard"
            element={
              <ProtectedRoute requiredRole="staff">
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/personnel" element={<Personnel />} />
          <Route path="/departments" element={<Department />} />
          <Route path="/admissions" element={<Admission />} />
          <Route path="/admission-form" element={<AdmissionForm />} />
            


        </Routes>
      </div>

      {/* Footer at the bottom */}
      <Footer />
    </div>
  );
}

export default App;
