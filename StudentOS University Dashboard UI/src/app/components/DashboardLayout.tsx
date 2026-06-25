import { Outlet, Navigate, useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";

export function DashboardLayout({ allowedRole }: { allowedRole: "admin" | "student" }) {
  const { user, profile, loading, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070a14] text-white">
        <div className="flex flex-col items-center gap-4">
          {/* Subtle loading spinner */}
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Loading session...</p>
        </div>
      </div>
    );
  }

  // Redirect to login selector if not logged in
  if (!user || !profile) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Redirect to correct dashboard if role doesn't match
  if (profile.role !== allowedRole) {
    const targetDashboard = profile.role === "admin" ? "/admin/dashboard" : "/student/dashboard";
    return <Navigate to={targetDashboard} replace />;
  }

  // Redirect to onboarding if student has not completed setup
  if (profile.role === "student" && !profile.setupCompleted) {
    return <Navigate to="/student/onboarding" replace />;
  }

  // Map current location pathname to activePage, title, and subtitle
  const pathname = location.pathname;
  let activePage = "";
  let title = "StudentOS";
  let subtitle = "";

  if (allowedRole === "student") {
    if (pathname.endsWith("/student/dashboard")) { activePage = "student-dashboard"; title = "Student Dashboard"; subtitle = "Continue your academic flow"; }
    else if (pathname.endsWith("/student/profile")) { activePage = "profile"; title = "Profile"; subtitle = "Your personal and academic information"; }
    else if (pathname.endsWith("/student/courses")) { activePage = "courses"; title = "Courses"; subtitle = "Enrolled courses, modules, and materials"; }
    else if (pathname.endsWith("/student/assignments")) { activePage = "assignments"; title = "Assignments"; subtitle = "Pending and submitted tasks"; }
    else if (pathname.endsWith("/student/grades")) { activePage = "grades"; title = "Grades"; subtitle = "Grades, GPA and transcripts"; }
    else if (pathname.endsWith("/student/planner")) { activePage = "planner"; title = "Planner"; subtitle = "Tasks, deadlines and calendar"; }
    else if (pathname.endsWith("/student/ai-mentor")) { activePage = "ai-mentor"; title = "AI Mentor"; subtitle = "Personalized guidance and study recommendations"; }
    else if (pathname.endsWith("/student/placement")) { activePage = "placement-student"; title = "Placement"; subtitle = "Apply, track applications and interviews"; }
    else if (pathname.endsWith("/student/projects")) { activePage = "student-projects"; title = "Projects & Portfolio"; subtitle = "Manage capstones, teams, and portfolio work"; }
  } else {
    if (pathname.endsWith("/admin/dashboard")) { activePage = "admin-dashboard"; title = "Admin Dashboard"; subtitle = "Institutional insights and operational controls"; }
    else if (pathname.endsWith("/admin/students")) { activePage = "students"; title = "Students"; subtitle = "Student directory and academic profiles"; }
    else if (pathname.endsWith("/admin/reports")) { activePage = "reports"; title = "Reports"; subtitle = "Generate and export institutional reports"; }
    else if (pathname.endsWith("/admin/departments")) { activePage = "departments"; title = "Departments"; subtitle = "Department-level performance and management"; }
    else if (pathname.endsWith("/admin/academic")) { activePage = "academic"; title = "Academic Analytics"; subtitle = "Academic performance and learning outcomes"; }
    else if (pathname.endsWith("/admin/placement")) { activePage = "placement"; title = "Placement Analytics"; subtitle = "Recruitment data and student placement readiness"; }
    else if (pathname.endsWith("/admin/projects")) { activePage = "projects"; title = "Projects"; subtitle = "Institutional project tracking and outcomes"; }
    else if (pathname.endsWith("/admin/settings")) { activePage = "settings"; title = "Settings"; subtitle = "Platform configuration and preferences"; }
  }

  const handleNavigate = async (pageId: string) => {
    // Handle logout navigation request
    if (pageId === "login-selector") {
      await signOut();
      navigate("/");
      return;
    }

    // Map navigation actions from sidebar to exact React Router routes
    const studentRoutes: Record<string, string> = {
      "student-dashboard": "/student/dashboard",
      "profile": "/student/profile",
      "courses": "/student/courses",
      "assignments": "/student/assignments",
      "grades": "/student/grades",
      "planner": "/student/planner",
      "ai-mentor": "/student/ai-mentor",
      "student-projects": "/student/projects",
      "placement-student": "/student/placement",
    };

    const adminRoutes: Record<string, string> = {
      "admin-dashboard": "/admin/dashboard",
      "students": "/admin/students",
      "reports": "/admin/reports",
      "departments": "/admin/departments",
      "academic": "/admin/academic",
      "placement": "/admin/placement",
      "projects": "/admin/projects",
      "settings": "/admin/settings",
    };

    if (allowedRole === "student" && studentRoutes[pageId]) {
      navigate(studentRoutes[pageId]);
    } else if (allowedRole === "admin" && adminRoutes[pageId]) {
      navigate(adminRoutes[pageId]);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] font-['Inter',sans-serif]">
      {/* Overriding the sidebar user profile values dynamically based on session */}
      <Sidebar 
        role={allowedRole} 
        activePage={activePage} 
        onNavigate={handleNavigate} 
      />

      <div className="ml-[256px]">
        <TopNav pageTitle={title} pageSubtitle={subtitle} role={allowedRole} />

        <main className="px-6 py-6 pt-[calc(64px+1.5rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
