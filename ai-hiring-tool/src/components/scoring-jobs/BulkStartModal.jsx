import { useState, useMemo } from "react";
import { Play, X, Clock, Zap, ShieldAlert, Loader2 } from "lucide-react";
import API from "../../services/api";

export const BulkStartModal = ({ isOpen, onClose, selectedJobs = [], onStarted }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 1. Prediction Logic
    const predictions = useMemo(() => {
        const totalCandidates = selectedJobs.reduce((acc, job) => acc + (job.resumeCount || 0), 0);
        const avgTimePerCandidate = 2.5; // seconds
        const estTotalSeconds = totalCandidates * avgTimePerCandidate;
        
        return {
        totalCandidates,
        estTime: estTotalSeconds > 60 
            ? `${Math.ceil(estTotalSeconds / 60)}m ${estTotalSeconds % 60}s` 
            : `${Math.round(estTotalSeconds)}s`,
        estComputeUnits: totalCandidates * 1.2, // Arbitrary cost units
        };
    }, [selectedJobs]);

    const handleStart = async () => {
        try {
        setIsSubmitting(true);
        const jobIds = selectedJobs.map(j => j._id);
        
        // Bulk endpoint to enqueue multiple scoring jobs
        await API.post("/scoring-jobs/bulk-start", { jobIds });
        
        onStarted();
        onClose();
        } catch (err) {
        alert(err.response?.data?.message || "Failed to initiate bulk scoring");
        } finally {
        setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
        
        <div className="relative w-full max-w-lg rounded-3xl bg-[#0b0f14] border border-white/10 p-8 shadow-2xl space-y-8 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-start">
            <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Confirm Bulk Scoring</h2>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">
                Executing {selectedJobs.length} Job Pipelines
                </p>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                <X size={20} />
            </button>
            </div>

            {/* Prediction Cards */}
            <div className="grid grid-cols-2 gap-3">
            <PredictionCard 
                label="Total Pool" 
                value={predictions.totalCandidates} 
                subtext="Candidates"
                icon={<Zap size={14} className="text-amber-400" />} 
            />
            <PredictionCard 
                label="Est. Duration" 
                value={predictions.estTime} 
                subtext="AI processing"
                icon={<Clock size={14} className="text-indigo-400" />} 
            />
            </div>

            {/* Selected Jobs Summary */}
            <div className="rounded-2xl bg-slate-900/50 border border-white/5 p-4 max-h-40 overflow-y-auto custom-scrollbar">
            <div className="space-y-3">
                {selectedJobs.map(job => (
                <div key={job._id} className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-300">{job.title}</span>
                    <span className="text-slate-500 font-mono">{job.resumeCount} files</span>
                </div>
                ))}
            </div>
            </div>

            {/* Operational Warning */}
            <div className="flex gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
            <ShieldAlert size={18} className="text-amber-500 shrink-0" />
            <p className="text-[11px] text-amber-500/80 leading-relaxed font-medium">
                This action will consume compute credits and trigger background AI workers. 
                Ensure job requirements are finalized before starting.
            </p>
            </div>

            {/* Actions */}
            <button
            onClick={handleStart}
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 py-4 rounded-2xl font-black text-sm text-white shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
            {isSubmitting ? (
                <Loader2 className="animate-spin" size={20} />
            ) : (
                <Play size={16} fill="currentColor" />
            )}
            {isSubmitting ? "Orchestrating Pipelines..." : "Initialize Scoring Engines"}
            </button>
        </div>
        </div>
    );
};

const PredictionCard = ({ label, value, subtext, icon }) => (
    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
        {icon} {label}
        </div>
        <div className="text-xl font-black text-white">{value}</div>
        <div className="text-[9px] font-bold text-slate-600 uppercase mt-0.5">{subtext}</div>
    </div>
);