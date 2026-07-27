import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Plus, Users, Search, Building2, Image as ImageIcon, Calendar } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { TopNav } from "./TopNav";

export function AdminDrivesPage() {
  const token = localStorage.getItem("studentos_token");
  const [drives, setDrives] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create Drive state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDrive, setNewDrive] = useState({ companyId: "", roleTitle: "", description: "", deadline: "" });
  
  // Applications view state
  const [selectedDrive, setSelectedDrive] = useState<any | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [viewProofUrl, setViewProofUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchDrives();
    fetchCompanies();
  }, [token]);

  const fetchDrives = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/drives", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setDrives(data.drives);
    } catch (error) {
      console.error("Failed to fetch drives", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/companies", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setCompanies(data.companies);
    } catch (error) {
      console.error("Failed to fetch companies", error);
    }
  };

  const handleCreateDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/admin/drives", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(newDrive)
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        setNewDrive({ companyId: "", roleTitle: "", description: "", deadline: "" });
        fetchDrives();
      } else {
        alert(data.message || "Failed to create drive");
      }
    } catch (error) {
      console.error(error);
      alert("Error creating drive");
    }
  };

  const fetchApplications = async (driveId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/drives/${driveId}/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setApplications(data.applications);
    } catch (error) {
      console.error("Failed to fetch applications", error);
    }
  };

  const handleUpdateStatus = async (appId: string, status: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/applications/${appId}/status`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        setApplications(apps => apps.map(app => app._id === appId ? { ...app, status } : app));
      } else {
        alert(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error(error);
      alert("Error updating status");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50/50">
      <TopNav title={selectedDrive ? `Applications: ${selectedDrive.roleTitle} at ${selectedDrive.companyId?.name}` : "Recruitment Drives"} />
      
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        
        {!selectedDrive ? (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-600 text-slate-900">All Active Drives</h2>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-500 transition-colors"
              >
                <Plus size={16} /> Create Drive
              </button>
            </div>

            {loading ? (
              <div className="text-center text-slate-500 py-12">Loading drives...</div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {drives.map(drive => (
                  <div key={drive._id} className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col sm:flex-row gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-3xl shrink-0">
                      {drive.companyId?.logo || "🏢"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-600 text-slate-900 mb-1">{drive.roleTitle}</h3>
                      <div className="text-slate-500 text-sm mb-4">{drive.companyId?.name}</div>
                      
                      <div className="flex flex-wrap gap-4 text-xs text-slate-500 mb-6">
                        <div className="flex items-center gap-1.5"><Calendar size={14} /> Deadline: {format(new Date(drive.deadline), "MMM dd, yyyy")}</div>
                      </div>

                      <button 
                        onClick={() => {
                          setSelectedDrive(drive);
                          fetchApplications(drive._id);
                        }}
                        className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-500 text-sm transition-colors flex items-center justify-center gap-2 border border-slate-200"
                      >
                        <Users size={16} /> View Applications
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <button 
              onClick={() => setSelectedDrive(null)}
              className="text-sm text-slate-500 hover:text-slate-900 mb-6 flex items-center gap-2"
            >
              ← Back to Drives
            </button>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-600 bg-slate-50/50">
                    <th className="p-4">Student</th>
                    <th className="p-4">Applied On</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Proofs</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100">
                  {applications.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-500">No applications yet.</td>
                    </tr>
                  )}
                  {applications.map(app => (
                    <tr key={app._id} className="hover:bg-slate-50/50">
                      <td className="p-4">
                        <div className="font-500 text-slate-900">{app.studentId?.user?.name || "Student"}</div>
                        <div className="text-xs text-slate-500">{app.studentId?.rollNumber || "N/A"}</div>
                      </td>
                      <td className="p-4 text-slate-500">
                        {format(new Date(app.createdAt), "MMM dd, yyyy")}
                      </td>
                      <td className="p-4">
                        <select 
                          value={app.status}
                          onChange={(e) => handleUpdateStatus(app._id, e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="applied">Applied</option>
                          <option value="in_process">In Process</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          {["applied", "interview", "offer_letter"].map(stage => {
                            const proof = app.proofs?.find((p: any) => p.stage === stage);
                            if (proof) {
                              return (
                                <button 
                                  key={stage}
                                  onClick={() => setViewProofUrl(`http://localhost:5000${proof.fileUrl}`)}
                                  className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center hover:bg-indigo-500/20"
                                  title={`View ${stage} proof`}
                                >
                                  <ImageIcon size={14} />
                                </button>
                              );
                            }
                            return (
                              <div key={stage} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center" title={`No ${stage} proof`}>
                                <ImageIcon size={14} />
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

      </div>

      {/* Create Drive Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-600 text-slate-900 mb-6">Create Recruitment Drive</h2>
            
            <form onSubmit={handleCreateDrive} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">Company</label>
                <select 
                  required
                  value={newDrive.companyId}
                  onChange={(e) => setNewDrive({...newDrive, companyId: e.target.value})}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Select a company</option>
                  {companies.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">Role Title</label>
                <input 
                  required
                  type="text"
                  value={newDrive.roleTitle}
                  onChange={(e) => setNewDrive({...newDrive, roleTitle: e.target.value})}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. Frontend Engineer"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1.5">Description</label>
                <textarea 
                  required
                  rows={3}
                  value={newDrive.description}
                  onChange={(e) => setNewDrive({...newDrive, description: e.target.value})}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="Job details..."
                />
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1.5">Application Deadline</label>
                <input 
                  required
                  type="date"
                  value={newDrive.deadline}
                  onChange={(e) => setNewDrive({...newDrive, deadline: e.target.value})}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-500 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-500 transition-colors"
                >
                  Create Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Proof Viewer Modal */}
      {viewProofUrl && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4" onClick={() => setViewProofUrl(null)}>
          <div className="relative max-w-5xl max-h-screen p-4">
            <button className="absolute top-0 right-0 bg-white/10 rounded-full w-8 h-8 flex items-center justify-center text-white" onClick={() => setViewProofUrl(null)}>×</button>
            <img src={viewProofUrl} alt="Application Proof" className="max-w-full max-h-[85vh] rounded-lg object-contain" onClick={e => e.stopPropagation()} />
          </div>
        </div>
      )}
    </div>
  );
}
