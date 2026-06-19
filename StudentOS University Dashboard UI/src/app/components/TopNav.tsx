import { Bell, Search, ChevronDown } from "lucide-react";

interface TopNavProps {
  pageTitle: string;
  pageSubtitle?: string;
}

export function TopNav({ pageTitle, pageSubtitle }: TopNavProps) {
  return (
    <header className="fixed top-0 right-0 left-[256px] z-40 flex items-center px-6 h-16 bg-[rgba(240,242,255,0.8)] backdrop-blur-[12px] border-b border-[rgba(79,70,229,0.1)]">
      {/* Page title */}
      <div className="flex-1">
        <h1 className="font-display text-[var(--foreground)]">{pageTitle}</h1>
        {pageSubtitle && (
          <p className="text-xs text-[var(--muted-foreground)]">{pageSubtitle}</p>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl mr-3 bg-white border border-[var(--border)] w-[240px]">
        <Search size={15} className="text-[var(--muted-foreground)]" />
        <input
          type="text"
          placeholder="Search students, reports..."
          className="flex-1 text-sm bg-transparent border-none outline-none text-[var(--foreground)]"
        />
      </div>

      {/* Notifications */}
      <button
        className="relative w-9 h-9 rounded-xl flex items-center justify-center mr-3 transition-colors hover:bg-white border border-[var(--border)]"
        aria-label="View notifications"
      >
        <Bell size={16} className="text-[var(--muted-foreground)]" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#EF4444]" />
      </button>

      {/* Profile */}
      <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-colors hover:bg-white border border-[var(--border)]" aria-label="Open profile menu">
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-600 bg-[linear-gradient(135deg,_#4F46E5,_#7C3AED)]">
          SA
        </div>
        <div className="text-left">
          <div className="text-xs font-500 text-[var(--foreground)]">Super Admin</div>
          <div className="text-xs text-[var(--muted-foreground)]">IIT Mumbai</div>
        </div>
        <ChevronDown size={13} className="text-[var(--muted-foreground)]" />
      </button>
    </header>
  );
}
