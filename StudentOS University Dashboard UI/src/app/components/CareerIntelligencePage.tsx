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

  // Quiz State
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [quizGenerating, setQuizGenerating] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);

  const startQuiz = async () => {
    setQuizModalOpen(true);
    setQuizGenerating(true);
    setQuizQuestions([]);
    setQuizAnswers([]);
    setQuizResult(null);
    setError(null);
    try {
      const res = await apiRequest("/api/student/quiz/generate");
      if (res.success && res.questions) {
        setQuizQuestions(res.questions);
        setQuizAnswers(new Array(res.questions.length).fill(-1));
      } else {
        throw new Error("Failed to generate quiz.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate quiz.");
      setQuizModalOpen(false);
    } finally {
      setQuizGenerating(false);
    }
  };

  const handleQuizSubmit = async () => {
    if (quizAnswers.includes(-1)) {
      alert("Please answer all questions before submitting.");
      return;
    }
    setQuizSubmitting(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const token = localStorage.getItem("studentos_token");
      const res = await fetch(`${API_URL}/api/student/quiz/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ answers: quizAnswers })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Submission failed.");
      
      setQuizResult(data);
      // Refresh profile to get the updated badge status
      await fetchPlacementData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setQuizSubmitting(false);
    }
  };
  
  const [liveMarket, setLiveMarket] = useState<any>(null);
  
  const fetchPlacementData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [profileRes, matchesRes, skillGapRes, marketRes] = await Promise.all([
        apiRequest("/api/student/profile"),
        apiRequest("/api/student/companies/matches").catch(() => ({ success: false, matches: [] })),
        apiRequest("/api/student/skill-gaps").catch(() => ({ success: false, skillGaps: null })),
        apiRequest("/api/market/live").catch(() => ({ success: false, market: null }))
      ]);
      
      if (profileRes.success) setProfile(profileRes.profile);
      if (matchesRes.success) setCompanies(matchesRes.matches);
      if (skillGapRes.success) setSkillGaps(skillGapRes.skillGaps);
      if (marketRes.success) setLiveMarket(marketRes.market);
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
      {/* AI Alerts Banner */}
      {profile?.marketIntelligence?.aiAlerts && profile.marketIntelligence.aiAlerts.length > 0 && (
        <div className="space-y-2">
          {profile.marketIntelligence.aiAlerts.slice(0, 2).map((alert: any, idx: number) => (
            <div key={idx} className={`border rounded-2xl p-4 flex items-center gap-3 shadow-sm ${
              alert.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-900' :
              alert.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-900' :
              'bg-indigo-50 border-indigo-100 text-indigo-900'
            }`}>
              <div className="p-2 bg-white/50 rounded-xl">
                {alert.type === 'success' ? <TrendingUp size={20} className="text-emerald-600" /> :
                 alert.type === 'warning' ? <AlertCircle size={20} className="text-amber-600" /> :
                 <Sparkles size={20} className="text-indigo-600" />}
              </div>
              <div>
                <h4 className="text-sm font-semibold">{alert.message}</h4>
                <p className="text-xs opacity-75 mt-0.5">{new Date(alert.date).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Verify Skills Banner */}
      {profile?.resumeDetails?.fileName && !profile?.skillVerification?.verified && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">✨ Resume analyzed! Want a Skill Verified badge?</h4>
              <p className="text-xs text-slate-500 mt-0.5">Take a quick 5-minute AI adaptive quiz to verify your skills.</p>
            </div>
          </div>
          <button 
            onClick={startQuiz}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Start Quiz
          </button>
        </div>
      )}

      {/* KPI Stats remain global at top */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200 border border-slate-100 relative">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Placement Readiness</p>
                {profile?.skillVerification?.verified && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700" title="Skills Verified">
                    <CheckCircle2 size={12} /> Verified
                  </span>
                )}
              </div>
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
              <span className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" /> Needs {needed}% more
              </span>
            );
          })()}
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Resume Score</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">{resumeDetails?.score || 0}%</h2>
            </div>
            <FileText size={20} className="text-blue-500" />
          </div>
          <span className={`mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
            (resumeDetails?.score || 0) >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
            (resumeDetails?.score || 0) >= 60 ? 'bg-amber-50 text-amber-700 border-amber-200' : 
            'bg-rose-50 text-rose-600 border-rose-200'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full inline-block ${
              (resumeDetails?.score || 0) >= 80 ? 'bg-emerald-500' : 
              (resumeDetails?.score || 0) >= 60 ? 'bg-amber-500' : 'bg-rose-500'
            }`} />
            {resumeDetails?.strength || "Needs Work"}
          </span>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Eligible Companies</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                {companies.filter(c => c.matchScore >= 70).length} / {companies.length || 0}
              </h2>
            </div>
            <Building2 size={20} className="text-purple-500" />
          </div>
          <span className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block" /> Top matches ready
          </span>
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
          onClick={() => setActiveTab("market")}
          className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "market" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
          }`}
        >
          Live Market
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

        {/* Live Market Intelligence Tab */}
        {activeTab === "market" && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200 border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 text-indigo-900 pointer-events-none">
              <TrendingUp size={120} />
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                📈 Live Market Intelligence
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Real-time job market trends for {new Date().toLocaleDateString()}
              </p>

              {liveMarket ? (
                <div className="grid sm:grid-cols-3 gap-6 mt-6">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Top Hiring Skills</h4>
                    <div className="space-y-2">
                      {liveMarket.topSkills?.slice(0, 5).map((s: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <span className="font-semibold text-indigo-600">{s.skill}</span>
                          <span className="text-emerald-500 flex items-center text-xs font-bold gap-1">
                            <TrendingUp size={12} /> {s.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Top Companies</h4>
                    <div className="space-y-2">
                      {liveMarket.topCompanies?.slice(0, 5).map((c: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-sm text-slate-700">
                          <span>{c.name}</span>
                          <span className="font-bold opacity-75">{c.count} open</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Trending Roles</h4>
                    <div className="space-y-2">
                      {liveMarket.trendingRoles?.slice(0, 5).map((r: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-sm text-slate-700">
                          <span className="truncate pr-2">{r.role}</span>
                          <span className="font-bold opacity-75">{r.count} open</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400 mt-4">Loading market data...</p>
              )}
            </div>
          </div>

          {/* Personalized Market Insights */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200 border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Personalized Insights</h3>
              <p className="text-xs text-slate-400 mt-1 mb-4">Your profile compared to today's market</p>
              
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Student Missing</h4>
              {profile?.marketIntelligence?.missingSkills?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.marketIntelligence.missingSkills.map((ms: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 rounded-lg bg-rose-50 text-rose-700 text-sm font-bold border border-rose-100">
                      {ms}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-emerald-600 font-semibold flex items-center gap-2">
                  <CheckCircle2 size={16} /> No top market skills missing!
                </p>
              )}
            </div>

            <div className="rounded-3xl bg-indigo-50 p-6 shadow-sm border border-indigo-100">
              <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                <Sparkles size={20} className="text-indigo-600" />
                AI Market Recommendation
              </h3>
              <p className="text-sm text-indigo-800 mt-3 font-medium leading-relaxed">
                {profile?.marketIntelligence?.recommendation || "Syncing your personalized AI recommendation..."}
              </p>
            </div>
          </div>
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

      {/* QUIZ MODAL */}
      {quizModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="sticky top-0 bg-white/95 backdrop-blur z-10 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="text-indigo-600" />
                Adaptive Skill Verification
              </h2>
              {!quizGenerating && !quizSubmitting && (
                <button onClick={() => setQuizModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  ✕
                </button>
              )}
            </div>
            
            <div className="p-6">
              {quizGenerating ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <h3 className="text-lg font-semibold text-slate-900">AI is generating your quiz...</h3>
                  <p className="text-sm text-slate-500 mt-2 max-w-sm">
                    Analyzing your resume skills and dynamically creating a personalized assessment.
                  </p>
                </div>
              ) : quizResult ? (
                <div className="py-8 flex flex-col items-center justify-center text-center">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${quizResult.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    {quizResult.passed ? <CheckCircle2 size={40} /> : <AlertCircle size={40} />}
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900">{quizResult.score}%</h2>
                  <h3 className={`text-xl font-semibold mt-2 ${quizResult.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {quizResult.passed ? 'Skills Verified!' : 'Not Quite There'}
                  </h3>
                  <p className="text-slate-500 mt-2 mb-6">{quizResult.message}</p>
                  <button 
                    onClick={() => setQuizModalOpen(false)}
                    className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  {quizQuestions.map((q, qIndex) => (
                    <div key={qIndex} className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase">
                          {q.skill}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">Question {qIndex + 1}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-4 leading-relaxed">{q.question}</h4>
                      <div className="space-y-2.5">
                        {q.options.map((opt: string, oIndex: number) => (
                          <label key={oIndex} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${quizAnswers[qIndex] === oIndex ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200 hover:border-indigo-100 hover:bg-indigo-50/30'}`}>
                            <input 
                              type="radio" 
                              name={`question-${qIndex}`} 
                              checked={quizAnswers[qIndex] === oIndex}
                              onChange={() => {
                                const newAnswers = [...quizAnswers];
                                newAnswers[qIndex] = oIndex;
                                setQuizAnswers(newAnswers);
                              }}
                              className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-slate-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4 flex justify-end">
                    <button 
                      onClick={handleQuizSubmit}
                      disabled={quizSubmitting}
                      className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                    >
                      {quizSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Submitting...
                        </>
                      ) : "Submit Assessment"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CareerIntelligencePage;
