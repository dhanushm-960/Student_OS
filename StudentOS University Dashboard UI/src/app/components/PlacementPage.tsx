import { useState, useEffect } from "react";
import { 
  Briefcase, TrendingUp, CheckCircle2, ClipboardList, ShieldCheck, 
  Upload, FileText, Sparkles, Building2, Check, AlertCircle, ArrowUpRight
} from "lucide-react";
import { apiRequest } from "../utils/api";

export function PlacementPage() {
  const [profile, setProfile] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
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
      const [profileRes, matchesRes] = await Promise.all([
        apiRequest("/api/student/profile"),
        apiRequest("/api/companies/matches")
      ]);
      
      if (profileRes.success) {
        setProfile(profileRes.profile);
      }
      if (matchesRes.success) {
        setCompanies(matchesRes.matches);
      }
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

      // Post using raw fetch but correctly prefixed with backend API_URL
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
      
      // Refresh details
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
          <p className="text-slate-400 text-sm">Loading placement dashboard...</p>
        </div>
      </div>
    );
  }

  const resumeDetails = profile?.resumeDetails;
  const placementPrediction = profile?.placementPrediction;

  return (
    <div className="space-y-6">
      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Placement Readiness</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">{profile?.placement || 0}%</h2>
            </div>
            <TrendingUp size={20} className="text-indigo-600" />
          </div>
          <p className="mt-4 text-xs text-slate-500">Based on GPA, DSA, Projects, and Resume Score.</p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Resume Score</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">{resumeDetails?.score || 0}%</h2>
            </div>
            <FileText size={20} className="text-emerald-600" />
          </div>
          <p className="mt-4 text-xs text-slate-500">Extracts skills, projects and parses quality checklist.</p>
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
          <p className="mt-4 text-xs text-slate-500">Recruitment criteria match based on your live academic CGPA.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Main Grid: Resume Upload & Predictions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Resume Analyzer */}
        <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200 border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">AI Resume Analyzer</h3>
                <p className="text-xs text-slate-400">Upload your PDF resume to parse stats and receive scores.</p>
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
                <p className="text-xs text-slate-400 mt-1">PDF format only, up to 5MB.</p>
              </div>

              {file && (
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition duration-200 disabled:opacity-50"
                >
                  {uploading ? "Analyzing Resume..." : "Analyze Resume"}
                </button>
              )}
            </form>

            {uploadSuccess && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs flex items-center gap-1.5">
                <Check size={14} /> Resume analyzed successfully! Score updated.
              </div>
            )}

            {/* Extracted details display if present */}
            {resumeDetails && resumeDetails.score > 0 && (
              <div className="mt-6 border-t border-slate-100 pt-4 space-y-4">
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Extracted Education</h4>
                  <p className="text-sm font-medium text-slate-800 mt-1">{resumeDetails.education}</p>
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Extracted Skills</h4>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {resumeDetails.skills.map((s: string) => (
                      <span key={s} className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold font-semibold">Resume Action Checklist</h4>
                  <ul className="mt-2 space-y-1.5">
                    {resumeDetails.suggestions.map((s: string, idx: number) => (
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

        {/* Predictive Dashboard */}
        <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200 border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Placement Prediction</h3>
              <p className="text-xs text-slate-400">Mock ML prediction models for corporate hiring viability.</p>
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
                  AI Placement Recommendations
                </h4>
                <div className="space-y-2">
                  {placementPrediction.recs && placementPrediction.recs.map((rec: string, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100/50 text-xs text-indigo-950 flex items-start gap-2">
                      <Sparkles size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 border-2 border-dashed border-slate-100 rounded-2xl">
              <p className="text-sm text-slate-400">No predictions generated yet. Please upload a resume first to run predictive modeling.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recruiter Matching Criteria / Corporate List */}
      <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200 border border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Recruiter Matching Engine</h3>
          <p className="text-xs text-slate-400">Match score represents alignment with CGPA, core skills, and technical tags.</p>
        </div>

        <div className="mt-6 space-y-4">
          {companies.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No recruiters configured in database.</p>
          ) : (
            companies.map((company) => (
              <div 
                key={company.companyId} 
                className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-colors ${
                  company.eligible ? "border-slate-100 bg-slate-50/50" : "border-rose-100 bg-rose-50/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0">
                    {company.logo}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-900">{company.name}</h4>
                      <span className={`text-[0.65rem] px-2 py-0.5 rounded-full font-bold ${
                        company.type === "Super Dream" ? "bg-purple-100 text-purple-700" :
                        company.type === "Dream" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"
                      }`}>
                        {company.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{company.role} · {company.salary}</p>
                    <p className="text-[0.65rem] text-slate-400 mt-1">Min CGPA: {company.minGpa}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-slate-400 font-semibold">Match Score</p>
                    <p className="text-lg font-bold text-indigo-600 mt-0.5">{company.matchScore}%</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {company.eligible ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center gap-1">
                        <Check size={12} /> Eligible
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1">
                        <AlertCircle size={12} /> Ineligible
                      </span>
                    )}
                    <a 
                      href="#" 
                      onClick={(e) => e.preventDefault()} 
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition text-slate-500 hover:text-slate-800"
                    >
                      <ArrowUpRight size={16} />
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default PlacementPage;
