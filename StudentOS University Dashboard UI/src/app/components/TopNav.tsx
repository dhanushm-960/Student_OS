import { Bell, Search, ChevronDown } from "lucide-react";

interface TopNavProps {
  pageTitle: string;
  pageSubtitle?: string;
}

export function TopNav({ pageTitle, pageSubtitle }: TopNavProps) {
  return (
    <header
      className="fixed top-0 right-0 z-40 flex items-center px-6 h-16"
      style={{
        left: "256px",
        background: "rgba(240,242,255,0.8)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(79,70,229,0.1)",
      }}
    >
      {/* Page title */}
      <div className="flex-1">
        <h1 className="font-display" style={{ color: "var(--foreground)" }}>
          {pageTitle}
        </h1>
        {pageSubtitle && (
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            {pageSubtitle}
          </p>
        )}
      </div>

      {/* Search */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl mr-3"
        style={{ background: "white", border: "1px solid var(--border)", width: "240px" }}
      >
        <Search size={15} style={{ color: "var(--muted-foreground)" }} />
        <input
          type="text"
          placeholder="Search students, reports..."
          className="flex-1 text-sm bg-transparent border-none outline-none"
          style={{ color: "var(--foreground)" }}
        />
      </div>

      {/* Notifications */}
      <button
        className="relative w-9 h-9 rounded-xl flex items-center justify-center mr-3 transition-colors hover:bg-white"
        style={{ border: "1px solid var(--border)" }}
      >
        <Bell size={16} style={{ color: "var(--muted-foreground)" }} />
        <span
          className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
          style={{ background: "#EF4444" }}
        />
      </button>

      {/* Profile */}
      <button
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-colors hover:bg-white"
        style={{ border: "1px solid var(--border)" }}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-600"
          style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}
        >
          SA
        </div>
        <div className="text-left">
          <div className="text-xs font-500" style={{ color: "var(--foreground)" }}>
            Super Admin
          </div>
          <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            IIT Mumbai
          </div>
        </div>
        <ChevronDown size={13} style={{ color: "var(--muted-foreground)" }} />
      </button>
    </header>
  );
}
