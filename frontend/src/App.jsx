import React, { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
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
import ViewForm from "./AdminContent/ViewForm";

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';

function RouteWatcher() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("lastRoute", location.pathname);
  }, [location]);

  useEffect(() => {
    const lastRoute = localStorage.getItem("lastRoute");
    if (lastRoute && location.pathname === "/") {
      navigate(lastRoute, { replace: true });
    }
  }, []);

  return null;
}

function App() {
  const location = useLocation();
  const noNavbarPaths = ['/admin/dashboard', '/staff-dashboard'];
  const hideNavbar = noNavbarPaths.includes(location.pathname);

  const isAuthenticated = localStorage.getItem("token");
  const role = localStorage.getItem("role"); // "admin" or "staff"

  return (
    <div className="flex flex-col min-h-screen">
      <RouteWatcher />

      {!hideNavbar && <Navbar />}

      <div className={`${hideNavbar ? 'px-4 flex-grow mb-8' : 'pt-[100px] px-4 flex-grow mb-8'}`}>
        <Routes>
          {/* Home route → Redirect kapag logged in */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                role === "admin" ? (
                  <Navigate to="/admin/dashboard" replace />
                ) : (
                  <Navigate to="/staff-dashboard" replace />
                )
              ) : (
                <Home />
              )
            }
          />

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
          <Route path="/admin/view-form/:id" element={<ViewForm />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

export default App;
