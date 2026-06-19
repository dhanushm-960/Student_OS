import { BarChart3, Award, Star, BookOpen } from "lucide-react";

const grades = [
  { course: "AI Ethics", grade: "A", credits: 3 },
  { course: "Database Management Systems", grade: "A-", credits: 4 },
  { course: "Advanced Algorithms", grade: "B+", credits: 3 },
  { course: "Software Engineering", grade: "A", credits: 3 },
  { course: "Data Structures", grade: "A", credits: 4 },
];

export function GradesPage() {
  const gpa = 8.8;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
          <div className="flex items-center justify-between">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Current GPA</p>
            <Award size={18} className="text-indigo-600" />
          </div>
          <p className="mt-4 text-4xl font-semibold text-slate-900">{gpa}</p>
          <p className="mt-2 text-sm text-slate-500">Semester average score</p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
          <div className="flex items-center justify-between">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Best grade</p>
            <Star size={18} className="text-amber-500" />
          </div>
          <p className="mt-4 text-4xl font-semibold text-slate-900">A</p>
          <p className="mt-2 text-sm text-slate-500">Highest course performance</p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
          <div className="flex items-center justify-between">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Courses tracked</p>
            <BookOpen size={18} className="text-sky-600" />
          </div>
          <p className="mt-4 text-4xl font-semibold text-slate-900">{grades.length}</p>
          <p className="mt-2 text-sm text-slate-500">Courses included in transcript</p>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Grade overview</h2>
            <p className="text-sm text-slate-500">Review recent course results and progress toward your targets.</p>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <BarChart3 size={18} />
            <span className="text-sm">Performance trend</span>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
          <div className="grid grid-cols-6 gap-4 bg-slate-50 px-5 py-3 text-xs uppercase tracking-[0.2em] text-slate-500">
            <div className="col-span-2">Course</div>
            <div>Grade</div>
            <div>Credits</div>
            <div>Status</div>
            <div className="text-right">Transcript</div>
          </div>
          {grades.map((item) => (
            <div key={item.course} className="grid grid-cols-6 gap-4 px-5 py-4 items-center border-t border-slate-200 bg-white">
              <div className="col-span-2">
                <p className="font-semibold text-slate-900">{item.course}</p>
              </div>
              <div className="text-slate-900">{item.grade}</div>
              <div className="text-slate-500">{item.credits}</div>
              <div className="text-slate-500">Completed</div>
              <div className="text-right text-indigo-600 font-semibold">Download</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GradesPage;
