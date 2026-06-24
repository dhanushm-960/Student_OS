import React from "react";
import { GraduationCap, Shield, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";

export function LoginSelector() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.16),_transparent_20%),#070a14] p-6">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-950/80 p-8 sm:p-12 md:p-16 shadow-2xl shadow-slate-950/50 backdrop-blur-2xl flex flex-col items-center">
        {/* Decorative background glow */}
        <div className="absolute -top-40 inset-x-0 h-80 bg-[linear-gradient(135deg,_rgba(79,70,229,0.3),_rgba(124,58,237,0.3))] opacity-50 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 text-center mb-12 max-w-xl">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25 mb-4 font-black text-2xl tracking-wider">
            SO
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-white mb-3">
            Welcome to StudentOS
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            The unified AI-powered platform for academic excellence, career readiness, and operational analytics. Choose your gateway below.
          </p>
        </div>

        {/* Portals Grid */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl">
          {/* Student Card */}
          <button
            type="button"
            onClick={() => navigate("/login-student")}
            className="group relative flex flex-col items-start rounded-3xl border border-white/5 bg-white/[0.03] p-8 text-left transition-all duration-300 hover:border-indigo-500/30 hover:bg-white/[0.06] hover:shadow-2xl hover:shadow-indigo-500/5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <div className="mb-6 rounded-2xl bg-indigo-500/10 p-4 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
              <GraduationCap size={28} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Student Portal</h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Access your course syllabus, academic calendar, grades, Capstone projects, and get guidance from your AI Mentor.
            </p>
            <div className="mt-auto flex items-center gap-2 text-sm font-semibold text-indigo-400 group-hover:text-indigo-300 transition-colors">
              Enter Student OS <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </div>
          </button>

          {/* Admin Card */}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="group relative flex flex-col items-start rounded-3xl border border-white/5 bg-white/[0.03] p-8 text-left transition-all duration-300 hover:border-violet-500/30 hover:bg-white/[0.06] hover:shadow-2xl hover:shadow-violet-500/5 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <div className="mb-6 rounded-2xl bg-violet-500/10 p-4 text-violet-400 group-hover:bg-violet-500 group-hover:text-white transition-all duration-300">
              <Shield size={28} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Admin Portal</h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Manage student directories, track placements, review institutional progress, and view administrative dashboards.
            </p>
            <div className="mt-auto flex items-center gap-2 text-sm font-semibold text-violet-400 group-hover:text-violet-300 transition-colors">
              Enter Admin Portal <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginSelector;
