import { useMemo } from "react";
import {
  Coffee, CircleDollarSign, CheckCircle2, Clock3, Sparkles, Zap,
  CalendarDays, ClipboardList, Briefcase, Star, Activity, MessageSquare, BarChart3,
  ArrowRight, TrendingUp, BookOpen, CheckCircle
} from "lucide-react";

const tasks = [
  { id: 1, title: "Draft project proposal for AI systems", course: "AI Ethics", due: "Today, 5:00 PM", status: "In progress" },
  { id: 2, title: "Finish database assignment", course: "DBMS", due: "Today, 8:00 PM", status: "Not started" },
  { id: 3, title: "Review linear algebra notes", course: "Mathematics", due: "Tomorrow", status: "In progress" },
];

const deadlines = [
  { label: "Machine Learning quiz", date: "Today", time: "6:30 PM", type: "Quiz" },
  { label: "Resume review deadline", date: "Tomorrow", time: "11:59 PM", type: "Placement" },
  { label: "Group project sync", date: "Fri", time: "3:00 PM", type: "Project" },
];

const skills = [
  { name: "Python", level: "Advanced", progress: 86 },
  { name: "Data Structures", level: "Intermediate", progress: 64 },
  { name: "SQL", level: "Intermediate", progress: 58 },
];

const goals = [
  { title: "Complete 3 mock interviews", progress: 60 },
  { title: "Finish capstone milestones", progress: 40 },
  { title: "Improve DSA score by 10%", progress: 75 },
];

const activity = [
  { label: "Submitted assignment", detail: "DBMS project report", time: "1h ago" },
  { label: "Completed task", detail: "Read AI ethics chapter", time: "3h ago" },
  { label: "Joined mock interview", detail: "Hosted by Career Lab", time: "Yesterday" },
];

const suggestions = [
  "Ask the AI mentor for a weekly study plan.",
  "Schedule a mock interview for next week.",
  "Review your placement readiness score.",
  "Add a new task to today’s planner.",
];

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

export function StudentDashboardPage() {
  const readiness = 81;
  const completion = useMemo(() => Math.round((tasks.filter((task) => task.status !== "Not started").length / tasks.length) * 100), []);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.75fr_0.9fr]">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">Welcome back, Siddharth</p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-900">Focus on your next milestone</h2>
                <p className="mt-2 text-sm text-slate-500">You have 3 high-priority tasks today. Let’s keep the momentum going.</p>
              </div>
              <div className="rounded-3xl bg-indigo-500/10 p-3 text-indigo-600">
                <Sparkles size={32} />
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              {[
                { label: "Study streak", value: "8 days" },
                { label: "Focus score", value: "92%" },
                { label: "Tasks done", value: "3/6" },
              ].map((item) => (
                <div key={item.label} className="rounded-3xl bg-slate-50 px-4 py-3">
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
            <div className="rounded-3xl bg-slate-100 p-4">
              <div className="flex items-center justify-between mb-3 text-sm text-slate-500">
                <span>Resume</span>
                <span>85%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div className="h-2 rounded-full bg-indigo-500 w-[85%]" />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">Applications live</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">6</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">Mock interviews</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">2</p>
              </div>
            </div>
            <button className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">
              <ArrowRight size={16} />
              Review readiness checklist
            </button>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-500">Today’s tasks</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">3 tasks due</h3>
              </div>
              <button className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50">Add task</button>
            </div>
            <div className="mt-5 space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="flex flex-col gap-3 rounded-3xl border border-slate-200/80 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{task.title}</p>
                    <p className="text-sm text-slate-500">{task.course}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 border border-slate-200">{task.status}</span>
                    <span className="text-sm text-slate-500">{task.due}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-500">Upcoming deadlines</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">Next 3 items</h3>
            </div>
            <div className="space-y-3">
              {deadlines.map((item) => (
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
              ))}
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
              {skills.map((skill) => (
                <div key={skill.name}>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div>
                      <p className="font-semibold text-slate-900">{skill.name}</p>
                      <p className="text-sm text-slate-500">{skill.level}</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{skill.progress}%</p>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className={`h-2 rounded-full ${progressColor(skill.progress)} ${skill.progress === 86 ? "w-[86%]" : skill.progress === 64 ? "w-[64%]" : skill.progress === 58 ? "w-[58%]" : "w-[0%]"}`} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-500">Goal progress</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">Semester goals</h3>
              </div>
              <CheckCircle2 size={22} className="text-emerald-500" />
            </div>
            <div className="mt-5 space-y-4">
              {goals.map((goal) => (
                <div key={goal.title}>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="font-medium text-slate-900">{goal.title}</p>
                    <p className="text-sm font-semibold text-slate-900">{goal.progress}%</p>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className={`h-2 rounded-full ${progressColor(goal.progress)} ${goal.progress === 60 ? "w-[60%]" : goal.progress === 40 ? "w-[40%]" : goal.progress === 75 ? "w-[75%]" : "w-[0%]"}`} />
                  </div>
                </div>
              ))}
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
                className="rounded-3xl border border-slate-200 px-4 py-3 text-left text-sm text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50"
              >
                {item}
              </button>
            ))}
          </div>
          <button className="mt-5 inline-flex items-center justify-center gap-2 w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">
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
            {activity.map((item) => (
              <div key={item.label} className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4">
                <p className="font-medium text-slate-900">{item.label}</p>
                <p className="text-sm text-slate-500">{item.detail}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">{item.time}</p>
              </div>
            ))}
          </div>
          <button className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
            <ArrowRight size={14} />
            See all activity
          </button>
        </Card>
      </aside>
    </div>
  );
}

export default StudentDashboardPage;
