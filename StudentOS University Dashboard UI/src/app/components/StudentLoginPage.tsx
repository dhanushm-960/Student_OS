import React, { useState } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import SocialButton from "./ui/SocialButton";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function StudentLoginPage() {
  const { signIn, signOut } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  function validate() {
    const e: typeof errors = {};
    if (!email) {
      e.email = "Email is required.";
    } else if (!emailRegex.test(email)) {
      e.email = "Enter a valid college email.";
    } else if (!email.endsWith("@atria.edu") && !email.endsWith("@atriauniversity.edu.in")) {
      e.email = "Only @atria.edu or @atriauniversity.edu.in emails are allowed.";
    }
    if (!password) e.password = "Password is required.";
    else if (password.length < 6) e.password = "Password must be at least 6 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      const { user } = await signIn(email, password);
      if (user?.role === "student") {
        navigate("/student/dashboard");
      } else {
        await signOut();
        setErrors({ general: "Access denied. This portal is for students only." });
      }
    } catch (err: any) {
      setErrors({ general: err.message || "Invalid email or password." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.16),_transparent_20%),#070a14] p-6 font-['Inter',sans-serif]">
      <div className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-950/80 p-8 sm:p-10 shadow-2xl shadow-slate-950/50 backdrop-blur-2xl">
        {/* Decorative background glow */}
        <div className="absolute -top-40 inset-x-0 h-80 bg-[linear-gradient(135deg,_rgba(79,70,229,0.2),_rgba(124,58,237,0.2))] opacity-50 blur-3xl pointer-events-none" />

        {/* Content wrapper */}
        <div className="relative z-10">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25 mb-4 font-black text-xl tracking-wider">
              SO
            </div>
            <h2 className="text-2xl font-display font-extrabold tracking-tight text-white mb-1">Student Sign in</h2>
            <p className="text-sm text-slate-400">Sign in with your college credentials</p>
          </div>

          {/* Social Sign In Buttons (Side-by-Side) */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <SocialButton 
              provider="Google" 
              onClick={() => alert("OAuth not configured in this demo")}
              className="bg-white/5 border-white/5 text-slate-200 hover:bg-white/10 hover:border-white/10 transition-all duration-200"
              disabled={loading}
            >
              Google
            </SocialButton>
            <SocialButton 
              provider="Microsoft" 
              onClick={() => alert("OAuth not configured in this demo")}
              className="bg-white/5 border-white/5 text-slate-200 hover:bg-white/10 hover:border-white/10 transition-all duration-200"
              disabled={loading}
            >
              Microsoft
            </SocialButton>
          </div>

          {/* Divider */}
          <div className="relative my-4 text-center select-none pointer-events-none">
            <div className="absolute left-0 right-0 top-1/2 border-t border-white/10 -translate-y-1/2" />
            <span className="relative px-3 bg-[#070a14] text-xs text-slate-400">or use your college email</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="text-xs font-semibold text-slate-300 block mb-1.5">College Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-slate-900/40 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition duration-200 text-sm"
                aria-describedby={errors.email ? "email-error" : undefined}
                disabled={loading}
              />
              {errors.email && <div id="email-error" className="text-xs text-rose-400 mt-1">{errors.email}</div>}
            </div>

            <div>
              <label htmlFor="password" className="text-xs font-semibold text-slate-300 block mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-slate-900/40 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition duration-200 text-sm"
                  aria-describedby={errors.password ? "password-error" : undefined}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <div id="password-error" className="text-xs text-rose-400 mt-1">{errors.password}</div>}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={remember} 
                  onChange={(e) => setRemember(e.target.checked)} 
                  className="w-4 h-4 rounded border-white/10 bg-slate-900/40 text-indigo-500 focus:ring-indigo-500/20" 
                  disabled={loading}
                />
                Remember me
              </label>
              <a href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors font-semibold">Forgot password?</a>
            </div>

            {errors.general && <div className="text-xs text-rose-400 mt-2 text-center p-2 rounded-lg bg-rose-500/10 border border-rose-500/25">{errors.general}</div>}

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

            {/* Links */}
            <div className="text-center text-xs text-slate-400 pt-4 flex flex-col sm:flex-row items-center justify-center gap-1.5 border-t border-white/5 mt-5">
              <span>Don't have an account? </span>
              <button
                type="button"
                onClick={() => navigate("/signup-student")}
                className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                disabled={loading}
              >
                Create account
              </button>
              <span className="hidden sm:inline text-slate-600">•</span>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
                disabled={loading}
              >
                Admin login
              </button>
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

export default StudentLoginPage;

