import {
  LayoutDashboard, Users, Building2, Briefcase, GraduationCap,
  FolderKanban, BarChart3, ChevronRight, Zap,
  BookOpen, ClipboardList, Calendar, CreditCard, Brain, TrendingUp
} from "lucide-react";
import { useAuth } from "../context/AuthContext";


const studentNavItems = [
  { id: "student-dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "planner", label: "Planner", icon: Calendar },
  { id: "placement-student", label: "Placement", icon: Briefcase },
  { id: "ai-mentor", label: "AI Mentor", icon: Brain },
  { id: "profile", label: "Profile", icon: Users },
  { id: "settings", label: "Settings", icon: ChevronRight },
];

const adminNavItems = [
  { id: "admin-dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "students", label: "Students", icon: Users },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "departments", label: "Departments", icon: Building2 },
  { id: "academic", label: "Academic Analytics", icon: TrendingUp },
  { id: "placement", label: "Placement", icon: Briefcase },
  { id: "projects", label: "Projects", icon: FolderKanban },
];

interface SidebarProps {
  role: "admin" | "student" | null;
  activePage: string;
  onNavigate: (page: string) => void;
}

export function Sidebar({ role, activePage, onNavigate }: SidebarProps) {
  const { profile, user } = useAuth();
  
  const userName = profile?.name || (role === "admin" ? "Super Admin" : "Student");
  const userEmail = profile?.email || user?.email || (role === "admin" ? "admin@university.edu" : "student@university.edu");
  
  const initials = userName
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || (role === "admin" ? "SA" : "ST");

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col z-50 bg-[var(--sidebar)]">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[var(--sidebar-border)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[linear-gradient(135deg,_#4F46E5,_#7C3AED)]">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <div className="font-display font-700 text-white text-sm leading-tight">StudentOS</div>
            <div className="text-xs text-[var(--sidebar-accent-foreground)]">University Portal</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="text-xs font-600 uppercase tracking-widest mb-3 px-3 text-[rgba(199,210,254,0.5)]">
          {role === "admin" ? "Admin Menu" : "Student Menu"}
        </div>
        <ul className="space-y-0.5">
          {(role === "admin" ? adminNavItems : studentNavItems).map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group ${isActive ? "bg-[rgba(79,70,229,0.3)] text-[#C7D2FE]" : "bg-transparent text-[rgba(199,210,254,0.7)]"}`}
                >
                  <Icon
                    size={17}
                    className={isActive ? "text-[#818CF8]" : "text-[rgba(199,210,254,0.5)]"}
                  />
                  <span className="flex-1 text-left">{item.label}</span>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom user section */}
      <div className="px-3 py-4 border-t border-[var(--sidebar-border)]">
        <div
          className={role === "student"
            ? `flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                activePage === "profile" ? "bg-[rgba(79,70,229,0.3)] text-white" : "hover:bg-white/5"
              }`
            : "flex items-center gap-3 px-3 py-2.5 rounded-xl"
          }
          onClick={role === "student" ? () => onNavigate("profile") : undefined}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-600 bg-[linear-gradient(135deg,_#4F46E5,_#7C3AED)] shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-500 text-white truncate">{userName}</div>
            <div className="text-xs truncate text-[var(--sidebar-accent-foreground)]">
              {userEmail}
            </div>
          </div>
          {role === "student" && (
            <ChevronRight size={14} className="text-[rgba(199,210,254,0.4)]" />
          )}
        </div>

        <div className="mt-3 px-3">
          <button
            onClick={() => onNavigate("login-selector")}
            className="w-full text-sm py-2 rounded-lg bg-transparent text-[rgba(199,210,254,0.8)] border border-[rgba(199,210,254,0.06)]"
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
