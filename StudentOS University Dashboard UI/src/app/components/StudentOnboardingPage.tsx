import React, { useState, useEffect } from "react";
import { GraduationCap, Phone, MapPin, Sparkles, FileText, CheckCircle2, Briefcase, Link2 } from "lucide-react";
import { useNavigate, Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../utils/api";

export function StudentOnboardingPage() {
  const { user, profile, loading: authLoading, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [name, setName] = useState("");
  const [university, setUniversity] = useState("");
  const [degree, setDegree] = useState("");
  const [major, setMajor] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  
  const [gpa, setGpa] = useState("");
  const [completedCredits, setCompletedCredits] = useState("");
  const [projects, setProjects] = useState("");

  const [careerGoal, setCareerGoal] = useState("");
  const [skills, setSkills] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [github, setGithub] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to extract university name from email domain
  const getUniversityFromEmail = (email: string) => {
    if (!email) return "";
    const domain = email.split("@")[1]?.toLowerCase() || "";
    if (domain === "atria.edu" || domain === "atriauniversity.edu.in") {
      return "Atria University";
    }
    // Fallback: extract domain name and capitalize
    const part = domain.split(".")[0];
    if (part) {
      return part.charAt(0).toUpperCase() + part.slice(1) + " University";
    }
    return "";
  };

  useEffect(() => {
    if (authLoading || !user) return;

    setName(user.name || "");
    setUniversity(getUniversityFromEmail(user.email));
    setLoading(false);
  }, [user, authLoading]);

  // Auth Protection
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070a14] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!user || profile?.role !== "student") {
    return <Navigate to="/" replace />;
  }

  if (profile?.setupCompleted) {
    return <Navigate to="/student/dashboard" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070a14] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Loading onboarding...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    const parsedGpa = Number(gpa);
    if (isNaN(parsedGpa) || parsedGpa < 0 || parsedGpa > 10) {
      setError("CGPA must be a number between 0.0 and 10.0.");
      return;
    }

    const parsedCredits = Number(completedCredits);
    if (isNaN(parsedCredits) || parsedCredits < 0) {
      setError("Completed Credits must be a positive number.");
      return;
    }

    const parsedProjects = Number(projects);
    if (isNaN(parsedProjects) || parsedProjects < 0) {
      setError("Projects Count must be a positive number.");
      return;
    }

    setSaving(true);
    try {
      await apiRequest("/api/student/profile", {
        method: "PUT",
        body: JSON.stringify({
          name,
          university,
          degree,
          phone,
          location,
          major,
          completedCredits: parsedCredits,
          gpa: parsedGpa,
          projectsCompleted: parsedProjects,
          careerGoal,
          skills,
          linkedIn,
          github,
          setupCompleted: true,
        }),
      });

      await refreshUser();
      navigate("/student/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to save profile. Please check parameters.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.16),_transparent_20%),#070a14] p-6 font-['Inter',sans-serif]">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-950/80 p-8 sm:p-10 shadow-2xl shadow-slate-950/50 backdrop-blur-2xl">
        {/* Decorative glow */}
        <div className="absolute -top-40 inset-x-0 h-80 bg-[linear-gradient(135deg,_rgba(79,70,229,0.2),_rgba(124,58,237,0.2))] opacity-50 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25 mb-4 font-black text-xl tracking-wider">
              SO
            </div>
            <h1 className="text-2xl font-display font-extrabold tracking-tight text-white mb-2 flex items-center justify-center gap-2">
              Set Up Your Profile <Sparkles size={20} className="text-indigo-400" />
            </h1>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Welcome, {name}! Let's fill in your academic and contact details to customize your portal layout and analytics.
            </p>
          </div>

          {error && (
            <div className="p-3 mb-6 rounded-xl text-xs bg-rose-500/10 border border-rose-500/25 text-rose-400 text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Academic Identity */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-indigo-400 border-b border-white/5 pb-1.5 flex items-center gap-2">
                <GraduationCap size={16} /> Academic Identity
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Dhanush M"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-slate-900/40 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">University / College</label>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    required
                    placeholder="Auto-filled from email domain"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-slate-900/40 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                    disabled={saving}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Degree & Course</label>
                  <select
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-slate-900/40 text-white focus:outline-none focus:border-indigo-500 text-sm"
                    disabled={saving}
                  >
                    <option value="" disabled className="bg-slate-950 text-slate-400">Select Degree & Course</option>
                    <option value="B.Tech Computer Science" className="bg-slate-950">B.Tech Computer Science</option>
                    <option value="B.Tech Information Technology" className="bg-slate-950">B.Tech Information Technology</option>
                    <option value="B.Tech Electronics & Communication" className="bg-slate-950">B.Tech Electronics & Communication</option>
                    <option value="B.Tech Mechanical Engineering" className="bg-slate-950">B.Tech Mechanical Engineering</option>
                    <option value="B.Tech Civil Engineering" className="bg-slate-950">B.Tech Civil Engineering</option>
                    <option value="B.Sc Data Science" className="bg-slate-950">B.Sc Data Science</option>
                    <option value="M.Tech Software Engineering" className="bg-slate-950">M.Tech Software Engineering</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Specialization / Major</label>
                  <select
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-slate-900/40 text-white focus:outline-none focus:border-indigo-500 text-sm"
                    disabled={saving}
                  >
                    <option value="" disabled className="bg-slate-950 text-slate-400">Select Specialization & Major</option>
                    <option value="Artificial Intelligence" className="bg-slate-950">Artificial Intelligence</option>
                    <option value="Machine Learning" className="bg-slate-950">Machine Learning</option>
                    <option value="Data Science" className="bg-slate-950">Data Science</option>
                    <option value="Cloud Computing" className="bg-slate-950">Cloud Computing</option>
                    <option value="Cyber Security" className="bg-slate-950">Cyber Security</option>
                    <option value="Full Stack Development" className="bg-slate-950">Full Stack Development</option>
                    <option value="Internet of Things" className="bg-slate-950">Internet of Things</option>
                    <option value="General Computer Science" className="bg-slate-950">General Computer Science</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Contact Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-indigo-400 border-b border-white/5 pb-1.5 flex items-center gap-2">
                <Phone size={16} /> Contact & Location
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-slate-900/40 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    placeholder="e.g. Bangalore, India"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-slate-900/40 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Performance Metrics */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-indigo-400 border-b border-white/5 pb-1.5 flex items-center gap-2">
                <FileText size={16} /> Academic Statistics
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Current CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={gpa}
                    onChange={(e) => setGpa(e.target.value)}
                    required
                    placeholder="e.g. 8.5"
                    className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-slate-900/40 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Credits Completed</label>
                  <input
                    type="number"
                    min="0"
                    value={completedCredits}
                    onChange={(e) => setCompletedCredits(e.target.value)}
                    required
                    placeholder="e.g. 45"
                    className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-slate-900/40 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Projects Count</label>
                  <input
                    type="number"
                    min="0"
                    value={projects}
                    onChange={(e) => setProjects(e.target.value)}
                    required
                    placeholder="e.g. 2"
                    className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-slate-900/40 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Professional & Social */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-indigo-400 border-b border-white/5 pb-1.5 flex items-center gap-2">
                <Briefcase size={16} /> Professional & Social Info
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Career Goal</label>
                  <select
                    value={careerGoal}
                    onChange={(e) => setCareerGoal(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-slate-900/40 text-white focus:outline-none focus:border-indigo-500 text-sm"
                    disabled={saving}
                  >
                    <option value="" disabled className="bg-slate-950 text-slate-400">Select Career Goal</option>
                    <option value="Software Engineer" className="bg-slate-950">Software Engineer</option>
                    <option value="AI Engineer" className="bg-slate-950">AI/ML Engineer</option>
                    <option value="Data Scientist" className="bg-slate-950">Data Scientist</option>
                    <option value="Product Manager" className="bg-slate-950">Product Manager</option>
                    <option value="Consultant" className="bg-slate-950">Consultant</option>
                    <option value="Other" className="bg-slate-950">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    required
                    placeholder="e.g. React, Node.js, Python"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-slate-900/40 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                    disabled={saving}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    value={linkedIn}
                    onChange={(e) => setLinkedIn(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-slate-900/40 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">GitHub Profile URL</label>
                  <input
                    type="url"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-slate-900/40 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-4 flex gap-3 border-t border-white/5 mt-6">
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl text-white font-semibold transition-all duration-200 hover:-translate-y-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/20 disabled:opacity-50 disabled:hover:translate-y-0 cursor-pointer flex items-center justify-center gap-2"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving Profile...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} /> Complete Setup & Enter Dashboard
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default StudentOnboardingPage;
