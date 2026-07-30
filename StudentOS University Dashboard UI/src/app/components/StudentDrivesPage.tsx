import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Building2, Calendar, CheckCircle2, Upload, AlertCircle, Clock, XCircle, FileImage } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { TopNav } from "./TopNav";

export function StudentDrivesPage() {
  const token = localStorage.getItem("studentos_token");
  const [drives, setDrives] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"available" | "applied">("available");
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingStage, setUploadingStage] = useState<string>("");
  const [targetAppId, setTargetAppId] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const [drivesRes, appsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/student/drives`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/student/applications`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      const drivesData = await drivesRes.json();
      const appsData = await appsRes.json();

      if (drivesData.success) setDrives(drivesData.drives);
      if (appsData.success) setApplications(appsData.applications);
    } catch (error) {
      console.error("Failed to fetch drives data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (driveId: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/student/drives/${driveId}/apply`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
        setActiveTab("applied");
      } else {
        alert(data.message || "Failed to apply");
      }
    } catch (error) {
      console.error(error);
      alert("Error applying to drive");
    }
  };

  const handleUploadProof = async (appId: string, stage: string) => {
    if (!selectedFile) return;
    
    const formData = new FormData();
    formData.append("proof", selectedFile);
    formData.append("stage", stage);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/student/applications/${appId}/proof`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setSelectedFile(null);
        setUploadingStage("");
        setTargetAppId("");
        fetchData();
      } else {
        alert(data.message || "Failed to upload proof");
      }
    } catch (error) {
      console.error(error);
      alert("Upload error");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "applied": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "in_process": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "accepted": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "rejected": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-neutral-500/10 text-neutral-500 border-neutral-500/20";
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50/50">
      <TopNav title="Recruitment Drives" />
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        
        <div className="flex gap-4 border-b border-slate-200 mb-8">
          <button 
            className={`pb-4 px-2 font-medium transition-colors border-b-2 ${activeTab === 'available' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
            onClick={() => setActiveTab("available")}
          >
            Available Drives
          </button>
          <button 
            className={`pb-4 px-2 font-medium transition-colors border-b-2 ${activeTab === 'applied' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
            onClick={() => setActiveTab("applied")}
          >
            My Applications
          </button>
        </div>

        {loading ? (
          <div className="text-center text-slate-500 py-12">Loading drives...</div>
        ) : activeTab === "available" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {drives.length === 0 && <div className="col-span-full text-slate-500">No active recruitment drives available.</div>}
            
            {drives.map(drive => {
              const hasApplied = applications.some(app => app.driveId?._id === drive._id);
              
              return (
                <div key={drive._id} className={`p-6 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col ${!drive.isEligible ? 'opacity-60' : ''}`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl">
                      {drive.companyId?.logo || "🏢"}
                    </div>
                    <div>
                      <h3 className="text-lg font-600 text-slate-900">{drive.roleTitle}</h3>
                      <p className="text-slate-500 text-sm">{drive.companyId?.name}</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-600 mb-6 flex-1 line-clamp-3">
                    {drive.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
                    <Calendar size={14} />
                    <span>Deadline: {format(new Date(drive.deadline), "MMM dd, yyyy")}</span>
                  </div>

                  <div className="mt-auto flex flex-col gap-3">
                    {drive.majorFitTier === "atypical" && (
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 text-amber-600 text-sm border border-amber-500/20">
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        <span>{drive.majorFitNote}</span>
                      </div>
                    )}

                    {!drive.isEligible ? (
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm border border-red-500/20">
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        <span>{drive.ineligibilityReason}</span>
                      </div>
                    ) : hasApplied ? (
                      <div className="w-full py-2.5 rounded-xl bg-green-500/10 text-green-600 font-500 text-sm text-center flex justify-center items-center gap-2 border border-green-500/20">
                        <CheckCircle2 size={16} /> Applied
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleApply(drive._id)}
                        className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-500 text-sm transition-colors"
                      >
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-6">
            {applications.length === 0 && <div className="text-slate-500">You haven't applied to any drives yet.</div>}
            
            {applications.map(app => (
              <div key={app._id} className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-600 text-slate-900 flex items-center gap-3">
                      {app.driveId?.roleTitle} at {app.driveId?.companyId?.name}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Applied on {format(new Date(app.createdAt), "MMM dd, yyyy")}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-600 border capitalize ${getStatusColor(app.status)}`}>
                    {app.status.replace("_", " ")}
                  </div>
                </div>

                <div className="space-y-4 border-t border-slate-100 pt-6">
                  <h4 className="text-sm font-600 text-slate-800 mb-4">Application Proofs (Screenshots)</h4>
                  
                  {["applied", "interview", "offer_letter"].map(stage => {
                    const existingProof = app.proofs?.find((p: any) => p.stage === stage);
                    const isUploadingThis = uploadingStage === stage && targetAppId === app._id;
                    
                    return (
                      <div key={stage} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-3">
                          <FileImage className="text-slate-400" size={20} />
                          <span className="text-sm font-500 text-slate-700 capitalize">
                            {stage.replace("_", " ")} Proof
                          </span>
                        </div>
                        
                        {existingProof ? (
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500 mr-2">
                              Uploaded {format(new Date(existingProof.uploadedAt), "MMM dd")}
                            </span>
                            <a href={`${import.meta.env.VITE_API_URL}${existingProof.fileUrl}`} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 text-sm font-500">
                              View Image
                            </a>
                          </div>
                        ) : isUploadingThis ? (
                          <div className="flex items-center gap-2">
                            <input 
                              type="file" 
                              accept="image/png, image/jpeg"
                              className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer"
                              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                            />
                            <button 
                              onClick={() => handleUploadProof(app._id, stage)}
                              disabled={!selectedFile}
                              className="px-3 py-1 bg-indigo-500 text-white text-xs rounded font-500 disabled:opacity-50"
                            >
                              Save
                            </button>
                            <button onClick={() => setUploadingStage("")} className="text-slate-400 hover:text-slate-600">
                              <XCircle size={16} />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => { setUploadingStage(stage); setTargetAppId(app._id); setSelectedFile(null); }}
                            className="flex items-center gap-1.5 text-xs font-500 text-slate-500 hover:text-indigo-600 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm hover:shadow"
                          >
                            <Upload size={14} /> Upload Image
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
