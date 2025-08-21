import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, requiredRole }) {
  const adminToken = localStorage.getItem('token');        // admin token
  const staffToken = localStorage.getItem('staffToken');    // staff token

  if (requiredRole === 'admin') {
    if (adminToken) return children;
    return <Navigate to="/admin/login" replace />;
  }

  if (requiredRole === 'staff') {
    if (staffToken) return children;
    return <Navigate to="/staff-login" replace />;
  }

  // fallback: redirect to home
  return <Navigate to="/" replace />;
}
