import { useState } from "react";
import { Search, BookOpen, Clock3, CheckCircle2 } from "lucide-react";

const courses = [
  { id: 1, title: "AI Ethics and Society", instructor: "Dr. N. Banerjee", status: "In progress", progress: 72, due: "Mon" },
  { id: 2, title: "Database Management Systems", instructor: "Prof. K. Desai", status: "Due soon", progress: 42, due: "Wed" },
  { id: 3, title: "Advanced Algorithms", instructor: "Dr. R. Singh", status: "In progress", progress: 54, due: "Thu" },
  { id: 4, title: "Software Engineering", instructor: "Prof. M. Kapoor", status: "Completed", progress: 100, due: "Completed" },
];

function CourseCard({ course }: { course: typeof courses[0] }) {
  const progressColor = course.progress >= 75 ? "bg-emerald-500" : course.progress >= 50 ? "bg-sky-500" : "bg-amber-500";
  const progressWidth = {
    100: "w-full",
    72: "w-[72%]",
    54: "w-[54%]",
    42: "w-[42%]",
  }[course.progress as 100 | 72 | 54 | 42] ?? "w-[0%]";
  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white/95 p-5 shadow-sm shadow-slate-950/5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">{course.title}</p>
          <p className="mt-2 text-xs text-slate-500">{course.instructor}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{course.status}</span>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Progress</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{course.progress}%</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Due</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{course.due}</p>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
        <div className={`h-2 rounded-full ${progressColor} ${progressWidth}`} />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700">
          <BookOpen size={16} /> View course
        </button>
        <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
          <Clock3 size={16} /> Timeline
        </button>
      </div>
    </div>
  );
}

export function CoursesPage() {
  const [search, setSearch] = useState("");

  const filtered = courses.filter((course) => course.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-sm shadow-slate-950/5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-slate-400 uppercase">Course catalog</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Your active courses</h1>
            <p className="mt-2 text-sm text-slate-500">Manage coursework, deadlines, and progress across your semester.</p>
          </div>
          <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Search size={16} className="text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses"
                className="w-full bg-transparent text-sm text-slate-900 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="text-sm text-slate-500">Total courses</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">4</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="text-sm text-slate-500">Average grade</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">A</p>
            </div>
          </div>

          <div className="space-y-4">
            {filtered.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200/70 bg-white/95 p-5 shadow-sm shadow-slate-950/5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-500">Course checklist</p>
                <p className="text-xs text-slate-400">Stay on track this week.</p>
              </div>
              <CheckCircle2 size={18} className="text-emerald-500" />
            </div>
            <ul className="mt-5 space-y-3 text-sm text-slate-600">
              <li className="rounded-3xl bg-slate-50 p-4">Finish quiz preparation for AI Ethics</li>
              <li className="rounded-3xl bg-slate-50 p-4">Review DBMS assignment feedback</li>
              <li className="rounded-3xl bg-slate-50 p-4">Complete algorithms code walkthrough</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200/70 bg-white/95 p-5 shadow-sm shadow-slate-950/5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-500">Course support</p>
                <p className="text-xs text-slate-400">Resources for current modules.</p>
              </div>
              <BookOpen size={18} className="text-indigo-600" />
            </div>
            <div className="mt-5 space-y-3">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Resource library</p>
                <p className="mt-1 text-sm text-slate-500">Course readings and videos.</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Group sessions</p>
                <p className="mt-1 text-sm text-slate-500">Weekly study group on Friday.</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default CoursesPage;
