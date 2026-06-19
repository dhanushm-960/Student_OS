import { useMemo, useState } from "react";
import { CalendarCheck, ClipboardList, Clock3, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

const assignments = [
  { id: 1, course: "Database Management Systems", title: "Normal Form Analysis", due: "Today, 6:00 PM", status: "In progress", progress: 45 },
  { id: 2, course: "Advanced Algorithms", title: "Greedy Algorithm Write-up", due: "Tomorrow", status: "Not started", progress: 0 },
  { id: 3, course: "Software Engineering", title: "Sprint 4 Demo Preparation", due: "Fri", status: "Review", progress: 80 },
  { id: 4, course: "AI Ethics", title: "Case Study Reflection", due: "Sat", status: "Submitted", progress: 100 },
];

export function AssignmentsPage() {
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(
    () => assignments.filter((assignment) => filter === "all" || assignment.status.toLowerCase() === filter),
    [filter]
  );

  const completed = assignments.filter((a) => a.status === "Submitted").length;
  const dueSoon = assignments.filter((a) => a.status === "In progress" || a.status === "Not started").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
          <div className="flex items-center justify-between">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Assignments due</p>
            <ClipboardList size={18} className="text-indigo-600" />
          </div>
          <p className="mt-4 text-4xl font-semibold text-slate-900">{dueSoon}</p>
          <p className="mt-2 text-sm text-slate-500">Active assignments in your queue</p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
          <div className="flex items-center justify-between">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Completed</p>
            <CheckCircle2 size={18} className="text-emerald-600" />
          </div>
          <p className="mt-4 text-4xl font-semibold text-slate-900">{completed}</p>
          <p className="mt-2 text-sm text-slate-500">Assignments finished this week</p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
          <div className="flex items-center justify-between">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Next deadline</p>
            <CalendarCheck size={18} className="text-sky-600" />
          </div>
          <p className="mt-4 text-4xl font-semibold text-slate-900">{assignments[0].due}</p>
          <p className="mt-2 text-sm text-slate-500">{assignments[0].course}</p>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Assignments</h2>
            <p className="text-sm text-slate-500">Track all your course tasks, timelines, and submission status.</p>
          </div>
          <div className="flex items-center gap-3">
            {(["all", "not started", "in progress", "review", "submitted"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`rounded-full px-4 py-2 text-sm transition ${filter === status ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"}`}
              >
                {status === "all" ? "All" : status}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {filtered.map((assignment) => {
            const progressClass = assignment.progress >= 80 ? "bg-emerald-500" : assignment.progress >= 50 ? "bg-sky-500" : "bg-amber-500";
            return (
              <div key={assignment.id} className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.18em] text-slate-400">{assignment.course}</p>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900">{assignment.title}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <span>{assignment.due}</span>
                    <span className="rounded-full px-3 py-1 bg-white text-slate-700 border border-slate-200">{assignment.status}</span>
                  </div>
                </div>
                <div className="mt-4 h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={
                      "h-2 rounded-full " +
                      progressClass +
                      " " +
                      (assignment.progress === 100
                        ? "w-full"
                        : assignment.progress >= 80
                        ? "w-[85%]"
                        : assignment.progress >= 50
                        ? "w-[60%]"
                        : "w-[30%]")
                    }
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                  <span>{assignment.progress}% complete</span>
                  <button className="inline-flex items-center gap-2 text-indigo-600 font-semibold">
                    View details
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AssignmentsPage;
