import "../styles/fonts.css";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router";
import { AuthProvider } from "./context/AuthContext";
import { DashboardLayout } from "./components/DashboardLayout";
import { LoginSelector } from "./components/LoginSelector";
import { LoginPage } from "./components/LoginPage";
import { StudentLoginPage } from "./components/StudentLoginPage";
import { StudentSignupPage } from "./components/StudentSignupPage";

// Pages
import { StudentDashboardPage } from "./components/StudentDashboardPage";
import { ProfilePage } from "./components/ProfilePage";
import { CoursesPage } from "./components/CoursesPage";
import { AssignmentsPage } from "./components/AssignmentsPage";
import { GradesPage } from "./components/GradesPage";
import { PlannerPage } from "./components/PlannerPage";
import { AIMentorPage } from "./components/AIMentorPage";
import { PlacementPage } from "./components/PlacementPage";
import { StudentProjectsPage } from "./components/StudentProjectsPage";
import { StudentOnboardingPage } from "./components/StudentOnboardingPage";

import { DashboardPage } from "./components/DashboardPage";
import { StudentsPage } from "./components/StudentsPage";
import { ReportsPage } from "./components/ReportsPage";
import { PlaceholderPage } from "./components/PlaceholderPage";

function AppRoutes() {
  const navigate = useNavigate();

  const handleNavigate = (pageId: string) => {
    const studentRoutes: Record<string, string> = {
      "student-dashboard": "/student/dashboard",
      profile: "/student/profile",
      courses: "/student/courses",
      assignments: "/student/assignments",
      grades: "/student/grades",
      planner: "/student/planner",
      "ai-mentor": "/student/ai-mentor",
      "student-projects": "/student/projects",
      "placement-student": "/student/placement",
    };

    const adminRoutes: Record<string, string> = {
      "admin-dashboard": "/admin/dashboard",
      students: "/admin/students",
      reports: "/admin/reports",
      departments: "/admin/departments",
      academic: "/admin/academic",
      placement: "/admin/placement",
      projects: "/admin/projects",
      settings: "/admin/settings",
    };

    if (studentRoutes[pageId]) {
      navigate(studentRoutes[pageId]);
    } else if (adminRoutes[pageId]) {
      navigate(adminRoutes[pageId]);
    }
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LoginSelector />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/login-student" element={<StudentLoginPage />} />
      <Route path="/signup-student" element={<StudentSignupPage />} />
      <Route path="/student/onboarding" element={<StudentOnboardingPage />} />

      {/* Student Protected Routes */}
      <Route element={<DashboardLayout allowedRole="student" />}>
        <Route path="/student/dashboard" element={<StudentDashboardPage onNavigate={handleNavigate} />} />
        <Route path="/student/profile" element={<ProfilePage />} />
        <Route path="/student/courses" element={<CoursesPage />} />
        <Route path="/student/assignments" element={<AssignmentsPage />} />
        <Route path="/student/grades" element={<GradesPage />} />
        <Route path="/student/planner" element={<PlannerPage />} />
        <Route path="/student/ai-mentor" element={<AIMentorPage />} />
        <Route path="/student/placement" element={<PlacementPage />} />
        <Route path="/student/projects" element={<StudentProjectsPage />} />
      </Route>

      {/* Admin Protected Routes */}
      <Route element={<DashboardLayout allowedRole="admin" />}>
        <Route path="/admin/dashboard" element={<DashboardPage section="overview" onNavigate={handleNavigate} />} />
        <Route path="/admin/students" element={<StudentsPage />} />
        <Route path="/admin/reports" element={<ReportsPage />} />
        <Route path="/admin/departments" element={<DashboardPage section="departments" onNavigate={handleNavigate} />} />
        <Route path="/admin/academic" element={<DashboardPage section="academic" onNavigate={handleNavigate} />} />
        <Route path="/admin/placement" element={<DashboardPage section="placement" onNavigate={handleNavigate} />} />
        <Route path="/admin/projects" element={<DashboardPage section="projects" onNavigate={handleNavigate} />} />
        <Route path="/admin/settings" element={<PlaceholderPage title="Settings" />} />
      </Route>

      {/* Catch-all Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
