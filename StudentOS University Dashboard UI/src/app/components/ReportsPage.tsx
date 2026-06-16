import { useState } from "react";
import { FileText, Download, BarChart3, Users, Briefcase, TrendingUp, Calendar, Filter, Check } from "lucide-react";

const C = {
  indigo: "#4F46E5",
  purple: "#7C3AED",
  green: "#10B981",
  amber: "#F59E0B",
  cyan: "#06B6D4",
};

function Card({ children, className = "", style = {} }: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`rounded-2xl p-5 ${className}`}
      style={{
        background: "white",
        border: "1px solid rgba(79,70,229,0.1)",
        boxShadow: "0 1px 3px rgba(79,70,229,0.06), 0 4px 16px rgba(79,70,229,0.04)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

const reportTypes = [
  {
    id: "department",
    title: "Department Reports",
    description: "Performance metrics, student progress, and KPIs per department",
    icon: BarChart3,
    color: C.indigo,
    bg: "#EEF2FF",
    templates: ["Overview Report", "Faculty Performance", "Student Progress", "Resource Utilization"],
  },
  {
    id: "placement",
    title: "Placement Reports",
    description: "Placement statistics, company-wise data, and salary trends",
    icon: Briefcase,
    color: C.purple,
    bg: "#F5F3FF",
    templates: ["Placement Summary", "Company-wise Analysis", "Salary Distribution", "Offer Trends"],
  },
  {
    id: "productivity",
    title: "Productivity Reports",
    description: "Student productivity scores, engagement trends, and goal tracking",
    icon: TrendingUp,
    color: C.green,
    bg: "#ECFDF5",
    templates: ["Weekly Productivity", "Goal Completion", "Engagement Analysis", "At-Risk Summary"],
  },
  {
    id: "engagement",
    title: "Student Engagement Reports",
    description: "Platform usage, active users, and feature adoption analytics",
    icon: Users,
    color: C.amber,
    bg: "#FFFBEB",
    templates: ["Engagement Overview", "Daily Active Users", "Feature Usage", "Retention Analysis"],
  },
];

const recentReports = [
  { name: "Q1 2024 Department Performance Report", type: "Department", date: "Mar 31, 2024", size: "2.4 MB", format: "PDF" },
  { name: "Placement Season 2023-24 Summary", type: "Placement", date: "Mar 28, 2024", size: "1.8 MB", format: "Excel" },
  { name: "February Student Engagement Report", type: "Engagement", date: "Mar 1, 2024", size: "980 KB", format: "PDF" },
  { name: "At-Risk Students — March 2024", type: "Productivity", date: "Mar 15, 2024", size: "640 KB", format: "CSV" },
  { name: "IT Department Placement Analytics", type: "Placement", date: "Mar 20, 2024", size: "1.2 MB", format: "Excel" },
];

const typeColors: Record<string, { bg: string; text: string }> = {
  Department: { bg: "#EEF2FF", text: C.indigo },
  Placement: { bg: "#F5F3FF", text: C.purple },
  Engagement: { bg: "#FFFBEB", text: C.amber },
  Productivity: { bg: "#ECFDF5", text: C.green },
};

const formatColors: Record<string, string> = {
  PDF: "#FFF1F2",
  Excel: "#ECFDF5",
  CSV: "#EEF2FF",
};

export function ReportsPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [exportFormat, setExportFormat] = useState("PDF");
  const [dateRange, setDateRange] = useState("Q1 2024");

  const handleGenerate = () => {
    if (!selectedType) return;
    setGenerating(true);
    setGenerated(false);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 1800);
  };

  return (
    <div>
      {/* Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Reports Generated", value: "248", sub: "This semester" },
          { label: "Last Generated", value: "Today", sub: "2:30 PM" },
          { label: "Scheduled Reports", value: "12", sub: "Active schedules" },
          { label: "Data Coverage", value: "100%", sub: "All departments" },
        ].map((s) => (
          <Card key={s.label}>
            <div className="font-display font-700 mb-0.5" style={{ fontSize: "1.5rem", color: "var(--foreground)", lineHeight: 1.1 }}>
              {s.value}
            </div>
            <div className="text-sm font-500" style={{ color: "var(--foreground)" }}>
              {s.label}
            </div>
            <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              {s.sub}
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Report Type Selection */}
        <div className="col-span-2">
          <h2 className="font-display mb-4" style={{ color: "var(--foreground)" }}>
            Generate Report
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {reportTypes.map((rt) => {
              const Icon = rt.icon;
              const isSelected = selectedType === rt.id;
              return (
                <button
                  key={rt.id}
                  onClick={() => setSelectedType(rt.id)}
                  className="text-left p-4 rounded-2xl transition-all"
                  style={{
                    background: isSelected ? rt.bg : "white",
                    border: `2px solid ${isSelected ? rt.color : "rgba(79,70,229,0.1)"}`,
                    boxShadow: isSelected
                      ? `0 4px 16px ${rt.color}20`
                      : "0 1px 3px rgba(79,70,229,0.06)",
                  }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: rt.bg }}
                    >
                      <Icon size={18} style={{ color: rt.color }} />
                    </div>
                    {isSelected && (
                      <div
                        className="ml-auto w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: rt.color }}
                      >
                        <Check size={11} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-600 mb-1" style={{ color: "var(--foreground)" }}>
                    {rt.title}
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                    {rt.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {rt.templates.map((t) => (
                      <span
                        key={t}
                        className="text-xs px-2 py-0.5 rounded-md"
                        style={{ background: "rgba(79,70,229,0.06)", color: "var(--muted-foreground)" }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Export Options Panel */}
        <div>
          <h2 className="font-display mb-4" style={{ color: "var(--foreground)" }}>
            Export Options
          </h2>
          <Card className="flex flex-col gap-5">
            {/* Date Range */}
            <div>
              <label className="text-xs font-600 uppercase tracking-wide block mb-2" style={{ color: "var(--muted-foreground)" }}>
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["Q1 2024", "Q2 2024", "Semester 1", "Full Year"].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDateRange(d)}
                    className="py-1.5 px-3 rounded-lg text-xs font-500 transition-all"
                    style={{
                      background: dateRange === d ? C.indigo : "#F8F9FF",
                      color: dateRange === d ? "white" : "var(--muted-foreground)",
                      border: `1px solid ${dateRange === d ? C.indigo : "rgba(79,70,229,0.1)"}`,
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Export Format */}
            <div>
              <label className="text-xs font-600 uppercase tracking-wide block mb-2" style={{ color: "var(--muted-foreground)" }}>
                Export Format
              </label>
              <div className="flex gap-2">
                {["PDF", "Excel", "CSV"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setExportFormat(f)}
                    className="flex-1 py-2 rounded-xl text-sm font-600 transition-all"
                    style={{
                      background: exportFormat === f ? C.indigo : "#F8F9FF",
                      color: exportFormat === f ? "white" : "var(--muted-foreground)",
                      border: `1px solid ${exportFormat === f ? C.indigo : "rgba(79,70,229,0.1)"}`,
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Departments */}
            <div>
              <label className="text-xs font-600 uppercase tracking-wide block mb-2" style={{ color: "var(--muted-foreground)" }}>
                Include Departments
              </label>
              <div className="space-y-2">
                {["All Departments", "Computer Science", "Information Technology", "Electronics"].map((d) => (
                  <label key={d} className="flex items-center gap-2 cursor-pointer">
                    <div
                      className="w-4 h-4 rounded flex items-center justify-center"
                      style={{ background: d === "All Departments" ? C.indigo : "#EEF2FF", border: `1px solid ${d === "All Departments" ? C.indigo : "rgba(79,70,229,0.2)"}` }}
                    >
                      {d === "All Departments" && <Check size={10} className="text-white" />}
                    </div>
                    <span className="text-sm" style={{ color: "var(--foreground)" }}>
                      {d}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!selectedType || generating}
              className="w-full py-3 rounded-xl text-sm font-600 text-white transition-all flex items-center justify-center gap-2"
              style={{
                background: selectedType
                  ? "linear-gradient(135deg, #4F46E5, #7C3AED)"
                  : "#E5E7EB",
                cursor: selectedType ? "pointer" : "not-allowed",
              }}
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : generated ? (
                <>
                  <Check size={14} />
                  Report Ready — Download
                </>
              ) : (
                <>
                  <FileText size={14} />
                  Generate Report
                </>
              )}
            </button>
          </Card>
        </div>
      </div>

      {/* Recent Reports */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display" style={{ color: "var(--foreground)" }}>
            Recent Reports
          </h2>
          <button
            className="text-xs font-500 px-3 py-1.5 rounded-lg flex items-center gap-1"
            style={{ background: "#EEF2FF", color: C.indigo }}
          >
            <Filter size={12} />
            Filter
          </button>
        </div>
        <div className="overflow-hidden rounded-xl" style={{ border: "1px solid rgba(79,70,229,0.08)" }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: "#F8F9FF" }}>
                {["Report Name", "Type", "Generated On", "File Size", "Format", "Download"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-600 uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentReports.map((r, i) => (
                <tr
                  key={r.name}
                  className="hover:bg-indigo-50/30 transition-colors"
                  style={{ borderTop: i > 0 ? "1px solid rgba(79,70,229,0.06)" : "none" }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <FileText size={14} style={{ color: "var(--muted-foreground)" }} />
                      <span className="text-sm font-500" style={{ color: "var(--foreground)" }}>
                        {r.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full font-500" style={typeColors[r.type]}>
                      {r.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-sm" style={{ color: "var(--muted-foreground)" }}>
                      <Calendar size={12} />
                      {r.date}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--muted-foreground)" }}>
                    {r.size}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-md font-600"
                      style={{ background: formatColors[r.format], color: "var(--foreground)" }}
                    >
                      {r.format}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="flex items-center gap-1.5 text-xs font-500 px-3 py-1.5 rounded-lg transition-colors"
                      style={{ background: "#EEF2FF", color: C.indigo }}
                    >
                      <Download size={11} />
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
