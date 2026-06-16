import { useState } from "react";
import { Search, Filter, ChevronDown, BookOpen, Target, Code, User, TrendingUp, Brain, Star } from "lucide-react";

const C = {
  indigo: "#4F46E5",
  purple: "#7C3AED",
  green: "#10B981",
  amber: "#F59E0B",
  rose: "#F43F5E",
  cyan: "#06B6D4",
};

const departments = ["All", "CSE", "IT", "Electronics", "Mechanical", "Civil"];
const readinessLevels = ["All", "High (80%+)", "Medium (50-79%)", "Low (<50%)"];

const students = [
  { id: 1, name: "Aryan Kapoor", roll: "CSE21001", dept: "CSE", year: 3, gpa: 8.9, attendance: 92, dsa: 82, projects: 5, placement: 88, goals: 75, risk: "Low" },
  { id: 2, name: "Sneha Iyer", roll: "IT21042", dept: "IT", year: 4, gpa: 9.2, attendance: 95, dsa: 91, projects: 8, placement: 95, goals: 90, risk: "Low" },
  { id: 3, name: "Rohan Verma", roll: "CSE21019", dept: "CSE", year: 3, gpa: 7.4, attendance: 78, dsa: 60, projects: 3, placement: 62, goals: 55, risk: "Medium" },
  { id: 4, name: "Priya Suresh", roll: "ECE21007", dept: "Electronics", year: 2, gpa: 8.1, attendance: 88, dsa: 55, projects: 2, placement: 58, goals: 62, risk: "Medium" },
  { id: 5, name: "Karan Singh", roll: "MECH21033", dept: "Mechanical", year: 4, gpa: 6.8, attendance: 61, dsa: 32, projects: 1, placement: 35, goals: 28, risk: "High" },
  { id: 6, name: "Nisha Patel", roll: "IT21056", dept: "IT", year: 3, gpa: 9.0, attendance: 94, dsa: 88, projects: 6, placement: 91, goals: 85, risk: "Low" },
  { id: 7, name: "Amit Sharma", roll: "CIV21004", dept: "Civil", year: 2, gpa: 7.2, attendance: 72, dsa: 28, projects: 1, placement: 32, goals: 40, risk: "High" },
  { id: 8, name: "Deepika Rao", roll: "CSE21078", dept: "CSE", year: 4, gpa: 9.5, attendance: 97, dsa: 96, projects: 10, placement: 97, goals: 95, risk: "Low" },
];

