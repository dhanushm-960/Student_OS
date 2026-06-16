/* MARKER-MAKE-KIT-INVOKED */
import "../styles/fonts.css";
import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopNav } from "./components/TopNav";
import { DashboardPage } from "./components/DashboardPage";
import { StudentsPage } from "./components/StudentsPage";
import { ReportsPage } from "./components/ReportsPage";
import { PlaceholderPage } from "./components/PlaceholderPage";
import LoginPage from "./components/LoginPage";
import StudentLoginPage from "./components/StudentLoginPage";
import LoginSelector from "./components/LoginSelector";

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Good morning, Super Admin — here's today's overview" },
  students: { title: "Students", subtitle: "Student directory and academic profiles" },
  departments: { title: "Departments", subtitle: "Department-level performance and management" },
  placement: { title: "Placement Analytics", subtitle: "Recruitment data and student placement readiness" },
  academic: { title: "Academic Analytics", subtitle: "Academic performance and learning outcomes" },
  projects: { title: "Projects", subtitle: "Student project management and innovation tracking" },
  skills: { title: "Skill Development", subtitle: "Skill learning paths and progress tracking" },
  attendance: { title: "Attendance Insights", subtitle: "Attendance patterns and intervention triggers" },
  reports: { title: "Reports", subtitle: "Generate and export institutional reports" },
  settings: { title: "Settings", subtitle: "Platform configuration and preferences" },
};

export default function App() {
  const [activePage, setActivePage] = useState("login-selector");
  const meta = pageMeta[activePage] ?? { title: "StudentOS", subtitle: "" };

  function renderPage() {
    switch (activePage) {
      case "dashboard": return <DashboardPage />;
      case "students": return <StudentsPage />;
      case "reports": return <ReportsPage />;
      case "departments": return <DashboardPage section={"departments"} />;
      case "placement": return <DashboardPage section={"placement"} />;
      case "academic": return <DashboardPage section={"academic"} />;
      case "projects": return <DashboardPage section={"projects"} />;
      default: return <PlaceholderPage title={meta.title} />;
    }
  }

  // Login selector / login pages hide chrome
  if (activePage === "login-selector") {
    return <LoginSelector onSelect={(role) => setActivePage(role === "admin" ? "login" : "login-student")} />;
  }

  if (activePage === "login") {
    return <LoginPage onLogin={() => setActivePage("dashboard")} onSwitchToSelector={() => setActivePage("login-selector")} />;
  }

  if (activePage === "login-student") {
    return <StudentLoginPage onSwitchToAdmin={() => setActivePage("login-selector")} />;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] font-['Inter',sans-serif]">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <div className="ml-[256px]">
        <TopNav pageTitle={meta.title} pageSubtitle={meta.subtitle} />

        <main className="px-6 py-6 pt-[calc(64px+1.5rem)]">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
