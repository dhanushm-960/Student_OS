import { Briefcase, TrendingUp, CheckCircle2, ClipboardList, ShieldCheck } from "lucide-react";

const placementStats = [
  { label: "Applications", value: 12 },
  { label: "Interviews", value: 4 },
  { label: "Offers", value: 1 },
];

const milestones = [
  { title: "Update resume and LinkedIn", status: "Complete" },
  { title: "Schedule mock interview", status: "In progress" },
  { title: "Submit campus placement forms", status: "Pending" },
];

export function PlacementPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Placement readiness</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">78%</h2>
            </div>
            <TrendingUp size={18} className="text-indigo-600" />
          </div>
          <p className="mt-4 text-sm text-slate-500">Your latest placement readiness score based on applications and prep.</p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Mock interviews</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">2</h2>
            </div>
            <ShieldCheck size={18} className="text-emerald-600" />
          </div>
          <p className="mt-4 text-sm text-slate-500">Mock interviews completed this month.</p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Applications live</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">8</h2>
            </div>
            <Briefcase size={18} className="text-sky-600" />
          </div>
          <p className="mt-4 text-sm text-slate-500">Opportunities currently in progress.</p>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Placement action plan</h2>
            <p className="text-sm text-slate-500">Focus on the next steps to move forward faster.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
            <ClipboardList size={16} /> 3 tasks open
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {milestones.map((item) => (
            <div key={item.title} className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{item.title}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-sm font-semibold ${item.status === "Complete" ? "bg-emerald-100 text-emerald-700" : item.status === "In progress" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Preparation checklist</p>
            <h3 className="mt-2 text-lg font-semibold text-slate-900">Ready for interviews</h3>
          </div>
          <CheckCircle2 size={20} className="text-emerald-600" />
        </div>
        <ul className="space-y-3 text-sm text-slate-600">
          <li className="rounded-3xl bg-slate-50 p-4">Complete company research notes for top 3 recruiters</li>
          <li className="rounded-3xl bg-slate-50 p-4">Finish at least 5 coding problems before Sunday</li>
          <li className="rounded-3xl bg-slate-50 p-4">Practice behavioral answers and one-pagers</li>
        </ul>
      </div>
    </div>
  );
}

export default PlacementPage;
