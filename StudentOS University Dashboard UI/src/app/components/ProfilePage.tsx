import { Pencil, Mail, Phone, MapPin, GraduationCap, FileText, ShieldCheck } from "lucide-react";

const profileInfo = {
  name: "Siddharth Sharma",
  university: "IIT Mumbai",
  degree: "B.Tech Computer Science",
  year: "3rd Year",
  email: "siddharth.sharma@university.edu",
  phone: "+91 98765 43210",
  location: "Mumbai, India",
  major: "Artificial Intelligence",
  gpa: "9.1",
  resumeVersion: "v3.1",
  verified: true,
};

const academics = [
  { label: "CGPA", value: "9.1" },
  { label: "Completed Credits", value: "112" },
  { label: "Ongoing Projects", value: "4" },
  { label: "Placement Score", value: "81%" },
];

const timeline = [
  { title: "Updated portfolio", date: "Today" },
  { title: "Signed up for mock interview", date: "Yesterday" },
  { title: "Completed AI ethics assignment", date: "2 days ago" },
];

export function ProfilePage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.7fr]">
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-sm shadow-slate-950/5">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Student Profile</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-900">{profileInfo.name}</h1>
              <p className="mt-2 text-sm text-slate-500">{profileInfo.degree} · {profileInfo.university}</p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-3xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">
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

        <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-sm shadow-slate-950/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-500">Contact details</p>
              <p className="text-xs text-slate-400">Keep your student profile updated for placement outreach.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Verified</span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-5">
              <div className="flex items-center gap-3 text-slate-600">
                <Mail size={16} />
                <span className="text-sm">Email</span>
              </div>
              <p className="mt-3 text-sm text-slate-900">{profileInfo.email}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <div className="flex items-center gap-3 text-slate-600">
                <Phone size={16} />
                <span className="text-sm">Phone</span>
              </div>
              <p className="mt-3 text-sm text-slate-900">{profileInfo.phone}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <div className="flex items-center gap-3 text-slate-600">
                <MapPin size={16} />
                <span className="text-sm">Location</span>
              </div>
              <p className="mt-3 text-sm text-slate-900">{profileInfo.location}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <div className="flex items-center gap-3 text-slate-600">
                <GraduationCap size={16} />
                <span className="text-sm">Major</span>
              </div>
              <p className="mt-3 text-sm text-slate-900">{profileInfo.major}</p>
            </div>
          </div>
        </div>

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
            <p className="mt-2 text-lg font-semibold text-slate-900">{profileInfo.resumeVersion}</p>
            <p className="mt-1 text-sm text-slate-500">Uploaded 2 days ago</p>
            <button className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">
              Update resume
            </button>
          </div>
        </div>

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
