import { useMemo } from "react";
import { FolderGit2, Users, Layers, CheckCircle2, Sparkles } from "lucide-react";

const projects = [
  {
    id: 1,
    name: "Campus Chatbot",
    status: "In progress",
    progress: 70,
    team: "3 members",
    nextMilestone: "Prototype demo",
  },
  {
    id: 2,
    name: "Placement Portfolio",
    status: "Review",
    progress: 85,
    team: "Solo",
    nextMilestone: "Finalize resume page",
  },
  {
    id: 3,
    name: "Smart Attendance",
    status: "Planning",
    progress: 30,
    team: "4 members",
    nextMilestone: "Design approval",
  },
];

export function StudentProjectsPage() {
  const activeCount = useMemo(() => projects.filter((project) => project.progress < 100).length, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Active projects</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">{activeCount}</h2>
            </div>
            <FolderGit2 size={18} className="text-indigo-600" />
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Portfolio score</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">82%</h2>
            </div>
            <Sparkles size={18} className="text-emerald-600" />
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Team collaboration</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">8 members</h2>
            </div>
            <Users size={18} className="text-sky-600" />
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Project pipeline</h2>
            <p className="text-sm text-slate-500">Keep track of upcoming deadlines and review statuses for your major work.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
            <Layers size={16} /> 3 active projects
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{project.name}</p>
                  <p className="text-sm text-slate-500">{project.team}</p>
                </div>
                <span className="rounded-full px-3 py-1 text-sm font-semibold text-slate-700 bg-white border border-slate-200">{project.status}</span>
              </div>
              <div className="mt-4 h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={
                    "h-2 rounded-full " +
                    (project.progress >= 80
                      ? "bg-emerald-500"
                      : project.progress >= 50
                      ? "bg-sky-500"
                      : "bg-amber-500") +
                    " " +
                    (project.progress === 100
                      ? "w-full"
                      : project.progress >= 80
                      ? "w-[85%]"
                      : project.progress >= 50
                      ? "w-[60%]"
                      : "w-[30%]")
                  }
                />
              </div>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-slate-500">
                <span>{project.progress}% complete</span>
                <span>Next: {project.nextMilestone}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StudentProjectsPage;
