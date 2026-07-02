import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from '../pages/landing/Landing';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { DashboardHome } from '../pages/dashboard/DashboardHome';
import { StudentProfile } from '../pages/student/StudentProfile';
import { ProtectedRoute } from '../components/shared/ProtectedRoute';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/profile" element={<StudentProfile />} />
        </Route>

        {/* Fallback Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
export default AppRouter;
