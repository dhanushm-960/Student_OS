import { CalendarDays, CheckCircle2, Clock3, Pencil, Sparkles } from "lucide-react";

const schedule = [
  { time: "09:00 AM", title: "Study session: Algorithms", type: "Study" },
  { time: "11:30 AM", title: "Project sync meeting", type: "Project" },
  { time: "02:00 PM", title: "DSA practice", type: "Practice" },
  { time: "04:30 PM", title: "Mock interview prep", type: "Placement" },
];

const reminders = [
  { title: "Submit DS assignment", due: "Today" },
  { title: "Review AI Ethics notes", due: "Tomorrow" },
  { title: "Update portfolio slide deck", due: "Fri" },
];

export function PlannerPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Today’s planner</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Your schedule at a glance</h2>
          </div>
          <button className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2 text-sm text-white transition hover:bg-indigo-700">
            <CalendarDays size={16} /> View calendar
          </button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-4">
            {schedule.map((item) => (
              <div key={item.time} className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="text-sm text-slate-500">{item.type}</p>
                  </div>
                  <span className="text-sm text-slate-500">{item.time}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-3xl bg-white p-5 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Reminders</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">Next actions</h3>
              </div>
              <Sparkles size={18} className="text-indigo-600" />
            </div>
            <div className="mt-5 space-y-3">
              {reminders.map((reminder) => (
                <div key={reminder.title} className="rounded-3xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">{reminder.title}</p>
                  <p className="text-sm text-slate-500">Due {reminder.due}</p>
                </div>
              ))}
            </div>
            <button className="mt-6 w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">
              Add new plan
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Focus block</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">Deep work session</h3>
            </div>
            <Clock3 size={20} className="text-sky-600" />
          </div>
          <p className="mt-4 text-sm text-slate-500">Block out two hours for Algorithms review and design discussion.</p>
          <div className="mt-5 h-2 rounded-full bg-slate-200">
            <div className="h-2 rounded-full bg-indigo-600 w-[65%]" />
          </div>
          <p className="mt-3 text-sm text-slate-500">65% complete</p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Weekly progress</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">Consistency streak</h3>
            </div>
            <CheckCircle2 size={20} className="text-emerald-600" />
          </div>
          <p className="mt-4 text-4xl font-semibold text-slate-900">4 days</p>
          <p className="mt-2 text-sm text-slate-500">You've completed your study plan on time this week.</p>
        </div>
      </div>
    </div>
  );
}

export default PlannerPage;
