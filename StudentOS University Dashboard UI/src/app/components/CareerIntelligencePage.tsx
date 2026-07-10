import { useState, useEffect } from "react";
import { 
  Briefcase, TrendingUp, CheckCircle2, ClipboardList, ShieldCheck, 
  Upload, FileText, Sparkles, Building2, Check, AlertCircle, ArrowUpRight, Crosshair
} from "lucide-react";
import { apiRequest } from "../utils/api";

export function CareerIntelligencePage() {
  const [profile, setProfile] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [skillGaps, setSkillGaps] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("resume");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Upload State
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  const fetchPlacementData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [profileRes, matchesRes, skillGapRes] = await Promise.all([
        apiRequest("/api/student/profile"),
        apiRequest("/api/student/companies/matches").catch(() => ({ success: false, matches: [] })),
        apiRequest("/api/student/skill-gaps").catch(() => ({ success: false, skillGaps: null }))
      ]);
      
      if (profileRes.success) setProfile(profileRes.profile);
      if (matchesRes.success) setCompanies(matchesRes.matches);
      if (skillGapRes.success) setSkillGaps(skillGapRes.skillGaps);
    } catch (err: any) {
      setError(err.message || "Failed to load placement data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacementData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadSuccess(false);
    }
  };

  const handleUploadResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("resume", file);

      const token = localStorage.getItem("studentos_token");
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_URL}/api/resume/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to upload resume.");

      setUploadSuccess(true);
      setFile(null);
      
      await fetchPlacementData();
    } catch (err: any) {
      setError(err.message || "Something went wrong during resume upload.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Loading Career Intelligence...</p>
        </div>
      </div>
    );
  }

  const resumeDetails = profile?.resumeDetails;
  const placementPrediction = profile?.placementPrediction;

  return (
    <div className="space-y-6">
      {/* KPI Stats remain global at top */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Placement Readiness</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">{profile?.placement || 0}%</h2>
            </div>
            <TrendingUp size={20} className="text-indigo-600" />
          </div>
          {(() => {
            const score = profile?.placement || 0;
            if (score >= 75) return (
              <span className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Placement Ready
              </span>
            );
            if (score >= 50) return (
              <span className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" /> Internship Ready
              </span>
            );
            return (
              <span className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" /> Not Ready Yet
              </span>
            );
          })()}
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Internship Readiness</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">{profile?.placement || 0}%</h2>
            </div>
            <Briefcase size={20} className="text-amber-500" />
          </div>
          {(() => {
            const score = profile?.placement || 0;
            const needed = Math.max(0, 50 - score);
            if (score >= 50) return (
              <span className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Eligible for Internships
              </span>
            );
            return (
              <p className="mt-4 text-xs text-slate-500">Need <span className="font-semibold text-amber-600">{needed}% more</span> to qualify for internships.</p>
            );
          })()}
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Resume Score</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">{resumeDetails?.score || 0}%</h2>
            </div>
            <FileText size={20} className="text-emerald-600" />
          </div>
          <p className="mt-4 text-xs text-slate-500">AI Extracted Quality Score.</p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Eligible Companies</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                {companies.filter(c => c.eligible).length} / {companies.length}
              </h2>
            </div>
            <Building2 size={20} className="text-sky-600" />
          </div>
          <p className="mt-4 text-xs text-slate-500">Recruitment criteria match based on profile.</p>
        </div>
      </div>


      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* TABS */}
      <div className="flex space-x-1 p-1 bg-slate-100/50 rounded-2xl w-max">
        <button
          onClick={() => setActiveTab("resume")}
          className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "resume" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
          }`}
        >
          Resume Analysis
        </button>
        <button
          onClick={() => setActiveTab("readiness")}
          className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "readiness" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
          }`}
        >
          Placement Readiness
        </button>
        <button
          onClick={() => setActiveTab("skillgap")}
          className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "skillgap" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
          }`}
        >
          Skill Gap Analysis
        </button>
        <button
          onClick={() => setActiveTab("recruiters")}
          className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "recruiters" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
          }`}
        >
          Recruiter Matches
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {/* Resume Analyzer Tab */}
        {activeTab === "resume" && (
        <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200 border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">AI Resume Analysis</h3>
                <p className="text-xs text-slate-400">Upload PDF resume to extract skills.</p>
              </div>
              <Sparkles size={18} className="text-indigo-500" />
            </div>

            <form onSubmit={handleUploadResume} className="space-y-4">
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-indigo-400 transition-colors relative cursor-pointer">
                <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={handleFileChange} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="mx-auto text-slate-400 mb-2" size={24} />
                <p className="text-sm font-medium text-slate-700">
                  {file ? file.name : "Click or drag PDF resume here"}
                </p>
              </div>

              {file && (
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition"
                >
                  {uploading ? "Analyzing Resume..." : "Analyze Resume"}
                </button>
              )}
            </form>

            {uploadSuccess && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs flex items-center gap-1.5">
                <Check size={14} /> Resume analyzed successfully!
              </div>
            )}

            {uploadSuccess && resumeDetails && resumeDetails.score > 0 && (
              <div className="mt-6 border-t border-slate-100 pt-4 space-y-4">
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Extracted Skills</h4>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {resumeDetails.skills?.map((s: string) => (
                      <span key={s} className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Action Checklist</h4>
                  <ul className="mt-2 space-y-1.5">
                    {resumeDetails.actionChecklist?.map((s: string, idx: number) => (
                      <li key={idx} className="text-xs text-slate-500 flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
        )}

        {/* Readiness Dashboard Tab */}
        {activeTab === "readiness" && (
        <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200 border border-slate-100 max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Placement Readiness Breakdown</h3>
              <p className="text-xs text-slate-400">Deterministic scoring of your profile.</p>
            </div>
            <ShieldCheck size={18} className="text-emerald-500" />
          </div>

          {placementPrediction ? (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Prediction Class</p>
                  <h4 className={`text-2xl font-bold mt-1 ${
                    placementPrediction.potential === "High" ? "text-emerald-600" :
                    placementPrediction.potential === "Medium" ? "text-indigo-600" : "text-rose-500"
                  }`}>
                    {placementPrediction.potential} Potential
                  </h4>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                  placementPrediction.potential === "High" ? "bg-emerald-500" :
                  placementPrediction.potential === "Medium" ? "bg-indigo-500" : "bg-rose-500"
                }`}>
                  {placementPrediction.score}%
                </div>
              </div>

              <div>
                <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">
                  Score Breakdown
                </h4>
                <div className="space-y-3">
                  {placementPrediction.breakdown?.map((item: any, idx: number) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1 text-xs text-slate-600">
                        <span className="font-semibold">{item.label} ({item.weight})</span>
                        <span>{item.value} / {item.max}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-1.5 bg-indigo-500 rounded-full" style={{ width: `${(item.value / item.max) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 border-2 border-dashed border-slate-100 rounded-2xl">
              <p className="text-sm text-slate-400">No predictions generated yet.</p>
            </div>
          )}
        </div>
        )}

        {/* Skill Gap Analysis Tab */}
        {activeTab === "skillgap" && (
        <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200 border border-slate-100 max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Skill Gap Analysis</h3>
              <p className="text-xs text-slate-400">Highest impact missing skills across matches.</p>
            </div>
            <Crosshair size={18} className="text-rose-500" />
          </div>

          <div className="space-y-4">
            {skillGaps?.missingSkills?.length > 0 ? (
              skillGaps.missingSkills.map((gap: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-800">{gap.skill}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full">
                      Impact: {gap.impact}
                    </span>
                  </div>
                  <p className="text-[0.65rem] text-slate-500">{gap.reason}</p>
                  <div className="flex gap-1 flex-wrap mt-2">
                    {gap.requiredBy.map((req: string) => (
                      <span key={req} className="text-[0.6rem] px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded">
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-8 border-2 border-dashed border-emerald-100 bg-emerald-50 rounded-2xl">
                <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
                <p className="text-sm text-emerald-700 font-semibold">No major skill gaps identified!</p>
                <p className="text-xs text-emerald-600/70 mt-1">You match the requirements of current top companies.</p>
              </div>
            )}
          </div>
        </div>
        )}

        {/* Recruiter Matches Tab */}
        {activeTab === "recruiters" && (
        <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200 border border-slate-100 max-w-2xl">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recruiter Matches</h3>
            <p className="text-xs text-slate-400">Match score based on required skills & GPA.</p>
          </div>

          <div className="mt-6 space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {companies.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No recruiters configured.</p>
            ) : (
              companies.map((company) => (
                <div 
                  key={company.companyId} 
                  className={`rounded-2xl border p-4 flex flex-col gap-3 transition-colors ${
                    company.eligible ? "border-slate-100 bg-slate-50/50" : "border-rose-100 bg-rose-50/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0">
                        {company.logo}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{company.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{company.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-indigo-600">{company.matchScore}%</p>
                    </div>
                  </div>
                  <div className="text-[0.65rem] space-y-1 mt-1">
                    {company.missingSkills?.length > 0 ? (
                      <p className="text-rose-600 font-semibold flex items-center gap-1">
                        <AlertCircle size={10} /> Missing: {company.missingSkills.join(", ")}
                      </p>
                    ) : (
                      <p className="text-emerald-600 font-semibold flex items-center gap-1">
                        <Check size={10} /> All skills matched!
                      </p>
                    )}
                    <p className="text-slate-500">Recommendation: {company.recommendation}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

export default CareerIntelligencePage;
