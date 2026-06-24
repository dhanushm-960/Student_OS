import { useState, useRef, useEffect } from "react";
import { Bell, Search, Check, FileText, Briefcase, Database, AlertCircle } from "lucide-react";

interface TopNavProps {
  pageTitle: string;
  pageSubtitle?: string;
  role?: "admin" | "student" | null;
}

interface NotificationItem {
  id: string;
  title: string;
  time: string;
  type: "academic" | "system" | "placement" | "financial";
  unread: boolean;
}

const studentNotifications: NotificationItem[] = [
  {
    id: "s1",
    title: "New grade posted for CS-302. You scored an A!",
    time: "10 mins ago",
    type: "academic",
    unread: true,
  },
  {
    id: "s2",
    title: "Assignment 3: Neural Networks is due tomorrow at 11:59 PM.",
    time: "2 hours ago",
    type: "academic",
    unread: true,
  },
  {
    id: "s3",
    title: "Placement: Google has shortlisted you for the technical round.",
    time: "1 day ago",
    type: "placement",
    unread: false,
  },
  {
    id: "s4",
    title: "Fees: Your Spring semester tuition fee payment receipt is generated.",
    time: "2 days ago",
    type: "financial",
    unread: false,
  },
];

const adminNotifications: NotificationItem[] = [
  {
    id: "a1",
    title: "CS department requested syllabus approval for new AI elective.",
    time: "15 mins ago",
    type: "academic",
    unread: true,
  },
  {
    id: "a2",
    title: "Security: Weekly system database backup executed successfully.",
    time: "1 hour ago",
    type: "system",
    unread: true,
  },
  {
    id: "a3",
    title: "Placement: 45 new students registered for the upcoming Microsoft drive.",
    time: "4 hours ago",
    type: "placement",
    unread: false,
  },
  {
    id: "a4",
    title: "Analytics: Course feedback reports for Fall semester are now available.",
    time: "1 day ago",
    type: "academic",
    unread: false,
  },
];

const getNotificationIcon = (type: NotificationItem["type"]) => {
  switch (type) {
    case "academic":
      return <FileText size={14} className="text-indigo-600" />;
    case "system":
      return <Database size={14} className="text-emerald-600" />;
    case "placement":
      return <Briefcase size={14} className="text-amber-600" />;
    default:
      return <AlertCircle size={14} className="text-rose-600" />;
  }
};

const getNotificationBg = (type: NotificationItem["type"]) => {
  switch (type) {
    case "academic":
      return "bg-indigo-50 border-indigo-100";
    case "system":
      return "bg-emerald-50 border-emerald-100";
    case "placement":
      return "bg-amber-50 border-amber-100";
    default:
      return "bg-rose-50 border-rose-100";
  }
};

export function TopNav({ pageTitle, pageSubtitle, role = "student" }: TopNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize notifications based on role
  useEffect(() => {
    setNotifications(role === "admin" ? adminNotifications : studentNotifications);
  }, [role]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    );
  };

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
      <div className="relative mr-3" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors border ${
            isOpen
              ? "bg-indigo-50 border-indigo-200 text-indigo-600"
              : "hover:bg-white border-[var(--border)] text-[var(--muted-foreground)]"
          }`}
          aria-label="View notifications"
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200/50 shadow-xl shadow-slate-900/5 z-50 overflow-hidden transition-all transform scale-100 origin-top-right">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50/50 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-700">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <Check size={11} /> Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-slate-400">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleToggleRead(notification.id)}
                    className={`w-full flex gap-3 p-3 text-left transition-colors hover:bg-slate-50/75 relative ${
                      notification.unread ? "bg-indigo-50/25" : ""
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center border shrink-0 ${getNotificationBg(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                      <p className={`text-xs leading-normal ${notification.unread ? "font-medium text-slate-800" : "text-slate-500"}`}>
                        {notification.title}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block font-normal">
                        {notification.time}
                      </span>
                    </div>
                    {notification.unread && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
