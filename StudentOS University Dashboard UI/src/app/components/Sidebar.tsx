import {
  LayoutDashboard, Users, Building2, Briefcase, GraduationCap,
  FolderKanban, BarChart3, Settings,
  ChevronRight, Zap
} from "lucide-react";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "students", label: "Students", icon: Users },
  { id: "departments", label: "Departments", icon: Building2 },
  { id: "placement", label: "Placement Analytics", icon: Briefcase },
  { id: "academic", label: "Academic Analytics", icon: GraduationCap },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside
      className="fixed left-0 top-0 h-screen w-64 flex flex-col z-50"
      style={{ background: "var(--sidebar)" }}
    >
      {/* Logo */}
      <div className="px-6 py-5 border-b" style={{ borderColor: "var(--sidebar-border)" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}
          >
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <div className="font-display font-700 text-white text-sm leading-tight">StudentOS</div>
            <div className="text-xs" style={{ color: "var(--sidebar-accent-foreground)" }}>
              University Portal
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="text-xs font-600 uppercase tracking-widest mb-3 px-3" style={{ color: "rgba(199,210,254,0.5)" }}>
          Main Menu
        </div>
        <ul className="space-y-0.5">
          {navItems.slice(0, 8).map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group"
                  style={{
                    background: isActive ? "rgba(79,70,229,0.3)" : "transparent",
                    color: isActive ? "#C7D2FE" : "rgba(199,210,254,0.7)",
                  }}
                >
                  <Icon
                    size={17}
                    style={{ color: isActive ? "#818CF8" : "rgba(199,210,254,0.5)" }}
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

        <div className="text-xs font-600 uppercase tracking-widest mt-6 mb-3 px-3" style={{ color: "rgba(199,210,254,0.5)" }}>
          System
        </div>
        <ul className="space-y-0.5">
          {navItems.slice(8).map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200"
                  style={{
                    background: isActive ? "rgba(79,70,229,0.3)" : "transparent",
                    color: isActive ? "#C7D2FE" : "rgba(199,210,254,0.7)",
                  }}
                >
                  <Icon
                    size={17}
                    style={{ color: isActive ? "#818CF8" : "rgba(199,210,254,0.5)" }}
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
      <div className="px-3 py-4 border-t" style={{ borderColor: "var(--sidebar-border)" }}>
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/5 transition-colors"
          onClick={() => onNavigate("settings")}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-600"
            style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}
          >
            SA
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-500 text-white truncate">Super Admin</div>
            <div className="text-xs truncate" style={{ color: "var(--sidebar-accent-foreground)" }}>
              admin@university.edu
            </div>
          </div>
          <ChevronRight size={14} style={{ color: "rgba(199,210,254,0.4)" }} />
        </div>

        <div className="mt-3 px-3">
          <button
            onClick={() => onNavigate("login-selector")}
            className="w-full text-sm py-2 rounded-lg"
            style={{ background: "transparent", color: "rgba(199,210,254,0.8)", border: "1px solid rgba(199,210,254,0.06)" }}
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
