/* MARKER-MAKE-KIT-INVOKED */
import "../styles/fonts.css";
import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopNav } from "./components/TopNav";
import { DashboardPage } from "./components/DashboardPage";
import { StudentDashboardPage } from "./components/StudentDashboardPage";
import { StudentsPage } from "./components/StudentsPage";
import { ReportsPage } from "./components/ReportsPage";
import { AIMentorPage } from "./components/AIMentorPage";
import { PlaceholderPage } from "./components/PlaceholderPage";
import { ProfilePage } from "./components/ProfilePage";
import { CoursesPage } from "./components/CoursesPage";
import { AssignmentsPage } from "./components/AssignmentsPage";
import { GradesPage } from "./components/GradesPage";
import { PlannerPage } from "./components/PlannerPage";
import { PlacementPage } from "./components/PlacementPage";
import { StudentProjectsPage } from "./components/StudentProjectsPage";
import LoginPage from "./components/LoginPage";
import StudentLoginPage from "./components/StudentLoginPage";
import LoginSelector from "./components/LoginSelector";

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  "student-dashboard": { title: "Student Dashboard", subtitle: "Continue your academic flow" },
  profile: { title: "Profile", subtitle: "Your personal and academic information" },
  courses: { title: "Courses", subtitle: "Enrolled courses, modules, and materials" },
  assignments: { title: "Assignments", subtitle: "Pending and submitted tasks" },
  grades: { title: "Grades", subtitle: "Grades, GPA and transcripts" },
  planner: { title: "Planner", subtitle: "Tasks, deadlines and calendar" },
  "ai-mentor": { title: "AI Mentor", subtitle: "Personalized guidance and study recommendations" },
  "placement-student": { title: "Placement", subtitle: "Apply, track applications and interviews" },
  "student-projects": { title: "Projects & Portfolio", subtitle: "Manage capstones, teams, and portfolio work" },

  "admin-dashboard": { title: "Admin Dashboard", subtitle: "Institutional insights and operational controls" },
  students: { title: "Students", subtitle: "Student directory and academic profiles" },
  reports: { title: "Reports", subtitle: "Generate and export institutional reports" },
  departments: { title: "Departments", subtitle: "Department-level performance and management" },
  academic: { title: "Academic Analytics", subtitle: "Academic performance and learning outcomes" },
  placement: { title: "Placement Analytics", subtitle: "Recruitment data and student placement readiness" },
  projects: { title: "Projects", subtitle: "Institutional project tracking and outcomes" },
  settings: { title: "Settings", subtitle: "Platform configuration and preferences" },
};

export default function App() {
  const [activePage, setActivePage] = useState("login-selector");
  const [role, setRole] = useState<"admin" | "student" | null>(null);

  const studentPages = new Set([
    "student-dashboard",
    "profile",
    "courses",
    "assignments",
    "grades",
    "planner",
    "ai-mentor",
    "placement-student",
    "student-projects",
  ]);

  const adminPages = new Set([
    "admin-dashboard",
    "students",
    "reports",
    "departments",
    "academic",
    "placement",
    "projects",
    "settings",
  ]);

  const activePageForRender = role === "admin" && !adminPages.has(activePage)
    ? "admin-dashboard"
    : role === "student" && !studentPages.has(activePage)
      ? "student-dashboard"
      : activePage;

  const meta = pageMeta[activePageForRender] ?? { title: "StudentOS", subtitle: "" };

  function renderPage(page: string) {
    switch (page) {
      case "student-dashboard": return <StudentDashboardPage />;
      case "profile": return <ProfilePage />;
      case "courses": return <CoursesPage />;
      case "assignments": return <AssignmentsPage />;
      case "grades": return <GradesPage />;
      case "planner": return <PlannerPage />;
      case "ai-mentor": return <AIMentorPage />;
      case "placement-student": return <PlacementPage />;
      case "student-projects": return <StudentProjectsPage />;
      case "admin-dashboard": return <DashboardPage section={"overview"} />;
      case "students": return <StudentsPage />;
      case "reports": return <ReportsPage />;
      case "departments": return <DashboardPage section={"departments"} />;
      case "placement": return <DashboardPage section={"placement"} />;
      case "academic": return <DashboardPage section={"academic"} />;
      case "projects": return <DashboardPage section={"projects"} />;
      case "settings": return <PlaceholderPage title="Settings" />;
      default: return <PlaceholderPage title={meta.title} />;
    }
  }

  function navigate(page: string) {
    if (page === "login-selector") {
      setRole(null);
    }
    setActivePage(page);
  }

  if (activePage === "login-selector") {
    return <LoginSelector onSelect={(selectedRole) => {
      setRole(selectedRole);
      setActivePage(selectedRole === "admin" ? "login" : "login-student");
    }} />;
  }

  if (activePage === "login") {
    return <LoginPage onLogin={() => {
      setActivePage("admin-dashboard");
      setRole("admin");
    }} onSwitchToSelector={() => navigate("login-selector")} />;
  }

  if (activePage === "login-student") {
    return <StudentLoginPage onSwitchToAdmin={() => navigate("login-selector")} onLogin={() => {
      setActivePage("student-dashboard");
      setRole("student");
    }} />;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] font-['Inter',sans-serif]">
      <Sidebar role={role} activePage={activePage} onNavigate={navigate} />

      <div className="ml-[256px]">
        <TopNav pageTitle={meta.title} pageSubtitle={meta.subtitle} />

        <main className="px-6 py-6 pt-[calc(64px+1.5rem)]">
          {renderPage(activePageForRender)}
        </main>
      </div>
    </div>
  );
}
