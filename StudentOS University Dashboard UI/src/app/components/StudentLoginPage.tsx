import React, { useState } from "react";
import { Eye, EyeOff, ArrowLeft, Brain, Calendar, FolderGit2, MapPin, Briefcase } from "lucide-react";
import SocialButton from "./ui/SocialButton";
import FeatureCard from "./ui/FeatureCard";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function StudentLoginPage({ onSwitchToAdmin }: { onSwitchToAdmin?: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function validate() {
    const e: typeof errors = {};
    if (!email) e.email = "Email is required.";
    else if (!emailRegex.test(email)) e.email = "Enter a valid college email.";
    if (!password) e.password = "Password is required.";
    else if (password.length < 6) e.password = "Password must be at least 6 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f1724] to-[#0b1226] p-6">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left - Branding */}
        <div className="hidden md:flex flex-col justify-center p-8 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[linear-gradient(135deg,_#4F46E5,_#7C3AED)]">
              <div className="text-white font-700">SO</div>
            </div>
            <div>
              <h3 className="text-white font-display text-xl">StudentOS</h3>
              <div className="text-sm text-[var(--muted-foreground)]">AI-Powered Student Platform</div>
            </div>
          </div>

          <h1 className="text-2xl font-display text-white mb-3">Your AI-Powered Operating System for Student Success</h1>
          <p className="text-sm mb-6 text-white/80">
            AI mentoring, academic planning, placement prep, and progress analytics — in one platform.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <FeatureCard icon={<Brain size={18} />} title="AI Mentor" description="Personalized guidance and study plans." />
            <FeatureCard icon={<Calendar size={18} />} title="Smart Planner" description="Organize tasks and daily routines." />
            <FeatureCard icon={<FolderGit2 size={18} />} title="Project Tracker" description="Track project progress and teams." />
            <FeatureCard icon={<MapPin size={18} />} title="Skill Roadmap" description="Curated learning paths for careers." />
          </div>

          <div className="mt-auto">
            <div className="text-xs font-600 text-white/80 mb-2">Trusted by students for:</div>
            <div className="flex gap-3">
              <div className="p-3 rounded-xl bg-white/3 text-white">Placement Dashboard</div>
              <div className="p-3 rounded-xl bg-white/3 text-white">Progress Analytics</div>
            </div>
          </div>
        </div>

        {/* Right - Form */}
        <div className="flex flex-col justify-center p-6 rounded-3xl bg-white shadow-xl">
          <div className="mb-4 text-center">
            <h2 className="text-2xl font-display text-[var(--foreground)]">Student Sign in</h2>
            <p className="text-sm mt-1 text-[var(--muted-foreground)]">Sign in with your college email to continue</p>
          </div>

          <div className="space-y-3 mb-4">
            <SocialButton provider="Google" onClick={() => alert("OAuth not configured in this demo") } />
            <SocialButton provider="Microsoft" onClick={() => alert("OAuth not configured in this demo") } />
          </div>

          <div className="relative my-3 text-center">
            <span className="px-3 bg-white text-xs text-[var(--muted-foreground)]">or use your college email</span>
            <div className="absolute left-0 right-0 top-1/2 border-t border-[rgba(15,23,42,0.06)]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="text-xs font-600 text-[var(--muted-foreground)]">College Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-2 px-3 py-2 rounded-lg border border-[rgba(15,23,42,0.06)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-200"
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && <div id="email-error" className="text-xs text-rose-500 mt-1">{errors.email}</div>}
            </div>

            <div>
              <label htmlFor="password" className="text-xs font-600 text-[var(--muted-foreground)]">Password</label>
              <div className="mt-2 relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[rgba(15,23,42,0.06)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-slate-500"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <div id="password-error" className="text-xs text-rose-500 mt-1">{errors.password}</div>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="w-4 h-4" />
                Remember me
              </label>
              <a href="#" className="text-sm text-[var(--foreground)]">Forgot password?</a>
            </div>

            <div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl text-white font-600 transition-transform hover:scale-[1.01] bg-[linear-gradient(135deg,_#4F46E5,_#7C3AED)]"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </div>

            <div className="text-center text-sm text-[var(--muted-foreground)]">
              <span>Don't have an account? </span>
              <a href="#" className="text-indigo-600 font-600">Create account</a>
              <span> · </span>
              <button
                type="button"
                onClick={() => (onSwitchToAdmin ? onSwitchToAdmin() : window.history.back())}
                className="text-indigo-600 font-600"
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
        onClick={() => (onSwitchToAdmin ? onSwitchToAdmin() : window.history.back())}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 text-sm text-white/90 md:top-6 md:left-6 p-2 rounded-md hover:bg-white/5"
        aria-label="Back to role selector"
      >
        <ArrowLeft size={18} />
        <span className="hidden sm:inline">Back</span>
      </button>
    </div>
  );
}

export default StudentLoginPage;
