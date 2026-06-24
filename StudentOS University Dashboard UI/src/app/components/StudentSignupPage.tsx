import React, { useState } from "react";
import { Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function StudentSignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; general?: string }>({});

  function validate() {
    const e: typeof errors = {};
    if (!name.trim()) {
      e.name = "Full name is required.";
    } else if (name.trim().length < 2) {
      e.name = "Name must be at least 2 characters.";
    }
    
    if (!email) {
      e.email = "Email is required.";
    } else if (!emailRegex.test(email)) {
      e.email = "Enter a valid college email.";
    } else if (!email.endsWith("@atria.edu") && !email.endsWith("@atriauniversity.edu.in")) {
      e.email = "Only @atria.edu or @atriauniversity.edu.in emails are allowed.";
    }
    
    if (!password) {
      e.password = "Password is required.";
    } else if (password.length < 6) {
      e.password = "Password must be at least 6 characters.";
    }
    
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});

    try {
      await signUp(email, password, name);
      setSuccess(true);
      setTimeout(() => {
        navigate("/student/dashboard");
      }, 2500);
    } catch (err: any) {
      setErrors({ general: err.message || "An error occurred during registration." });
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
          {success ? (
            /* Success Screen */
            <div className="text-center py-6 flex flex-col items-center">
              <div className="h-16 w-16 items-center justify-center flex rounded-full bg-emerald-500/20 text-emerald-400 mb-6 border border-emerald-500/30 animate-bounce">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="text-2xl font-display font-extrabold tracking-tight text-white mb-3">Registration Successful!</h2>
              <p className="text-sm text-slate-400 max-w-xs mb-2">
                Your StudentOS account has been created successfully.
              </p>
              <p className="text-xs text-indigo-400 animate-pulse font-medium">
                Redirecting to dashboard...
              </p>
            </div>
          ) : (
            /* Signup Form */
            <>
              {/* Header */}
              <div className="mb-8 text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25 mb-4 font-black text-xl tracking-wider">
                  SO
                </div>
                <h2 className="text-2xl font-display font-extrabold tracking-tight text-white mb-1">Create Student Account</h2>
                <p className="text-sm text-slate-400">Join StudentOS to manage your academic flow</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="text-xs font-semibold text-slate-300 block mb-1.5">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Siddharth Sharma"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-slate-900/40 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition duration-200 text-sm"
                    aria-describedby={errors.name ? "name-error" : undefined}
                    disabled={loading}
                  />
                  {errors.name && <div id="name-error" className="text-xs text-rose-400 mt-1">{errors.name}</div>}
                </div>

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

                {errors.general && <div className="text-xs text-rose-400 mt-2 text-center p-2 rounded-lg bg-rose-500/10 border border-rose-500/25">{errors.general}</div>}

                {/* Submit */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl text-white font-semibold transition-all duration-200 hover:-translate-y-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/20 disabled:opacity-50 disabled:hover:translate-y-0"
                    disabled={loading}
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                  </button>
                </div>

                {/* Footer Link */}
                <div className="text-center text-xs text-slate-400 pt-4 flex items-center justify-center gap-1.5 border-t border-white/5 mt-5">
                  <span>Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => navigate("/login-student")}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                    disabled={loading}
                  >
                    Sign In
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Fixed top-left back button */}
      <button
        type="button"
        onClick={() => navigate("/login-student")}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 text-sm text-slate-400 p-2 rounded-xl hover:bg-white/5 hover:text-white transition-all"
        aria-label="Back to login"
        disabled={loading}
      >
        <ArrowLeft size={18} />
        <span>Back</span>
      </button>
    </div>
  );
}

export default StudentSignupPage;
