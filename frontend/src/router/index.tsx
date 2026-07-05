import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from '../pages/landing/Landing';
import { ForInstitutions } from '../pages/landing/ForInstitutions';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { DashboardHome } from '../pages/dashboard/DashboardHome';
import { StudentProfile } from '../pages/student/StudentProfile';
import { StudentJobs } from '../pages/student/StudentJobs';
import { ForumBoard } from '../pages/forum/ForumBoard';
import { MentorshipBoard } from '../pages/mentorship/MentorshipBoard';
import { EmployerDashboard } from '../pages/employer/EmployerDashboard';
import { OfficerDashboard } from '../pages/officer/OfficerDashboard';
import { AssessmentBuilder } from '../pages/officer/AssessmentBuilder';
import { AssessmentPortal } from '../pages/student/AssessmentPortal';
import { ResumeEditor } from '../pages/student/ResumeEditor';
import { ProtectedRoute } from '../components/shared/ProtectedRoute';
import { UserRole } from '../context/AuthContext';

// Shared Layouts
import { StudentLayout } from '../components/shared/StudentLayout';
import { AdminLayout } from '../components/shared/AdminLayout';

// Student Sub-pages
import { StudentAssessments } from '../pages/student/StudentAssessments';
import { StudentInterviews } from '../pages/student/StudentInterviews';
import { StudentOffers } from '../pages/student/StudentOffers';
import { StudentMessages } from '../pages/student/StudentMessages';
import { ChangePassword } from '../pages/student/ChangePassword';

export const AppRouter: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Public Marketing Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/for-institutions" element={<ForInstitutions />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student Portal (Nested inside StudentLayout) */}
        <Route element={<ProtectedRoute allowedRoles={[UserRole.STUDENT]} />}>
          <Route element={<StudentLayout />}>
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/profile" element={<StudentProfile />} />
            <Route path="/profile/resume-builder" element={<ResumeEditor />} />
            <Route path="/jobs" element={<StudentJobs />} />
            <Route path="/assessments" element={<StudentAssessments />} />
            <Route path="/interviews" element={<StudentInterviews />} />
            <Route path="/offers" element={<StudentOffers />} />
            <Route path="/messages" element={<StudentMessages />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/forum" element={<ForumBoard />} />
            <Route path="/mentorship" element={<MentorshipBoard />} />
          </Route>
          {/* Individual Assessment portal runs without sidebar */}
          <Route path="/assessments/:id" element={<AssessmentPortal />} />
        </Route>

        {/* Employer Portal (Direct full screen view) */}
        <Route element={<ProtectedRoute allowedRoles={[UserRole.EMPLOYER, UserRole.RECRUITER]} />}>
          <Route path="/employer" element={<EmployerDashboard />} />
        </Route>

        {/* Admin/Institution Portal (Nested inside AdminLayout) */}
        <Route element={<ProtectedRoute allowedRoles={[UserRole.PLACEMENT_OFFICER, UserRole.COLLEGE_ADMIN]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/officer" element={<OfficerDashboard />} />
            <Route path="/officer/students" element={<OfficerDashboard />} />
            <Route path="/officer/drives" element={<OfficerDashboard />} />
            <Route path="/officer/assessments" element={<OfficerDashboard />} />
            <Route path="/officer/analytics" element={<OfficerDashboard />} />
            <Route path="/officer/settings" element={<OfficerDashboard />} />
            <Route path="/assessments/builder" element={<AssessmentBuilder />} />
          </Route>
        </Route>

        {/* Fallback Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};
export default AppRouter;
