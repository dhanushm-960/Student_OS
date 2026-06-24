import React, { useState } from "react";
import { Zap, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { signIn, signOut } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }
    setLoading(true);
    try {
      const { profile } = await signIn(email, password);
      if (profile?.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        // Log them out immediately if they don't have the admin role
        await signOut();
        setError("Access denied. Admin role required.");
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.16),_transparent_20%),#070a14] p-6 font-['Inter',sans-serif]">
      <div className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-950/80 p-8 sm:p-10 shadow-2xl shadow-slate-950/50 backdrop-blur-2xl">
        {/* Decorative background glow */}
        <div className="absolute -top-40 inset-x-0 h-80 bg-[linear-gradient(135deg,_rgba(79,70,229,0.2),_rgba(124,58,237,0.2))] opacity-50 blur-3xl pointer-events-none" />

        {/* Content wrapper */}
        <div className="relative z-10">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25 mb-4">
              <Zap size={22} className="fill-white/10" />
            </div>
            <h2 className="text-2xl font-display font-extrabold tracking-tight text-white mb-1">Admin Sign in</h2>
            <p className="text-sm text-slate-400">Use your super admin credentials</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="text-xs font-semibold text-slate-300 block mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@university.edu"
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-slate-900/40 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition duration-200 text-sm"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="text-xs font-semibold text-slate-300 block mb-1.5">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-slate-900/40 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition duration-200 text-sm"
                disabled={loading}
              />
            </div>

            {error && <div className="text-xs text-rose-400 mt-2 text-center p-2 rounded-lg bg-rose-500/10 border border-rose-500/25">{error}</div>}

            {/* Remember Me & Forgot */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-white/10 bg-slate-900/40 text-indigo-500 focus:ring-indigo-500/20" 
                  disabled={loading}
                />
                Remember me
              </label>
              <a href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors font-semibold">Forgot?</a>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl text-white font-semibold transition-all duration-200 hover:-translate-y-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/20 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </div>

            {/* Hint footer */}
            <div className="text-center text-xs text-slate-500 pt-4 border-t border-white/5 mt-5">
              Built for Super Admins — sandbox database active.
            </div>
          </form>
        </div>
      </div>

      {/* Fixed top-left back button */}
      <button
        type="button"
        onClick={() => navigate("/")}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 text-sm text-slate-400 p-2 rounded-xl hover:bg-white/5 hover:text-white transition-all"
        aria-label="Back to role selector"
        disabled={loading}
      >
        <ArrowLeft size={18} />
        <span>Back</span>
      </button>
    </div>
  );
}

export default LoginPage;

