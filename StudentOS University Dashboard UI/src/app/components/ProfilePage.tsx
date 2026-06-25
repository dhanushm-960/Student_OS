import { useState, useEffect } from "react";
import { Pencil, Mail, Phone, MapPin, GraduationCap, FileText, ShieldCheck, Check } from "lucide-react";
import { apiRequest } from "../utils/api";

interface EditProfileModalProps {
  profile: any;
  onClose: () => void;
  onSuccess: () => void;
}

function EditProfileModal({ profile, onClose, onSuccess }: EditProfileModalProps) {
  const [name, setName] = useState(profile.name || "");
  const [university, setUniversity] = useState(profile.university || "");
  const [degree, setDegree] = useState(profile.degree || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [location, setLocation] = useState(profile.location || "");
  const [major, setMajor] = useState(profile.major || "");
  const [gpa, setGpa] = useState(profile.gpa || "");
  const [completedCredits, setCompletedCredits] = useState(profile.completedCredits || "");
  const [projects, setProjects] = useState(profile.projects || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

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
          completedCredits: Number(completedCredits),
          gpa: Number(gpa),
          projectsCompleted: Number(projects),
        }),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className="w-full max-w-lg rounded-3xl border border-white/10 p-6 shadow-2xl text-slate-100 overflow-y-auto max-h-[90vh]"
        style={{ background: "#0c0f1d" }}
      >
        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
          <h3 className="text-lg font-bold font-display text-white">Edit Personal & Academic Details</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">✕</button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl text-xs bg-rose-500/10 border border-rose-500/25 text-rose-400 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-900/40 text-white text-sm focus:outline-none focus:border-indigo-500"
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Degree Description</label>
              <input
                type="text"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="B.Tech Computer Science"
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-900/40 text-white text-sm focus:outline-none focus:border-indigo-500"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">University</label>
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="IIT Mumbai"
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-900/40 text-white text-sm focus:outline-none focus:border-indigo-500"
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Major / Specialization</label>
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="Artificial Intelligence"
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-900/40 text-white text-sm focus:outline-none focus:border-indigo-500"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-900/40 text-white text-sm focus:outline-none focus:border-indigo-500"
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Mumbai, India"
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-900/40 text-white text-sm focus:outline-none focus:border-indigo-500"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={gpa}
                onChange={(e) => setGpa(e.target.value)}
                className="w-full px-2 py-2 rounded-xl border border-white/10 bg-slate-900/40 text-white text-xs focus:outline-none"
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Credits</label>
              <input
                type="number"
                min="0"
                value={completedCredits}
                onChange={(e) => setCompletedCredits(e.target.value)}
                className="w-full px-2 py-2 rounded-xl border border-white/10 bg-slate-900/40 text-white text-xs focus:outline-none"
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Projects</label>
              <input
                type="number"
                min="0"
                value={projects}
                onChange={(e) => setProjects(e.target.value)}
                className="w-full px-2 py-2 rounded-xl border border-white/10 bg-slate-900/40 text-white text-xs focus:outline-none"
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Profile Timeline Configuration ─── */
const timeline = [
  { title: "Updated portfolio", date: "Today" },
  { title: "Signed up for mock interview", date: "Yesterday" },
  { title: "Completed AI ethics assignment", date: "2 days ago" },
];

/* ─── Main Profile Page Component ─── */
export function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiRequest("/api/student/profile");
      setProfile(data.profile);
    } catch (err: any) {
      setError(err.message || "Failed to load student profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateResume = async () => {
    if (!profile) return;
    
    // Simple prompt to version increment or set custom version
    const currentVer = profile.resumeVersion || "v1.0";
    const majorMinor = currentVer.replace("v", "").split(".");
    const nextVer = `v${majorMinor[0]}.${Number(majorMinor[1] || 0) + 1}`;
    
    const userChoice = prompt(`Update resume to a new version:`, nextVer);
    if (!userChoice) return;

    try {
      await apiRequest("/api/student/profile", {
        method: "PUT",
        body: JSON.stringify({ resumeVersion: userChoice }),
      });
      fetchProfile();
    } catch (err: any) {
      alert(err.message || "Failed to update resume version.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-2">
            <span className="w-3.5 h-3.5 bg-indigo-500 rounded-full animate-bounce" />
            <span className="w-3.5 h-3.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
            <span className="w-3.5 h-3.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
          <span className="text-sm text-indigo-400 font-500 animate-pulse">Loading profile details...</span>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-center font-medium">
        {error || "Failed to resolve student identity. Please sign in again."}
      </div>
    );
  }

  const academics = [
    { label: "CGPA", value: profile.gpa || "0.0" },
    { label: "Completed Credits", value: profile.completedCredits || "0" },
    { label: "Ongoing Projects", value: profile.projects || "0" },
    { label: "Placement Score", value: `${profile.placement || 0}%` },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.7fr]">
      {showEditModal && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onSuccess={fetchProfile}
        />
      )}

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-sm shadow-slate-950/5">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Student Profile</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-900">{profile.name}</h1>
              <p className="mt-2 text-sm text-slate-500">
                {profile.degree || "Degree Unspecified"} · {profile.university || "University Unspecified"}
              </p>
            </div>
            <button
              onClick={() => setShowEditModal(true)}
              className="inline-flex items-center gap-2 rounded-3xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 cursor-pointer"
            >
              <Pencil size={16} /> Edit profile
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {academics.map((stat) => (
              <div key={stat.label} className="rounded-3xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{stat.label}</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact details */}
        <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-sm shadow-slate-950/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-500">Contact details</p>
              <p className="text-xs text-slate-400">Keep your student profile updated for placement outreach.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <Check size={12} /> Verified
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-5">
              <div className="flex items-center gap-3 text-slate-600">
                <Mail size={16} />
                <span className="text-sm">Email</span>
              </div>
              <p className="mt-3 text-sm text-slate-900">{profile.email}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <div className="flex items-center gap-3 text-slate-600">
                <Phone size={16} />
                <span className="text-sm">Phone</span>
              </div>
              <p className="mt-3 text-sm text-slate-900">{profile.phone || "Unspecified (Click Edit Profile)"}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <div className="flex items-center gap-3 text-slate-600">
                <MapPin size={16} />
                <span className="text-sm">Location</span>
              </div>
              <p className="mt-3 text-sm text-slate-900">{profile.location || "Unspecified (Click Edit Profile)"}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <div className="flex items-center gap-3 text-slate-600">
                <GraduationCap size={16} />
                <span className="text-sm">Major</span>
              </div>
              <p className="mt-3 text-sm text-slate-900">{profile.major || "Unspecified (Click Edit Profile)"}</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-sm shadow-slate-950/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-500">Activity timeline</p>
              <p className="text-xs text-slate-400">Recent activity on your portal.</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {timeline.map((item) => (
              <div key={item.title} className="flex items-center gap-4 rounded-3xl bg-slate-50 p-4">
                <div className="rounded-2xl bg-indigo-500/10 p-3 text-indigo-600">
                  <FileText size={18} />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="text-sm text-slate-500">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <aside className="space-y-6">
        {/* Resume manager */}
        <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-sm shadow-slate-950/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-500">Resume Manager</p>
              <p className="text-xs text-slate-400">Version control and latest upload.</p>
            </div>
            <ShieldCheck size={20} className="text-emerald-500" />
          </div>
          <div className="mt-6 rounded-3xl bg-slate-50 p-5">
            <p className="text-sm text-slate-900 font-semibold">Current version</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{profile.resumeVersion || "v1.0"}</p>
            <p className="mt-1 text-sm text-slate-500">Uploaded recently</p>
            <button
              onClick={handleUpdateResume}
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 cursor-pointer"
            >
              Update resume
            </button>
          </div>
        </div>

        {/* Account settings */}
        <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-sm shadow-slate-950/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-500">Account settings</p>
              <p className="text-xs text-slate-400">Security, preferences and integrations.</p>
            </div>
            <div className="rounded-3xl bg-slate-100 p-3 text-slate-700">
              <Mail size={18} />
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">Email notifications</p>
              <p className="text-sm text-slate-500">Enabled for assignment updates and placement alerts.</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">Two-step verification</p>
              <p className="text-sm text-slate-500">Keep your student account secure.</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default ProfilePage;
