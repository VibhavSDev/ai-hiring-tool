import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../services/api";
import { Plus, RefreshCcw, Search } from "lucide-react";
import AddCandidateModal from "../../candidates/AddCandidateModal";

const stageColors = {
    new: "bg-slate-700 text-slate-100",
    screening: "bg-amber-500/15 text-amber-300",
    interview: "bg-sky-500/15 text-sky-300",
    offer: "bg-fuchsia-500/15 text-fuchsia-300",
    hired: "bg-emerald-500/15 text-emerald-300",
    rejected: "bg-rose-500/15 text-rose-300",
};

const stageOrder = ["new", "screening", "interview", "offer", "hired", "rejected"];

export default function PipelineTab({ jobId }) {
    const navigate = useNavigate();
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [stageFilter, setStageFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const visibleStages = stageFilter === "all" ? stageOrder : [stageFilter];
    const groupedCandidates = visibleStages.reduce((acc, stage) => {
        acc[stage] = candidates.filter((candidate) => candidate.stage === stage);
        return acc;
    }, {});

    const fetchCandidates = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            // api.js interceptor already unwraps response.data.data globally!
            const payload = await API.get("/candidates", {
                params: {
                    jobId: jobId,
                    stage: stageFilter === "all" ? undefined : stageFilter,
                    search: search || undefined,
                    limit: 50,
                },
            });
            setCandidates(payload?.candidates || payload || []);
        } catch (err) {
            setError(err.message || "Failed to load pipeline");
        } finally {
            setLoading(false);
        }
    }, [jobId, search, stageFilter]);

    useEffect(() => {
        fetchCandidates();
    }, [fetchCandidates]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
        
        {/* Pipeline Controls */}
        <div className="flex flex-col gap-4 rounded-xl border border-white/5 bg-[#111827] p-4 sm:p-5 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row flex-1">
                <label className="flex flex-1 items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-300">
                <Search size={16} className="text-slate-500 shrink-0" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search candidates..."
                    className="w-full bg-transparent outline-none placeholder:text-slate-600"
                />
                </label>
                <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-indigo-500"
                >
                <option value="all">All stages</option>
                {stageOrder.map((stage) => (
                    <option key={stage} value={stage} className="capitalize">{stage}</option>
                ))}
                </select>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                <button
                onClick={() => fetchCandidates()}
                className="flex-1 sm:flex-none rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2"
                title="Refresh Pipeline"
                >
                <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
                <span className="sm:hidden text-xs">Refresh</span>
                </button>
                <button
                onClick={() => setIsModalOpen(true)}
                className="flex-1 sm:flex-none rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                <Plus size={16} /> Add Candidate
                </button>
            </div>

            </div>
        </div>

        <AddCandidateModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            initialJobId={jobId}
            onCreated={() => fetchCandidates()}
        />

        {/* Kanban Board */}
        {loading && candidates.length === 0 ? (
            <div className="py-20 text-center text-slate-500 flex flex-col items-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mb-4"></div>
                Loading pipeline...
            </div>
        ) : error ? (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-6 text-center text-rose-300">
            {error}
            </div>
        ) : (
            <div className={`grid gap-4 overflow-x-auto pb-4 ${
                visibleStages.length === 1 
                ? "grid-cols-1 max-w-sm mx-auto" 
                : "grid-flow-col auto-cols-[280px] sm:auto-cols-[300px] md:grid-flow-row md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
            }`}>
            {visibleStages.map((stage) => (
                <div key={stage} className="flex flex-col min-w-[280px] rounded-xl border border-white/5 bg-[#111827] p-3 shadow-sm">
                <div className="flex items-center justify-between mb-3 px-1">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">{stage}</div>
                    <div className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${stageColors[stage] || stageColors.new}`}>
                    {groupedCandidates[stage]?.length || 0}
                    </div>
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1 max-h-[600px]">
                    {(!groupedCandidates[stage] || groupedCandidates[stage].length === 0) ? (
                    <div className="rounded-lg border border-dashed border-white/10 p-4 text-center text-xs text-slate-500">
                        No candidates
                    </div>
                    ) : (
                    groupedCandidates[stage].map((candidate) => (
                        <div 
                            key={candidate._id} 
                            onClick={() => navigate(`/candidates/${candidate._id}`, { state: { fromJobId: jobId } })}
                            className="group cursor-pointer rounded-lg border border-slate-800 bg-slate-900/50 p-3 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all shadow-sm"
                        >
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                            <div className="text-sm font-bold text-slate-200 truncate group-hover:text-indigo-300 transition-colors">
                                {candidate.name}
                            </div>
                            <div className="mt-0.5 text-[11px] text-slate-500 truncate">
                                {candidate.email}
                            </div>
                            </div>
                        </div>
                        
                        {(candidate.score !== undefined && candidate.score !== null) && (
                            <div className="mt-3 flex items-center gap-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Score</span>
                                <span className="text-xs font-black text-emerald-400">{candidate.score}%</span>
                            </div>
                        )}
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