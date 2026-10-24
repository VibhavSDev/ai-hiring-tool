import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../../services/api";
import { Plus, RefreshCcw, Search, Upload, FolderInput } from "lucide-react";
import AddCandidateModal from "./AddCandidateModal";
import ResumeUploadModal from "../../components/resumes/ResumeUploadModal";

const stageColors = {
  new: "bg-slate-700 text-slate-100",
  screening: "bg-amber-500/15 text-amber-300",
  interview: "bg-sky-500/15 text-sky-300",
  offer: "bg-fuchsia-500/15 text-fuchsia-300",
  hired: "bg-emerald-500/15 text-emerald-300",
  rejected: "bg-rose-500/15 text-rose-300",
};

const stageOrder = ["new", "screening", "interview", "offer", "hired", "rejected"];

export default function CandidatesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stageFilter, setStageFilter] = useState(searchParams.get("stage") || "all");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const jobFilter = searchParams.get("jobId") || "";

  const visibleStages = stageFilter === "all" ? stageOrder : [stageFilter];
  const groupedCandidates = visibleStages.reduce((acc, stage) => {
    acc[stage] = candidates.filter((candidate) => candidate.stage === stage);
    return acc;
  }, {});

  const fetchCandidates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const payload = await API.get("/candidates", {
        params: {
          stage: stageFilter === "all" ? undefined : stageFilter,
          search: search || undefined,
          jobId: jobFilter || undefined,
          limit: 50,
        },
      });
      setCandidates(payload?.candidates || payload || []);
    } catch (err) {
      setError(err.message || "Failed to load candidates");
    } finally {
      setLoading(false);
    }
  }, [jobFilter, search, stageFilter]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const updateQuery = (nextStage, nextSearch) => {
    const params = new URLSearchParams();
    if (jobFilter) params.set("jobId", jobFilter);
    if (nextStage && nextStage !== "all") params.set("stage", nextStage);
    if (nextSearch) params.set("search", nextSearch);
    setSearchParams(params);
    setStageFilter(nextStage);
    setSearch(nextSearch);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-20 animate-in fade-in duration-500 px-4 sm:px-6">
      {/* Header Panel */}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-[#111827] p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-400">Candidate pipeline</p>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">Pipeline Overview</h1>
            {jobFilter && (
              <p className="mt-1 text-xs text-slate-400">Showing candidates for the selected job</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => fetchCandidates()}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 transition-colors flex items-center gap-1.5"
            >
              <RefreshCcw size={16} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
            <button
              onClick={() => setIsResumeModalOpen(true)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Upload size={16} /> Upload Resumes
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-1.5"
            >
              <Plus size={16} /> Add Candidate
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <label className="flex flex-1 items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-300">
            <Search size={16} className="text-slate-500 shrink-0" />
            <input
              value={search}
              onChange={(event) => updateQuery(stageFilter, event.target.value)}
              placeholder="Search by name or email"
              className="w-full bg-transparent outline-none placeholder:text-slate-600"
            />
          </label>
          <select
            value={stageFilter}
            onChange={(event) => updateQuery(event.target.value, search)}
            className="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-200 outline-none capitalize"
          >
            <option value="all">All stages</option>
            {stageOrder.map((stage) => (
              <option key={stage} value={stage} className="capitalize">{stage}</option>
            ))}
          </select>
        </div>
      </div>

      <AddCandidateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialJobId={jobFilter || undefined}
        onCreated={() => fetchCandidates()}
      />

      <ResumeUploadModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        jobId={jobFilter || undefined}
        onUploadSuccess={() => {
          setIsResumeModalOpen(false);
          fetchCandidates();
        }}
      />

      {/* Main Content Area */}
      {loading ? (
        <div className="rounded-2xl border border-white/5 bg-[#111827] p-12 text-center text-slate-400 animate-pulse">
          Loading candidates…
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-12 text-center text-rose-300">
          {error}
        </div>
      ) : candidates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-[#111827] p-16 text-center text-slate-400">
          <FolderInput className="mx-auto text-slate-600 mb-3" size={40} />
          <p className="font-semibold text-slate-300">No candidates in the pipeline yet.</p>
          <p className="text-xs text-slate-500 mt-1">Upload resumes or add a candidate manually to get started.</p>
        </div>
      ) : (
        /* Kanban Horizontal Scroll Container */
        <div className="flex gap-4 overflow-x-auto pb-6 pt-1 custom-scrollbar">
          {visibleStages.map((stage) => (
            <div 
              key={stage} 
              className="flex flex-col shrink-0 w-[300px] sm:w-[320px] rounded-2xl border border-white/5 bg-[#111827] p-4 shadow-xl h-[calc(100vh-320px)] min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 capitalize">{stage}</div>
                <div className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${stageColors[stage] || stageColors.new}`}>
                  {groupedCandidates[stage]?.length || 0}
                </div>
              </div>

              {/* Column Body List */}
              <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1">
                {(!groupedCandidates[stage] || groupedCandidates[stage].length === 0) ? (
                  <div className="rounded-xl border border-dashed border-slate-800/80 p-6 text-center text-xs text-slate-600">
                    No candidates in this stage
                  </div>
                ) : (
                  groupedCandidates[stage].map((candidate) => (
                    <div 
                      key={candidate._id} 
                      className="group rounded-xl border border-slate-800 bg-slate-900/80 p-4 hover:border-indigo-500/40 transition-all shadow-md flex flex-col justify-between gap-3 relative"
                    >
                      {/* Top Info */}
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-white tracking-wide truncate group-hover:text-indigo-300 transition-colors">
                          {candidate.name}
                        </div>
                        <div className="text-xs text-slate-400 truncate">
                          {candidate.email}
                        </div>
                      </div>

                      {/* Footer Badge and Action Button */}
                      <div className="flex items-center justify-between pt-2.5 border-t border-white/5 gap-2">
                        <span className="text-[10px] font-medium text-slate-400 bg-slate-800/90 px-2 py-0.5 rounded truncate max-w-[150px]">
                          {candidate.jobId?.title || "General Pool"}
                        </span>
                        <button
                          onClick={() => navigate(`/candidates/${candidate._id}`)}
                          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-all shadow-sm shrink-0"
                        >
                          Open
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}