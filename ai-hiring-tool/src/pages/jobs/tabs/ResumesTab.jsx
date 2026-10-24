import { useState, useCallback, useEffect, useRef } from "react";
import { Upload, RefreshCw, Eye, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import API from "../../../services/api";
import ResumePreviewDrawer from "../../../components/resumes/ResumePreviewDrawer";
import { ResumeStatusBadge } from "../../../components/resumes/ResumeStatusBadge";
import { StatCard } from "../../../components/resumes/StatCard";
import { ConfidenceScore } from "../../../components/resumes/ResumeStatusBadge";
import ResumeUploadModal from "../../../components/resumes/ResumeUploadModal";

const ResumesTab = ({ jobId }) => {
  const [resumes, setResumes] = useState([]);
  const [resumeStats, setResumeStats] = useState({ parsed: 0, failed: 0, scored: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Filter State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [selectedResume, setSelectedResume] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const pollingIntervalRef = useRef(null);

  const fetchResumes = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);

      // api.js interceptor already unwraps response.data globally!
      const payload = await API.get(`/resumes/job/${jobId}`, {
        params: {
          page,
          limit: 10,
          status: statusFilter === "all" ? undefined : statusFilter,
          sortBy: "createdAt",
          order: "desc"
        }
      });

      const { resumes: data, stats, pagination } = payload || {};
      setResumes(data || []);
      setResumeStats(stats || { parsed: 0, failed: 0, scored: 0 });
      setTotalPages(pagination?.totalPages || 1);
    } catch (err) {
      setError(err.message || "Failed to load resumes");
    } finally {
      setLoading(false);
    }
  }, [jobId, page, statusFilter]);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  // Handle Polling Logic
  useEffect(() => {
    const hasProcessing = resumes.some(r => r.status === 'uploaded' || r.status === 'parsing');

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    if (!hasProcessing) return;

    pollingIntervalRef.current = setInterval(() => {
      fetchResumes(true); 
    }, 3000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchResumes, resumes]);

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleDelete = async (resumeId) => {
    if (!window.confirm("Are you sure you want to permanently delete this candidate?")) return;

    try {
      await API.delete(`/resumes/${resumeId}`);
      fetchResumes(true); 
    } catch (err) {
      alert("Failed to delete resume.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Upload & Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <select 
            value={statusFilter}
            onChange={handleStatusChange}
            className="bg-[#111827] border border-white/10 text-slate-300 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
          >
            <option value="all">All Candidates</option>
            <option value="parsed">Parsed Successfully</option>
            <option value="scored">Scored</option>
            <option value="failed">Failed</option>
          </select>
          <button 
            onClick={() => fetchResumes()}
            className="p-2 text-slate-400 hover:text-indigo-400 transition-colors"
            title="Refresh List"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
        >
          <Upload size={16} /> Add Candidates
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Pool" value={resumes.length} color="indigo" />
        <StatCard label="AI Parsed" value={resumeStats.parsed} color="emerald" />
        <StatCard label="Failed" value={resumeStats.failed} color="red" />
        <StatCard label="Shortlisted" value={resumeStats.scored} color="amber" />
      </div>

      {/* Table Section */}
      <div className="rounded-xl bg-[#111827] border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[600px]">
            <thead className="bg-slate-900/50 border-b border-white/5">
              <tr className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold">
                <th className="px-6 py-4">Candidate Profile</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Confidence</th>
                <th className="px-6 py-4">Date Added</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <LoadingSkeleton />
              ) : resumes.length === 0 ? (
                <EmptyState onClear={() => setStatusFilter("all")} />
              ) : (
                resumes.map((resume) => (
                  <tr key={resume._id} className="group hover:bg-white/2 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {(resume.status === "uploaded" || resume.status === "parsing") && (
                          <RefreshCw size={14} className="animate-spin text-indigo-500 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-200 truncate">
                            {resume.name && resume.name !== "N/A" ? resume.name : "Extracting Name..."}
                          </div>
                          <div className="text-xs text-slate-500 font-mono truncate">
                            {resume.email || "pending..."}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <ResumeStatusBadge status={resume.status} />
                    </td>
                    <td className="px-6 py-4">
                      <ConfidenceScore score={resume.parseConfidence} />
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs whitespace-nowrap">
                      {resume.createdAt ? new Date(resume.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => setSelectedResume(resume)}
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                          title="Preview Resume"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(resume._id)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                          title="Delete Resume"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-900/20 border-t border-white/5">
            <span className="text-xs text-slate-500 font-medium">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-1.5 rounded bg-slate-800 text-slate-400 disabled:opacity-30 hover:text-white transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-1.5 rounded bg-slate-800 text-slate-400 disabled:opacity-30 hover:text-white transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <ResumePreviewDrawer
        resume={selectedResume}
        onClose={() => setSelectedResume(null)}
      />

      <ResumeUploadModal
        jobId={jobId}
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={() => fetchResumes(true)}
      />
    </div>
  );
};

const LoadingSkeleton = () => (
  Array.from({ length: 5 }).map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td colSpan={5} className="px-6 py-6"><div className="h-4 bg-slate-800 rounded w-full opacity-50"></div></td>
    </tr>
  ))
);

const EmptyState = ({ onClear }) => (
  <tr>
    <td colSpan={5} className="py-20 text-center">
      <p className="text-slate-500">No candidates match your current filter.</p>
      <button onClick={onClear} className="mt-2 text-indigo-400 text-xs hover:underline">Clear all filters</button>
    </td>
  </tr>
);

export default ResumesTab;