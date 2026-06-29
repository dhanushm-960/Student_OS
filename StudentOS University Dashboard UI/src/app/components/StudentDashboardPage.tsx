import { useMemo, useState, useEffect } from "react";
import {
  Coffee, CircleDollarSign, CheckCircle2, Clock3, Sparkles, Zap,
  CalendarDays, ClipboardList, Briefcase, Star, Activity, MessageSquare, BarChart3,
  ArrowRight, TrendingUp, BookOpen, CheckCircle, Plus, Trash2
} from "lucide-react";
import { apiRequest } from "../utils/api";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl bg-white/95 border border-slate-200/70 shadow-sm shadow-slate-950/5 p-5 ${className}`}>
      {children}
    </div>
  );
}

function progressColor(value: number) {
  if (value >= 80) return "bg-emerald-500";
  if (value >= 60) return "bg-sky-500";
  return "bg-amber-500";
}

function formatDueDate(dateStr: string) {
  const due = new Date(dateStr);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Overdue";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays <= 7) return `${diffDays} days`;
  return due.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

const suggestions = [
  "Ask the AI mentor for a weekly study plan.",
  "Schedule a mock interview for next week.",
  "Review your placement readiness score.",
  "Add a new task to today's planner.",
];

/* ── Add Assignment Quick Modal ── */
function AddAssignmentModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !course.trim() || !dueDate) {
      setError("All fields are required.");
      return;
    }
    setLoading(true);
    try {
      await apiRequest("/api/student/assignments", {
        method: "POST",
        body: JSON.stringify({ title: title.trim(), course: course.trim(), dueDate }),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to add assignment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Add Assignment</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">✕</button>
        </div>
        {error && <div className="p-3 mb-3 rounded-xl bg-rose-50 text-rose-600 text-xs text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Assignment title" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-400 transition" />
          <input type="text" value={course} onChange={(e) => setCourse(e.target.value)} placeholder="Course name" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-400 transition" />
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-400 transition" />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition" disabled={loading}>Cancel</button>
            <button type="submit" className="px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition" disabled={loading}>{loading ? "Adding..." : "Add"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Add Goal Quick Modal ── */
function AddGoalModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("General");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Goal title is required.");
      return;
    }
    setLoading(true);
    try {
      await apiRequest("/api/student/goals", {
        method: "POST",
        body: JSON.stringify({ title: title.trim(), type }),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to add goal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Add Goal</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">✕</button>
        </div>
        {error && <div className="p-3 mb-3 rounded-xl bg-rose-50 text-rose-600 text-xs text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Goal title" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-400 transition" />
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-400 transition">
            <option value="General">General</option>
            <option value="DSA">DSA</option>
            <option value="GPA">GPA</option>
            <option value="Project">Project</option>
            <option value="Placement">Placement</option>
          </select>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition" disabled={loading}>Cancel</button>
            <button type="submit" className="px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition" disabled={loading}>{loading ? "Adding..." : "Add"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function StudentDashboardPage({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [profileData, setProfileData] = useState<any>(null);
  const [progressData, setProgressData] = useState<any>(null);
  const [aiRecs, setAiRecs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);

  const fetchData = async () => {
    try {
      const [profileRes, progressRes, aiRes] = await Promise.all([
        apiRequest("/api/student/profile"),
        apiRequest("/api/student/progress"),
        apiRequest("/api/student/ai-recommendations").catch(err => {
          console.error("AI recommendations call failed:", err);
          return { success: false };
        })
      ]);
      if (profileRes.success && profileRes.profile) {
        setProfileData(profileRes.profile);
      } else {
        setError("Failed to load student profile data.");
      }
      if (progressRes.success) {
        setProgressData(progressRes);
      }
      if (aiRes.success) {
        setAiRecs(aiRes);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refreshProgress = async () => {
    try {
      const progressRes = await apiRequest("/api/student/progress");
      if (progressRes.success) setProgressData(progressRes);
      // Also recalculate placement
      const placementRes = await apiRequest("/api/student/recalculate-placement", { method: "POST" });
      if (placementRes.success) {
        setProfileData((prev: any) => ({
          ...prev,
          placement: placementRes.placementReadiness,
          placementBreakdown: placementRes.placementBreakdown,
        }));
      }
      const aiRes = await apiRequest("/api/student/ai-recommendations").catch(() => null);
      if (aiRes && aiRes.success) {
        setAiRecs(aiRes);
      }
    } catch (err) {
      console.error("Failed to refresh progress:", err);
    }
  };

  const readiness = profileData?.placement || 0;

  // Live assignments from DB
  const liveAssignments = useMemo(() => {
    if (!progressData?.assignments || progressData.assignments.length === 0) return [];
    return progressData.assignments.map((a: any) => ({
      id: a._id,
      title: a.title,
      course: a.course,
      due: formatDueDate(a.dueDate),
      status: a.status,
      priority: a.priority || "Medium",
    }));
  }, [progressData?.assignments]);

  // Live goals from DB
  const liveGoals = useMemo(() => {
    if (!progressData?.goals || progressData.goals.length === 0) return [];
    return progressData.goals.map((g: any) => ({
      id: g._id,
      title: g.title,
      progress: g.progress,
      type: g.type,
      completed: g.completed,
    }));
  }, [progressData?.goals]);

  // Upcoming deadlines derived from live assignments
  const deadlines = useMemo(() => {
    if (!progressData?.assignments) return [];
    return progressData.assignments
      .filter((a: any) => a.status !== "Completed")
      .slice(0, 3)
      .map((a: any) => ({
        label: a.title,
        date: formatDueDate(a.dueDate),
        time: new Date(a.dueDate).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        type: a.course,
      }));
  }, [progressData?.assignments]);

  const completion = useMemo(() => {
    if (!liveAssignments.length) return 0;
    return Math.round((liveAssignments.filter((t: any) => t.status !== "Not started").length / liveAssignments.length) * 100);
  }, [liveAssignments]);

  const studentSkills = useMemo(() => {
    if (!profileData?.skills || profileData.skills.length === 0) {
      return [
        { name: "No skills configured", level: "Go to Onboarding", progress: 0 }
      ];
    }
    return profileData.skills.map((skillName: string, index: number) => {
      const progresses = [85, 75, 65, 80, 70];
      const levels = ["Advanced", "Intermediate", "Beginner"];
      return {
        name: skillName,
        level: levels[index % levels.length],
        progress: progresses[index % progresses.length]
      };
    });
  }, [profileData?.skills]);

  const handleSuggestionClick = (item: string) => {
    if (!onNavigate) return;
    if (item === "Ask the AI mentor for a weekly study plan.") {
      onNavigate("ai-mentor");
    } else if (item === "Schedule a mock interview for next week." || item === "Review your placement readiness score.") {
      onNavigate("placement-student");
    } else if (item === "Add a new task to today's planner.") {
      onNavigate("planner");
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    try {
      await apiRequest(`/api/student/assignments/${id}`, { method: "DELETE" });
      refreshProgress();
    } catch (err) {
      console.error("Failed to delete assignment:", err);
    }
  };

  const handleUpdateAssignmentStatus = async (id: string, newStatus: string) => {
    try {
      await apiRequest(`/api/student/assignments/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      refreshProgress();
    } catch (err) {
      console.error("Failed to update assignment:", err);
    }
  };

  // Recent activity from real data
  const activity = useMemo(() => {
    const items: { label: string; detail: string; time: string }[] = [];
    if (progressData?.assignments) {
      const completed = progressData.assignments.filter((a: any) => a.status === "Completed");
      completed.slice(0, 2).forEach((a: any) => {
        items.push({ label: "Completed assignment", detail: a.title, time: new Date(a.updatedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) });
      });
    }
    if (progressData?.projects) {
      progressData.projects.slice(0, 1).forEach((p: any) => {
        items.push({ label: "Added project", detail: p.title, time: new Date(p.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) });
      });
    }
    if (items.length === 0) {
      items.push({ label: "Welcome to StudentOS", detail: "Start adding assignments and goals to track your progress!", time: "Now" });
    }
    return items.slice(0, 3);
  }, [progressData]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Loading dashboard statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="rounded-3xl border border-rose-200/50 bg-rose-50 p-6 max-w-md text-center">
          <p className="text-rose-600 font-semibold mb-2">Error Loading Dashboard</p>
          <p className="text-sm text-rose-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.75fr_0.9fr]">
      {showAddAssignment && <AddAssignmentModal onClose={() => setShowAddAssignment(false)} onSuccess={refreshProgress} />}
      {showAddGoal && <AddGoalModal onClose={() => setShowAddGoal(false)} onSuccess={refreshProgress} />}

      <div className="space-y-6">
        {/* Today's AI Recommendation Hero Card */}
        {aiRecs && aiRecs.recommendations && aiRecs.recommendations.length > 0 && (
          <div 
            className="rounded-3xl p-6 border border-indigo-100 shadow-sm relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #4F46E5 0%, #312E81 100%)",
            }}
          >
            {/* Background elements */}
            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 rounded-full bg-indigo-400/20 blur-3xl" />
            <div className="absolute bottom-[-25%] left-[5%] w-72 h-72 rounded-full bg-violet-500/10 blur-3xl" />

            <div className="relative z-10 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={18} className="text-indigo-200 animate-pulse" />
                <span className="text-xs uppercase tracking-widest font-bold text-indigo-200">Today's AI Recommendation</span>
              </div>

              <h3 className="text-lg font-semibold mb-1">Optimize your Corporate Placement Readiness</h3>
              <p className="text-xs text-indigo-200 mb-6">Based on your dynamic CGPA, resume checks, active project count, and target company criteria.</p>

              <div className="grid gap-4 md:grid-cols-3 mb-6">
                {aiRecs.recommendations.map((rec: any, idx: number) => (
                  <div 
                    key={idx} 
                    className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-semibold text-sm text-white">{rec.title}</h4>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold shrink-0">
                          +{rec.impact}%
                        </span>
                      </div>
                      <p className="text-xs text-indigo-100/90 leading-relaxed">{rec.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-white/10 pt-4 gap-3 text-xs text-indigo-200">
                <div className="flex items-center gap-4">
                  <div>
                    <span>Current Readiness:</span>
                    <strong className="text-white ml-1.5 text-sm">{aiRecs.currentReadiness}%</strong>
                  </div>
                  <div className="w-px h-3 bg-white/20" />
                  <div>
                    <span>Est. Readiness After Completion:</span>
                    <strong className="text-emerald-300 ml-1.5 text-sm">{aiRecs.predictedAfterCompletion}%</strong>
                  </div>
                </div>
                <button 
                  onClick={() => onNavigate?.("placement-student")}
                  className="px-4 py-2 bg-white text-indigo-950 font-bold rounded-xl hover:bg-indigo-50 transition shadow-sm self-start sm:self-auto text-xs"
                >
                  Review actions checklist
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">Welcome back, {profileData?.name || "Student"}</p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-900">Focus on your next milestone</h2>
                <p className="mt-2 text-sm text-slate-500">
                  {liveAssignments.length > 0
                    ? `You have ${liveAssignments.filter((a: any) => a.status !== "Completed").length} pending task${liveAssignments.filter((a: any) => a.status !== "Completed").length !== 1 ? "s" : ""}. Let's keep the momentum going.`
                    : "Add your first assignment to get started!"}
                </p>
              </div>
              <div className="rounded-3xl bg-indigo-500/10 p-3 text-indigo-600">
                <Sparkles size={32} />
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              {[
                { label: "CGPA", value: profileData?.gpa ? profileData.gpa.toFixed(2) : "0.0" },
                { label: "Attendance", value: `${profileData?.attendance || 0}%` },
                { label: "Completed Credits", value: `${profileData?.completedCredits || 0}` },
              ].map((item) => (
                <div key={item.label} className="rounded-3xl bg-slate-50 px-4 py-3 min-w-[110px]">
                  <p className="text-[0.8rem] uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-500">Placement readiness</p>
                <h3 className="mt-2 text-3xl font-semibold text-slate-900">{readiness}%</h3>
              </div>
              <div className="rounded-3xl bg-slate-100 p-3 text-slate-700">
                <Briefcase size={24} />
              </div>
            </div>
            <div className="rounded-3xl bg-slate-100 p-4 space-y-3">
              {[
                { label: "Resume Score", value: profileData?.placementBreakdown?.resume || 0 },
                { label: "DSA & Coding", value: profileData?.placementBreakdown?.dsa || 0 },
                { label: "Projects Score", value: profileData?.placementBreakdown?.projects || 0 },
                { label: "Communication", value: profileData?.placementBreakdown?.communication || 0 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1.5 text-xs text-slate-500">
                    <span>{item.label}</span>
                    <span>{item.value}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-1.5 rounded-full bg-indigo-500" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">Projects</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{progressData?.projects?.length || 0}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">Goals set</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{progressData?.goals?.length || 0}</p>
              </div>
            </div>
            <button onClick={() => onNavigate?.("placement-student")} className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">
              <ArrowRight size={16} />
              Review readiness checklist
            </button>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-500">Your tasks</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">
                  {liveAssignments.length > 0 ? `${liveAssignments.filter((a: any) => a.status !== "Completed").length} pending` : "No tasks yet"}
                </h3>
              </div>
              <button onClick={() => setShowAddAssignment(true)} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 inline-flex items-center gap-1">
                <Plus size={14} /> Add task
              </button>
            </div>
            <div className="mt-5 space-y-3">
              {liveAssignments.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 p-6 text-center">
                  <p className="text-sm text-slate-400">No assignments yet. Click "Add task" to create one!</p>
                </div>
              ) : (
                liveAssignments.slice(0, 5).map((task: any) => (
                  <div key={task.id} className="flex flex-col gap-3 rounded-3xl border border-slate-200/80 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{task.title}</p>
                      <p className="text-sm text-slate-500">{task.course}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={task.status}
                        onChange={(e) => handleUpdateAssignmentStatus(task.id, e.target.value)}
                        className={`rounded-full px-3 py-1 text-xs font-medium border cursor-pointer transition ${
                          task.status === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          task.status === "In progress" ? "bg-sky-50 text-sky-700 border-sky-200" :
                          "bg-white text-slate-600 border-slate-200"
                        }`}
                      >
                        <option value="Not started">Not started</option>
                        <option value="In progress">In progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                      <span className="text-sm text-slate-500">{task.due}</span>
                      <button onClick={() => handleDeleteAssignment(task.id)} className="text-slate-300 hover:text-rose-500 transition">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-500">Upcoming deadlines</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">
                {deadlines.length > 0 ? `Next ${deadlines.length} item${deadlines.length !== 1 ? "s" : ""}` : "All clear!"}
              </h3>
            </div>
            <div className="space-y-3">
              {deadlines.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 p-6 text-center">
                  <p className="text-sm text-slate-400">No upcoming deadlines. Great job staying on top of things!</p>
                </div>
              ) : (
                deadlines.map((item: any) => (
                  <div key={item.label} className="rounded-3xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{item.label}</p>
                        <p className="text-sm text-slate-500">{item.type}</p>
                      </div>
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">{item.date}</span>
                    </div>
                    <p className="mt-3 text-sm text-slate-500">Due by {item.time}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-500">Skill progress</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">Top skills</h3>
              </div>
              <Star size={20} className="text-amber-400" />
            </div>
            <div className="mt-5 space-y-4">
              {studentSkills.map((skill: any) => (
                <div key={skill.name}>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div>
                      <p className="font-semibold text-slate-900">{skill.name}</p>
                      <p className="text-sm text-slate-500">{skill.level}</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{skill.progress}%</p>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className={`h-2 rounded-full ${progressColor(skill.progress)}`} style={{ width: `${skill.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-500">Goal progress</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">Your goals</h3>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowAddGoal(true)} className="rounded-full p-1 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition">
                  <Plus size={18} />
                </button>
                <CheckCircle2 size={22} className="text-emerald-500" />
              </div>
            </div>
            <div className="mt-5 space-y-4">
              {liveGoals.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 p-6 text-center">
                  <p className="text-sm text-slate-400">No goals set yet. Click + to add your first goal!</p>
                </div>
              ) : (
                liveGoals.map((goal: any) => (
                  <div key={goal.id}>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900">{goal.title}</p>
                        <span className="text-[0.65rem] rounded-full bg-indigo-50 px-2 py-0.5 text-indigo-600 font-medium">{goal.type}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">{goal.progress}%</p>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                      <div className={`h-2 rounded-full ${progressColor(goal.progress)}`} style={{ width: `${goal.progress}%` }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      <aside className="space-y-6">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-500">AI Mentor</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">Need a study plan?</h3>
            </div>
            <Zap size={22} className="text-violet-500" />
          </div>
          <p className="mt-4 text-sm text-slate-500">Ask the AI Mentor for guidance on assignments, career prep, or skill growth.</p>
          <div className="mt-5 grid gap-3">
            {suggestions.map((item) => (
              <button
                key={item}
                onClick={() => handleSuggestionClick(item)}
                className="rounded-3xl border border-slate-200 px-4 py-3 text-left text-sm text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50"
              >
                {item}
              </button>
            ))}
          </div>
          <button onClick={() => onNavigate?.("ai-mentor")} className="mt-5 inline-flex items-center justify-center gap-2 w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">
            <MessageSquare size={16} />
            Open AI Mentor
          </button>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-500">Recent activity</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">What happened recently</h3>
            </div>
            <Activity size={22} className="text-slate-400" />
          </div>
          <div className="mt-5 space-y-3">
            {activity.map((item, idx) => (
              <div key={idx} className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4">
                <p className="font-medium text-slate-900">{item.label}</p>
                <p className="text-sm text-slate-500">{item.detail}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">{item.time}</p>
              </div>
            ))}
          </div>
          <button onClick={() => onNavigate?.("profile")} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
            <ArrowRight size={14} />
            See all activity
          </button>
        </Card>
      </aside>
    </div>
  );
}

export default StudentDashboardPage;
