import { useState, useEffect } from "react";
import { Search, Filter, ChevronDown, BookOpen, Target, Code, User, TrendingUp, Brain, Star, Trash2 } from "lucide-react";
import { apiRequest } from "../utils/api";

const C = {
  indigo: "#4F46E5",
  purple: "#7C3AED",
  green: "#10B981",
  amber: "#F59E0B",
  rose: "#F43F5E",
  cyan: "#06B6D4",
};

const departments = ["All", "CSE", "IT", "Electronics", "Mechanical", "Civil"];

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

/* ─── Add Student Modal Component ─── */
function AddStudentModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [department, setDepartment] = useState("CSE");
  const [year, setYear] = useState("1");
  const [gpa, setGpa] = useState("8.0");
  const [attendance, setAttendance] = useState("85");
  const [dsaProgress, setDsaProgress] = useState("70");
  const [projectsCompleted, setProjectsCompleted] = useState("3");
  const [placementReadiness, setPlacementReadiness] = useState("75");
  const [goalProgress, setGoalProgress] = useState("80");
  const [riskLevel, setRiskLevel] = useState("Low");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !rollNumber.trim() || !department) {
      setError("Please fill out all required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!email.endsWith("@atria.edu") && !email.endsWith("@atriauniversity.edu.in")) {
      setError("Only @atria.edu or @atriauniversity.edu.in emails are allowed.");
      return;
    }

    setLoading(true);
    try {
      await apiRequest("/api/admin/students", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          rollNumber: rollNumber.trim(),
          department,
          year: Number(year),
          gpa: Number(gpa),
          attendance: Number(attendance),
          dsaProgress: Number(dsaProgress),
          projectsCompleted: Number(projectsCompleted),
          placementReadiness: Number(placementReadiness),
          goalProgress: Number(goalProgress),
          riskLevel,
        }),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create student.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className="w-full max-w-lg rounded-3xl border border-white/10 p-6 shadow-2xl text-slate-100 overflow-y-auto max-h-[90vh]"
        style={{ background: "#0c0f1d" }}
      >
        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
          <h3 className="text-lg font-bold font-display text-white">Add New Student Profile</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">✕</button>
        </div>
        
        {error && (
          <div className="p-3 mb-4 rounded-xl text-xs bg-rose-500/10 border border-rose-500/25 text-rose-400 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rohan Sharma"
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-900/40 text-white text-sm focus:outline-none focus:border-indigo-500 transition"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">College Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rohan@atria.edu"
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-900/40 text-white text-sm focus:outline-none focus:border-indigo-500 transition"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Roll Number *</label>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="CSE21099"
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-900/40 text-white text-sm focus:outline-none focus:border-indigo-500 transition"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Department *</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-900/40 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition"
                disabled={loading}
              >
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="Electronics">Electronics</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Year (1–4)</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-900/40 text-slate-200 text-sm focus:outline-none"
                disabled={loading}
              >
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
                <option value="4">Year 4</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">GPA (0.0–10.0)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={gpa}
                onChange={(e) => setGpa(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-900/40 text-white text-sm focus:outline-none"
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Attendance (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={attendance}
                onChange={(e) => setAttendance(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-900/40 text-white text-sm focus:outline-none"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">DSA Progress (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={dsaProgress}
                onChange={(e) => setDsaProgress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-900/40 text-white text-sm focus:outline-none"
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Placement (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={placementReadiness}
                onChange={(e) => setPlacementReadiness(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-900/40 text-white text-sm focus:outline-none"
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Projects Count</label>
              <input
                type="number"
                min="0"
                value={projectsCompleted}
                onChange={(e) => setProjectsCompleted(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-900/40 text-white text-sm focus:outline-none"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Goal Progress (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={goalProgress}
                onChange={(e) => setGoalProgress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-900/40 text-white text-sm focus:outline-none"
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Risk Level</label>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-900/40 text-slate-200 text-sm focus:outline-none"
                disabled={loading}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
              disabled={loading}
            >
              {loading ? "Adding Student..." : "Add Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Profile Modal Component ─── */
function StudentProfileModal({ student, onClose, onDelete }: { student: any; onClose: () => void; onDelete: (id: string) => void }) {
  const [fullStudent, setFullStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function fetchDetails() {
      try {
        const data = await apiRequest(`/api/admin/students/${student.id}`);
        if (active) {
          setFullStudent(data.student);
        }
      } catch (err) {
        console.error("Failed to load student details:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchDetails();
    return () => { active = false; };
  }, [student.id]);

  const displayStudent = fullStudent || student;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,15,35,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: "white",
          boxShadow: "0 24px 64px rgba(79,70,229,0.2)",
        }}
      >
        {/* Header */}
        <div
          className="p-6 flex items-start justify-between gap-4"
          style={{ background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)" }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-700 flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.15)", fontSize: "1.25rem" }}
            >
              {displayStudent.name.split(" ").map((n: string) => n[0]).join("")}
            </div>
            <div>
              <h3 className="font-display text-white font-bold" style={{ fontSize: "1.125rem" }}>
                {displayStudent.name}
              </h3>
              <p className="text-indigo-300 text-sm mt-0.5">{displayStudent.roll} · {displayStudent.dept} · Year {displayStudent.year}</p>
              <div className="flex gap-2 mt-2">
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-500"
                  style={riskColors[displayStudent.risk] || riskColors.Low}
                >
                  {displayStudent.risk} Risk
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-500"
                  style={{ background: "rgba(255,255,255,0.15)", color: "white" }}
                >
                  CGPA: {displayStudent.gpa}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete ${displayStudent.name}?`)) {
                  onDelete(displayStudent.id);
                }
              }}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
            >
              Delete Profile
            </button>
            <button
              onClick={onClose}
              className="text-indigo-300 hover:text-white transition-colors text-xl leading-none cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Stats grid */}
        <div className="p-6 grid grid-cols-3 gap-4">
          {[
            { label: "Placement Readiness", value: `${displayStudent.placement}%`, icon: Target, color: C.indigo, bg: "#EEF2FF" },
            { label: "Attendance", value: `${displayStudent.attendance}%`, icon: BookOpen, color: C.green, bg: "#ECFDF5" },
            { label: "DSA Progress", value: `${displayStudent.dsa}%`, icon: Code, color: C.purple, bg: "#F5F3FF" },
            { label: "Projects Completed", value: `${displayStudent.projects}`, icon: Star, color: C.amber, bg: "#FFFBEB" },
            { label: "Goal Progress", value: `${displayStudent.goals}%`, icon: TrendingUp, color: C.cyan, bg: "#ECFEFF" },
            { label: "Academic Score", value: `${displayStudent.gpa}/10`, icon: User, color: C.rose, bg: "#FFF1F2" },
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
                <div className="font-display font-700 font-bold" style={{ fontSize: "1.25rem", color: "var(--foreground)" }}>
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

        {/* Placement Readiness Breakdown */}
        <div
          className="mx-6 mb-4 p-4 rounded-xl"
          style={{ background: "#F8F9FF", border: "1px solid rgba(79,70,229,0.08)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Target size={14} style={{ color: C.indigo }} />
            <span className="text-xs font-600" style={{ color: C.indigo }}>
              Placement Readiness Breakdown
            </span>
          </div>
          <div className="space-y-2.5">
            {[
              { label: "Resume", value: displayStudent.placementBreakdown?.resume || 0, color: C.indigo },
              { label: "Projects", value: displayStudent.placementBreakdown?.projects || 0, color: C.green },
              { label: "DSA & Coding", value: displayStudent.placementBreakdown?.dsa || 0, color: C.purple },
              { label: "Communication", value: displayStudent.placementBreakdown?.communication || 0, color: C.cyan },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{item.label}</span>
                  <span className="text-xs font-600" style={{ color: "var(--foreground)" }}>{item.value}%</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: "#EEF2FF" }}>
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${item.value}%`, background: `linear-gradient(90deg, ${item.color}, ${C.purple})` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Career & Skills */}
        {(displayStudent.careerGoal || (displayStudent.skills && displayStudent.skills.length > 0)) && (
          <div
            className="mx-6 mb-4 p-4 rounded-xl"
            style={{ background: "#ECFEFF", border: "1px solid rgba(6,182,212,0.15)" }}
          >
            {displayStudent.careerGoal && (
              <div className="mb-2">
                <span className="text-xs font-600" style={{ color: C.cyan }}>Career Goal: </span>
                <span className="text-xs" style={{ color: "#0E7490" }}>{displayStudent.careerGoal}</span>
              </div>
            )}
            {displayStudent.skills && displayStudent.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {displayStudent.skills.map((skill: string, i: number) => (
                  <span
                    key={i}
                    className="text-[0.65rem] px-2 py-0.5 rounded-full font-500"
                    style={{ background: "rgba(6,182,212,0.1)", color: "#0E7490" }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AI Recommendations */}
        <div
          className="mx-6 mb-6 p-4 rounded-xl"
          style={{ background: "#EEF2FF", border: "1px solid rgba(79,70,229,0.15)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Brain size={14} style={{ color: C.indigo }} />
            <span className="text-xs font-600" style={{ color: C.indigo }}>
              AI Recommendations for {displayStudent.name.split(" ")[0]}
            </span>
          </div>
          {loading ? (
            <div className="text-xs text-indigo-400 animate-pulse">Running AI analysis...</div>
          ) : (
            <ul className="space-y-1">
              {displayStudent.aiRecommendations && displayStudent.aiRecommendations.length > 0 ? (
                displayStudent.aiRecommendations.map((rec: string, index: number) => (
                  <li key={index} className="text-xs" style={{ color: "#4338CA" }}>
                    • {rec}
                  </li>
                ))
              ) : (
                <>
                  {displayStudent.dsa < 70 && (
                    <li className="text-xs" style={{ color: "#4338CA" }}>
                      • Complete DSA practice problems daily — target 5 LeetCode problems/week
                    </li>
                  )}
                  {displayStudent.attendance < 75 && (
                    <li className="text-xs" style={{ color: "#4338CA" }}>
                      • Attendance below threshold — schedule advisor meeting immediately
                    </li>
                  )}
                  {displayStudent.projects < 4 && (
                    <li className="text-xs" style={{ color: "#4338CA" }}>
                      • Enroll in at least 2 more projects to strengthen portfolio
                    </li>
                  )}
                  {displayStudent.placement > 80 && (
                    <li className="text-xs" style={{ color: "#4338CA" }}>
                      • Excellent placement readiness — apply for dream company roles now
                    </li>
                  )}
                  <li className="text-xs" style={{ color: "#4338CA" }}>
                    • Participate in upcoming mock interview sessions this Friday
                  </li>
                </>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Send Notification Modal Component ─── */
function SendNotificationModal({ student, onClose }: { student: any; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("system");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await apiRequest("/api/admin/notifications", {
        method: "POST",
        body: JSON.stringify({
          studentId: student?.id || null, // null means broadcast
          title: title.trim(),
          type
        })
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to send notification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className="w-full max-w-md rounded-3xl border border-white/10 p-6 shadow-2xl text-slate-100"
        style={{ background: "#0c0f1d" }}
      >
        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
          <h3 className="text-lg font-bold font-display text-white">
            Send Notification to {student?.id ? student.name : "All Students"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">✕</button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl text-xs bg-rose-500/10 border border-rose-500/25 text-rose-400 text-center font-medium">
            {error}
          </div>
        )}

        {success ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm text-center font-medium my-6">
            Notification sent successfully!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Notification Text / Title</label>
              <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Schedule for CS-301 midterms has been updated."
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-900/40 text-white text-sm focus:outline-none focus:border-indigo-500 transition resize-none"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Notification Category</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-900/40 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition"
                disabled={loading}
              >
                <option value="system">System (General)</option>
                <option value="academic">Academic (Grades, courses)</option>
                <option value="placement">Placement (Interviews, matches)</option>
                <option value="financial">Financial (Tuition, bills)</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 transition cursor-pointer"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg cursor-pointer"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Notification"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ─── Main Students Directory Page ─── */
export function StudentsPage() {
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("All");
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [notificationStudent, setNotificationStudent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiRequest("/api/admin/students", {
        params: { search, dept }
      });
      setStudents(data.students);
    } catch (err: any) {
      setError(err.message || "Failed to fetch students from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, dept]);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete student ${name}?`)) {
      try {
        await apiRequest(`/api/admin/students/${id}`, {
          method: "DELETE"
        });
        fetchStudents();
      } catch (err: any) {
        alert(err.message || "Failed to delete student.");
      }
    }
  };

  const handleModalDelete = async (id: string) => {
    try {
      await apiRequest(`/api/admin/students/${id}`, {
        method: "DELETE"
      });
      setSelectedStudent(null);
      fetchStudents();
    } catch (err: any) {
      alert(err.message || "Failed to delete student.");
    }
  };

  // Compute summary stats dynamically from student list
  const totalCount = students.length;
  const placementReadyCount = students.filter((s) => s.placement >= 80).length;
  const atRiskCount = students.filter((s) => s.risk === "High").length;
  const avgGpa = totalCount > 0 
    ? (students.reduce((acc, s) => acc + s.gpa, 0) / totalCount).toFixed(1)
    : "0.0";

  return (
    <div>
      {selectedStudent && (
        <StudentProfileModal 
          student={selectedStudent} 
          onClose={() => setSelectedStudent(null)} 
          onDelete={handleModalDelete}
        />
      )}

      {notificationStudent && (
        <SendNotificationModal 
          student={notificationStudent} 
          onClose={() => setNotificationStudent(null)} 
        />
      )}

      {showAddModal && (
        <AddStudentModal 
          onClose={() => setShowAddModal(false)} 
          onSuccess={fetchStudents}
        />
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Students", value: loading ? "..." : totalCount.toLocaleString(), color: C.indigo, bg: "#EEF2FF" },
          { label: "Placement Ready", value: loading ? "..." : placementReadyCount.toLocaleString(), color: C.green, bg: "#ECFDF5" },
          { label: "At Risk", value: loading ? "..." : atRiskCount.toLocaleString(), color: C.rose, bg: "#FFF1F2" },
          { label: "Avg. CGPA", value: loading ? "..." : avgGpa, color: C.amber, bg: "#FFFBEB" },
        ].map((s) => (
          <Card key={s.label}>
            <div className="font-display font-700 font-bold mb-1" style={{ fontSize: "1.75rem", color: "var(--foreground)", lineHeight: 1.1 }}>
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
        <div className="flex items-center justify-between gap-3 mb-5">
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

          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              {departments.map((d) => (
                <button
                  key={d}
                  onClick={() => setDept(d)}
                  className="px-3 py-1.5 rounded-lg text-xs font-500 transition-all cursor-pointer"
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
            
            <button
              onClick={() => setNotificationStudent({ id: null, name: "All Students" })}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all shadow-md shadow-purple-600/10 cursor-pointer"
              style={{ background: C.purple }}
            >
              Broadcast Notify
            </button>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
              style={{ background: C.indigo }}
            >
              + Add Student
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 mb-4 rounded-xl text-sm bg-rose-500/10 border border-rose-500/20 text-rose-400 text-center">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-hidden rounded-xl" style={{ border: "1px solid rgba(79,70,229,0.08)" }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: "#F8F9FF" }}>
                {["Student", "Roll No.", "Year", "CGPA", "Attendance", "Placement Readiness", "Risk", "Actions"].map((h) => (
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
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" />
                      <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                      <span className="ml-1 text-indigo-500 font-medium">Loading student records...</span>
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-400">
                    No student records found in the database.
                  </td>
                </tr>
              ) : (
                students.map((s, i) => (
                  <tr
                    key={s.id}
                    className="cursor-pointer transition-colors hover:bg-indigo-50/30"
                    style={{ borderTop: i > 0 ? "1px solid rgba(79,70,229,0.06)" : "none" }}
                    onClick={() => setSelectedStudent(s)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-700"
                          style={{ background: `linear-gradient(135deg, ${C.indigo}, ${C.purple})` }}
                        >
                          {s.name.split(" ").map((n: string) => n[0]).join("")}
                        </div>
                        <div>
                          <div className="text-sm font-500 text-slate-900" style={{ color: "var(--foreground)" }}>
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
                        style={riskColors[s.risk] || riskColors.Low}
                      >
                        {s.risk}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <button
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                          style={{ color: C.indigo, background: "#EEF2FF" }}
                          onClick={() => setSelectedStudent(s)}
                        >
                          View Profile
                        </button>
                        <button
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                          style={{ color: C.purple, background: "#F5F3FF" }}
                          onClick={() => setNotificationStudent(s)}
                        >
                          Notify
                        </button>
                        <button
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors text-rose-600 bg-rose-50 hover:bg-rose-100/70 cursor-pointer"
                          onClick={() => handleDelete(s.id, s.name)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
