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
  const [plannerPlan, setPlannerPlan] = useState<any>(null);
  const [recruiterMatches, setRecruiterMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);

  const fetchData = async () => {
    try {
      // 1. Fetch fast data
      const [profileRes, progressRes, plannerRes, matchesRes] = await Promise.all([
        apiRequest("/api/student/profile"),
        apiRequest("/api/student/progress"),
        apiRequest("/api/student/planner-data").catch(err => {
          console.error("Planner data call failed:", err);
          return { success: false };
        }),
        apiRequest("/api/companies/matches").catch(err => {
          console.error("Matches call failed:", err);
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
      if (plannerRes.success) {
        setPlannerPlan(plannerRes.planHistory);
      }
      if (matchesRes.success) {
        setRecruiterMatches(matchesRes.matches || []);
      }
      
      // Set loading to false so UI renders immediately
      setLoading(false);

      // 2. Fetch slow AI recommendations in the background
      apiRequest("/api/student/ai-recommendations").then(aiRes => {
        if (aiRes.success) {
          setAiRecs(aiRes);
        }
      }).catch(err => {
        console.error("AI recommendations call failed:", err);
      });

    } catch (err: any) {
      setError(err.message || "An error occurred while fetching data.");
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
      
      const [plannerRes, matchesRes] = await Promise.all([
        apiRequest("/api/student/planner-data").catch(() => null),
        apiRequest("/api/companies/matches").catch(() => null)
      ]);
      
      if (plannerRes && plannerRes.success) {
        setPlannerPlan(plannerRes.planHistory);
      }
      if (matchesRes && matchesRes.success) {
        setRecruiterMatches(matchesRes.matches || []);
      }
      
      // Fetch slow AI recs in background
      apiRequest("/api/student/ai-recommendations").then(aiRes => {
        if (aiRes && aiRes.success) {
          setAiRecs(aiRes);
        }
      }).catch(() => null);

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

      {/* LEFT COLUMN: Hero Card & Today's Plan */}
      <div className="space-y-6">
        
        {/* 1. HERO CARD (Today's Focus Recommendation) */}
        <div 
          className="rounded-3xl p-6 border border-indigo-100 shadow-sm relative overflow-hidden text-white"
          style={{
            background: "linear-gradient(135deg, #4F46E5 0%, #312E81 100%)",
          }}
        >
          {/* Decorative Blur Backgrounds */}
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 rounded-full bg-indigo-400/20 blur-3xl" />
          <div className="absolute bottom-[-25%] left-[5%] w-72 h-72 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col justify-between min-h-[220px]">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-indigo-200 animate-pulse" />
                  <span className="text-xs uppercase tracking-widest font-bold text-indigo-200">📌 Today's Focus</span>
                </div>
                <div className="text-right">
                  <span className="text-[0.65rem] text-indigo-200 block uppercase tracking-wider font-semibold">Placement Readiness</span>
                  <span className="text-xl font-bold text-white">{readiness}%</span>
                </div>
              </div>

              {aiRecs && aiRecs.recommendations && aiRecs.recommendations.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold tracking-tight">
                    {aiRecs.recommendations[0].title}
                  </h3>
                  <p className="text-sm text-indigo-100 max-w-xl leading-relaxed">
                    {aiRecs.recommendations[0].explanation}
                  </p>
                  <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs text-emerald-300 font-medium">
                    <span>Est. Readiness Boost: +{aiRecs.recommendations[0].impact}%</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold tracking-tight">No urgent actions today!</h3>
                  <p className="text-sm text-indigo-100">Your profile meets standard requirements. Review your matches checklist.</p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-white/10 pt-4 mt-6 gap-3">
              <div className="text-xs text-indigo-200 flex items-center gap-4">
                <div>
                  <span>Target placement readiness:</span>
                  <strong className="text-emerald-300 ml-1 text-sm">
                    {aiRecs ? aiRecs.predictedAfterCompletion : readiness}%
                  </strong>
                </div>
              </div>
              <button 
                onClick={() => onNavigate?.("placement-student")}
                className="px-5 py-2.5 bg-white text-indigo-950 font-bold rounded-2xl hover:bg-indigo-50 transition shadow-sm text-xs self-start sm:self-auto"
              >
                Start Today's Plan
              </button>
            </div>
          </div>
        </div>

        {/* 2. TODAY'S PLAN (Checklist of tasks) */}
        <Card>
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <p className="text-sm font-semibold text-slate-500">Today's schedule</p>
              <h3 className="text-xl font-semibold text-slate-900">
                {liveAssignments.length > 0 ? `${liveAssignments.filter((a: any) => a.status !== "Completed").length} pending tasks` : "All clear!"}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-medium">Total Workload</span>
              <span className="text-sm font-bold text-slate-700">
                {liveAssignments.length * 60} mins
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {liveAssignments.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
                <p className="text-sm text-slate-400">No scheduled tasks for today. Great job!</p>
                <button 
                  onClick={() => onNavigate?.("planner")}
                  className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mx-auto"
                >
                  <Plus size={14} /> Schedule a task
                </button>
              </div>
            ) : (
              liveAssignments.map((task: any) => (
                <div 
                  key={task.id} 
                  className={`flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between transition ${
                    task.status === "Completed" ? "bg-slate-50/50 border-slate-100" : "bg-white border-slate-200/80 shadow-sm"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button 
                      onClick={() => handleUpdateAssignmentStatus(task.id, task.status === "Completed" ? "Pending" : "Completed")}
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition ${
                        task.status === "Completed" ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 hover:border-indigo-400"
                      }`}
                    >
                      {task.status === "Completed" && <CheckCircle size={14} />}
                    </button>
                    <div>
                      <p className={`font-semibold text-sm ${task.status === "Completed" ? "line-through text-slate-400" : "text-slate-800"}`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-slate-400">{task.course} · 60 mins</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-slate-100">
                    <select
                      value={task.status}
                      onChange={(e) => handleUpdateAssignmentStatus(task.id, e.target.value)}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium border cursor-pointer transition ${
                        task.status === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        task.status === "In progress" ? "bg-sky-50 text-sky-700 border-sky-200" :
                        "bg-white text-slate-600 border-slate-200"
                      }`}
                    >
                      <option value="Not started">Not started</option>
                      <option value="In progress">In progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Missed">Missed</option>
                    </select>
                    <button 
                      onClick={() => handleDeleteAssignment(task.id)}
                      className="text-slate-300 hover:text-rose-500 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* RIGHT COLUMN: Progress Overview, Recruiter Matches & AI Mentor */}
      <div className="space-y-6">
        
        {/* 3. PROGRESS OVERVIEW */}
        <Card className="space-y-4">
          <div>
            <h3 className="text-sm uppercase tracking-widest text-slate-400 font-bold">Progress Dashboard</h3>
            <p className="text-xs text-slate-400">Consolidated analytics from database metrics.</p>
          </div>
          
          <div className="space-y-3.5">
            {[
              { label: "Placement Readiness", value: readiness },
              { label: "Resume Score", value: profileData?.resumeDetails?.score || 0 }
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1 text-xs text-slate-500 font-semibold">
                  <span>{item.label}</span>
                  <span>{item.value}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-1.5 rounded-full ${progressColor(item.value)}`} style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Recruiter Matches:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
              {recruiterMatches.filter(c => c.eligible).length} Matches
            </span>
          </div>
        </Card>

        {/* 4. CAREER INTELLIGENCE COMPACT CARD */}
        <Card className="text-center p-6 space-y-3 border-emerald-100 bg-emerald-50/50">
          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Sparkles size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Career Intelligence</h3>
            <p className="text-xs text-slate-500 mt-0.5">Analyze your resume and skill gaps</p>
          </div>
          <button 
            onClick={() => onNavigate?.("placement-student")}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition shadow-sm shadow-emerald-200"
          >
            Open Intelligence
          </button>
        </Card>


        {/* 5. AI MENTOR COMPACT CARD */}
        <Card className="text-center p-6 space-y-3">
          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
              <Sparkles size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Ask AI Mentor</h3>
            <p className="text-xs text-slate-400 mt-0.5">Need a dynamic study plan or interview tips?</p>
          </div>
          <button 
            onClick={() => onNavigate?.("ai-mentor")}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition"
          >
            Ask AI Mentor
          </button>
        </Card>

      </div>
    </div>
  );
}

export default StudentDashboardPage;
