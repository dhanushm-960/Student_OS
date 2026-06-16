import React, { useState } from "react";

export function LoginSelector({ onSelect }: { onSelect: (role: "admin" | "student") => void }) {
  const [role, setRole] = useState<"admin" | "student">("student");

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.16),_transparent_20%),#070a14] p-6">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/15 bg-slate-950/95 shadow-2xl shadow-slate-950/40 backdrop-blur-2xl">
        <div className="absolute inset-x-0 top-0 h-48 bg-[linear-gradient(135deg,_#4f46e5,_#7c3aed)] opacity-65 blur-3xl" />
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8">
          <div className="p-10 lg:p-14 text-white">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-200/90 backdrop-blur-sm">
              StudentOS</span>
            <h1 className="mt-8 text-4xl font-display font-black tracking-tight leading-tight text-white">
              Your AI-Powered Operating System for Student Success</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-200/85">
              Manage academics, projects, skills, placements, and productivity from one beautiful workspace.
            </p>

            <div className="mt-10 grid gap-4">
              <div className="flex items-start gap-3 rounded-3xl border border-white/15 bg-slate-900/85 p-4 text-sm text-slate-100">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-800/80 text-indigo-200">AI</span>
                <div>
                  <p className="font-semibold">AI Mentor</p>
                  <p className="mt-1 text-sm text-slate-300">Personalized guidance and study recommendations.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-3xl border border-white/15 bg-slate-900/85 p-4 text-sm text-slate-100">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-800/80 text-sky-200">📅</span>
                <div>
                  <p className="font-semibold">Smart Planner</p>
                  <p className="mt-1 text-sm text-slate-300">Stay on top of tasks, assignments, and deadlines.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-3xl border border-white/15 bg-slate-900/85 p-4 text-sm text-slate-100">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-800/80 text-violet-200">📁</span>
                <div>
                  <p className="font-semibold">Placement Dashboard</p>
                  <p className="mt-1 text-sm text-slate-300">Monitor placement readiness at a glance.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 lg:p-12 bg-slate-950/95">
            <div className="rounded-[1.75rem] border border-white/15 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
              <div className="mb-6 text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Sign in</p>
                <h2 className="mt-4 text-3xl font-display font-bold text-white">Choose your role</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Select Student or Admin from the dropdown and continue.
                </p>
              </div>

              <label className="block text-sm font-semibold text-slate-300 mb-3" htmlFor="role-select">Role</label>
              <div className="relative mb-6">
                <select
                  id="role-select"
                  value={role}
                  onChange={(event) => setRole(event.target.value as "student" | "admin")}
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-5 py-4 pr-12 text-white outline-none transition duration-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">▾</span>
              </div>

              <button
                type="button"
                onClick={() => onSelect(role)}
                className="w-full rounded-3xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-4 text-sm font-semibold text-white shadow-[0_18px_60px_-30px_rgba(79,70,229,0.8)] transition duration-200 hover:-translate-y-0.5"
              >
                Continue as {role === "student" ? "Student" : "Admin"}
              </button>

              <div className="mt-6 text-sm leading-6 text-slate-400">
                <p>Use your selected role to enter the specific login flow. You can switch roles by signing out later.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginSelector;
