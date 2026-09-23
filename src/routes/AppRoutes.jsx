import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../components/layout/PublicLayout';
import { Home } from '../pages/public/Home';
import { Directory } from '../pages/public/Directory';
import { DoctorProfile } from '../pages/public/DoctorProfile';
import { SearchPage } from '../pages/public/SearchPage';
import { MoreMenu } from '../pages/public/MoreMenu';
import { AboutNSDA } from '../pages/static/AboutNSDA';
import { TermsPrivacy } from '../pages/static/TermsPrivacy';
import { HelpSupport } from '../pages/static/HelpSupport';
import { Login } from '../pages/auth/Login';
import { RegisterDoctor } from '../pages/auth/RegisterDoctor';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { DoctorDashboard } from '../pages/doctor/DoctorDashboard';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { SuperAdminDashboard } from '../pages/superadmin/SuperAdminDashboard';
import { useAuth } from '../context/AuthContext';

// Protected Route wrappers
const ProtectedDoctorRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/doctor/dashboard" replace />;
  return children;
};

const ProtectedSuperAdminRoute = ({ children }) => {
  const { isAuthenticated, isSuperAdmin, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isSuperAdmin) {
    return isAdmin ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/doctor/dashboard" replace />;
  }
  return children;
};

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/directory" element={<Directory />} />
        <Route path="/doctor/:id" element={<DoctorProfile />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/more" element={<MoreMenu />} />
        <Route path="/about" element={<AboutNSDA />} />
        <Route path="/terms" element={<TermsPrivacy />} />
        <Route path="/help" element={<HelpSupport />} />

        {/* Authentication Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterDoctor />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Role Protected Dashboards */}
        <Route
          path="/doctor/dashboard"
          element={
            <ProtectedDoctorRoute>
              <DoctorDashboard />
            </ProtectedDoctorRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/superadmin/dashboard"
          element={
            <ProtectedSuperAdminRoute>
              <SuperAdminDashboard />
            </ProtectedSuperAdminRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