const riskColors: Record<string, { bg: string; text: string }> = {
  Low: { bg: "#ECFDF5", text: "#059669" },
  Medium: { bg: "#FFFBEB", text: "#D97706" },
  High: { bg: "#FFF1F2", text: "#F43F5E" },
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

function StudentProfileModal({ student, onClose }: { student: typeof students[0]; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,15,35,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden"
        style={{
          background: "white",
          boxShadow: "0 24px 64px rgba(79,70,229,0.2)",
        }}
      >
        {/* Header */}
        <div
          className="p-6 flex items-start gap-4"
          style={{ background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)" }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-700 flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.15)", fontSize: "1.25rem" }}
          >
            {student.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div className="flex-1">
            <h3 className="font-display text-white" style={{ fontSize: "1.125rem" }}>
              {student.name}
            </h3>
            <p className="text-indigo-300 text-sm mt-0.5">{student.roll} · {student.dept} · Year {student.year}</p>
            <div className="flex gap-2 mt-2">
              <span
                className="text-xs px-2 py-0.5 rounded-full font-500"
                style={riskColors[student.risk]}
              >
                {student.risk} Risk
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-500"
                style={{ background: "rgba(255,255,255,0.15)", color: "white" }}
              >
                CGPA: {student.gpa}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-indigo-300 hover:text-white transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Stats grid */}
        <div className="p-6 grid grid-cols-3 gap-4">
          {[
            { label: "Placement Readiness", value: `${student.placement}%`, icon: Target, color: C.indigo, bg: "#EEF2FF" },
            { label: "Attendance", value: `${student.attendance}%`, icon: BookOpen, color: C.green, bg: "#ECFDF5" },
            { label: "DSA Progress", value: `${student.dsa}%`, icon: Code, color: C.purple, bg: "#F5F3FF" },
            { label: "Projects Completed", value: `${student.projects}`, icon: Star, color: C.amber, bg: "#FFFBEB" },
            { label: "Goal Progress", value: `${student.goals}%`, icon: TrendingUp, color: C.cyan, bg: "#ECFEFF" },
            { label: "Academic Score", value: `${student.gpa}/10`, icon: User, color: C.rose, bg: "#FFF1F2" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="p-3 rounded-xl"
                style={{ background: "#F8F9FF", border: "1px solid rgba(79,70,229,0.08)" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: stat.bg }}
                  >
                    <Icon size={13} style={{ color: stat.color }} />
                  </div>
                  <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {stat.label}
                  </span>
                </div>
                <div className="font-display font-700" style={{ fontSize: "1.25rem", color: "var(--foreground)" }}>
                  {stat.value}
                </div>
                {typeof stat.value === "string" && stat.value.includes("%") && (
                  <div className="h-1.5 rounded-full mt-2" style={{ background: "#EEF2FF" }}>
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: stat.value,
                        background: `linear-gradient(90deg, ${stat.color}, ${C.purple})`,
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* AI Recommendations */}
        <div
          className="mx-6 mb-6 p-4 rounded-xl"
          style={{ background: "#EEF2FF", border: "1px solid rgba(79,70,229,0.15)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Brain size={14} style={{ color: C.indigo }} />
            <span className="text-xs font-600" style={{ color: C.indigo }}>
              AI Recommendations for {student.name.split(" ")[0]}
            </span>
          </div>
          <ul className="space-y-1">
            {student.dsa < 70 && (
              <li className="text-xs" style={{ color: "#4338CA" }}>
                • Complete DSA practice problems daily — target 5 LeetCode problems/week
              </li>
            )}
            {student.attendance < 75 && (
              <li className="text-xs" style={{ color: "#4338CA" }}>
                • Attendance below threshold — schedule advisor meeting immediately
              </li>
            )}
            {student.projects < 4 && (
              <li className="text-xs" style={{ color: "#4338CA" }}>
                • Enroll in at least 2 more projects to strengthen portfolio
              </li>
            )}
            {student.placement > 80 && (
              <li className="text-xs" style={{ color: "#4338CA" }}>
                • Excellent placement readiness — apply for dream company roles now
              </li>
            )}
            <li className="text-xs" style={{ color: "#4338CA" }}>
              • Participate in upcoming mock interview sessions this Friday
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export function StudentsPage() {
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("All");
  const [selectedStudent, setSelectedStudent] = useState<typeof students[0] | null>(null);

  const filtered = students.filter(
    (s) =>
      (dept === "All" || s.dept === dept) &&
      (s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.roll.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      {selectedStudent && (
        <StudentProfileModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Students", value: "12,450", color: C.indigo, bg: "#EEF2FF" },
          { label: "Placement Ready", value: "4,820", color: C.green, bg: "#ECFDF5" },
          { label: "At Risk", value: "132", color: C.rose, bg: "#FFF1F2" },
          { label: "Avg. CGPA", value: "7.9", color: C.amber, bg: "#FFFBEB" },
        ].map((s) => (
          <Card key={s.label}>
            <div className="font-display font-700 mb-1" style={{ fontSize: "1.75rem", color: "var(--foreground)", lineHeight: 1.1 }}>
              {s.value}
            </div>
            <div className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              {s.label}
            </div>
          </Card>
        ))}
      </div>

      <Card>
        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 max-w-sm"
            style={{ background: "#F8F9FF", border: "1px solid rgba(79,70,229,0.1)" }}
          >
            <Search size={14} style={{ color: "var(--muted-foreground)" }} />
            <input
              type="text"
              placeholder="Search by name or roll number..."
              className="flex-1 text-sm bg-transparent border-none outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ color: "var(--foreground)" }}
            />
          </div>

          <div className="flex gap-2">
            {departments.map((d) => (
              <button
                key={d}
                onClick={() => setDept(d)}
                className="px-3 py-1.5 rounded-lg text-xs font-500 transition-all"
                style={{
                  background: dept === d ? C.indigo : "#F8F9FF",
                  color: dept === d ? "white" : "var(--muted-foreground)",
                  border: `1px solid ${dept === d ? C.indigo : "rgba(79,70,229,0.1)"}`,
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl" style={{ border: "1px solid rgba(79,70,229,0.08)" }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: "#F8F9FF" }}>
                {["Student", "Roll No.", "Year", "CGPA", "Attendance", "DSA", "Placement Readiness", "Risk", "Action"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-600 uppercase tracking-wide"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr
                  key={s.id}
                  className="cursor-pointer transition-colors hover:bg-indigo-50/50"
                  style={{ borderTop: i > 0 ? "1px solid rgba(79,70,229,0.06)" : "none" }}
                  onClick={() => setSelectedStudent(s)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-700"
                        style={{ background: `linear-gradient(135deg, ${C.indigo}, ${C.purple})` }}
                      >
                        {s.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <div className="text-sm font-500" style={{ color: "var(--foreground)" }}>
                          {s.name}
                        </div>
                        <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                          {s.dept}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--muted-foreground)" }}>
                    {s.roll}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--foreground)" }}>
                    Year {s.year}
                  </td>
                  <td className="px-4 py-3 text-sm font-600" style={{ color: "var(--foreground)" }}>
                    {s.gpa}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-sm font-500"
                      style={{ color: s.attendance < 75 ? C.rose : C.green }}
                    >
                      {s.attendance}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-16 rounded-full" style={{ background: "#EEF2FF" }}>
                        <div
                          className="h-1.5 rounded-full"
                          style={{ width: `${s.dsa}%`, background: C.purple }}
                        />
                      </div>
                      <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                        {s.dsa}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-16 rounded-full" style={{ background: "#EEF2FF" }}>
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${s.placement}%`,
                            background: `linear-gradient(90deg, ${C.indigo}, ${C.purple})`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-500" style={{ color: "var(--foreground)" }}>
                        {s.placement}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-600"
                      style={riskColors[s.risk]}
                    >
                      {s.risk}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="text-xs font-500 px-3 py-1 rounded-lg transition-colors"
                      style={{ color: C.indigo, background: "#EEF2FF" }}
                      onClick={(e) => { e.stopPropagation(); setSelectedStudent(s); }}
                    >
                      View Profile
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
