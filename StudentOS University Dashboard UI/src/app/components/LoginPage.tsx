import { useState } from "react";
import { Zap, ArrowLeft } from "lucide-react";

export function LoginPage({ onLogin, onSwitchToSelector }: { onLogin: () => void; onSwitchToSelector?: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }
    setLoading(true);
    // simulate login
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 900);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--background)]">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[linear-gradient(135deg,_#4F46E5,_#7C3AED)]">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <div className="font-display font-700 text-white text-xl">StudentOS</div>
            <div className="text-sm text-[var(--muted-foreground)]">Super Admin Portal</div>
          </div>
        </div>

        <div className="rounded-2xl p-6 bg-white shadow-[0_8px_32px_rgba(31,41,55,0.08)]">
          <h2 className="font-display mb-2 text-[var(--foreground)]">Sign in to your account</h2>
          <p className="text-sm mb-4 text-[var(--muted-foreground)]">Use your super admin credentials to access the dashboard.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-600 block mb-1 text-[var(--muted-foreground)]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[rgba(79,70,229,0.08)] text-[var(--foreground)]"
                placeholder="admin@university.edu"
              />
            </div>

            <div>
              <label className="text-xs font-600 block mb-1 text-[var(--muted-foreground)]">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[rgba(79,70,229,0.08)] text-[var(--foreground)]"
                placeholder="••••••••"
              />
            </div>

            {error && <div className="text-sm text-rose-500">{error}</div>}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <input type="checkbox" /> Remember me
              </label>
              <a href="#" className="text-sm text-[var(--foreground)]">Forgot?</a>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl text-white font-600 bg-[linear-gradient(135deg,_#4F46E5,_#7C3AED)]"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <div className="text-center text-sm mt-4 text-[var(--muted-foreground)]">
          Built for Super Admins — no backend configured.
        </div>
      </div>
      {/* Fixed top-left back button */}
      <button
        type="button"
        onClick={() => (onSwitchToSelector ? onSwitchToSelector() : window.history.back())}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 text-sm text-[var(--foreground)] p-2 rounded-md hover:bg-white/5"
        aria-label="Back to role selector"
      >
        <ArrowLeft size={18} />
        <span className="hidden sm:inline">Back</span>
      </button>
    </div>
  );
}

export default LoginPage;
