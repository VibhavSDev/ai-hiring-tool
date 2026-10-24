import React from "react";
import { useNavigate } from "react-router-dom";
import { RotateCcw, Eye, ArrowUpRight, PlayCircle, Clock } from "lucide-react";
import { SegmentedProgress } from "./SegmentProgress";
import JobStatusBadge from "../JobStatusBadge";

export const OrchestrationRow = ({ job, isSelected, onToggle, onShowHistory }) => {
    const navigate = useNavigate();
    
    const isRunning = job.status === "processing";
    const isFailed = job.status === "failed";
    const isCompleted = job.status === "completed";
    const isNotStarted = job.status === "not_started";

    const calculateETA = (progress) => {
        if (!progress || !progress.total || progress.processed === undefined) return "Calculating...";
        const remaining = progress.total - progress.processed;
        if (remaining <= 0) return "Finishing...";
        
        const secondsPerCandidate = 2.5; 
        const totalSeconds = remaining * secondsPerCandidate;
        
        return totalSeconds > 60 
            ? `${Math.ceil(totalSeconds / 60)}m left` 
            : `${Math.round(totalSeconds)}s left`;
    };
    
    const handleViewResults = () => {
        if (job.lastRunId) {
            navigate(`/scoring-jobs/${job.lastRunId}`);
        }
    };

    return (
        <tr className={`group border-b border-white/5 transition-all duration-200 hover:bg-white/[0.02] ${isSelected ? 'bg-indigo-500/5' : ''}`}>
            {/* 1. Selection Checkbox */}
            <td className="px-6 py-5">
                <input 
                    type="checkbox" 
                    checked={isSelected} 
                    onChange={() => onToggle(job._id)}
                    disabled={isRunning}
                    className="h-4 w-4 rounded border-white/10 bg-slate-900 text-indigo-600 focus:ring-indigo-500 disabled:opacity-20 cursor-pointer"
                />
            </td>
            
            {/* 2. Job Info */}
            <td className="px-6 py-5">
                <div className="font-bold text-slate-200 group-hover:text-white transition-colors">
                    {job.title}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-black mt-0.5 flex items-center gap-2">
                    {job.department || "General"}
                    {/* Tiny Indicator if history exists */}
                    {job.lastRunId && <div className="h-1 w-1 rounded-full bg-slate-700" />}
                </div>
            </td>

            {/* 3. Segmented Progress Bar */}
            <td className="px-6 py-5 min-w-[240px]">
                <SegmentedProgress 
                    total={job.progress?.total || 0} 
                    processed={job.progress?.processed || 0} 
                    failed={job.errorCount || 0} 
                />
            </td>

            {/* 4. Status & ETA */}
            <td className="px-6 py-5">
                <JobStatusBadge status={job.status} />
                {isRunning && (
                    <div className="mt-1.5 text-[9px] font-black uppercase tracking-tighter text-indigo-400 animate-pulse flex items-center gap-1">
                        <div className="h-1 w-1 rounded-full bg-indigo-400" />
                        ETA: {calculateETA(job.progress)}
                    </div>
                )}
            </td>

            {/* 5. Dynamic Contextual Actions */}
            <td className="px-6 py-5 text-right">
                <div className="flex justify-end items-center gap-2">
                    {/* HISTORY TRIGGER: Visible on hover for started jobs */}
                    {!isNotStarted && (
                        <button 
                            onClick={() => onShowHistory(job)}
                            className="p-2 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all opacity-0 group-hover:opacity-100"
                            title="View Run History"
                        >
                            <Clock size={16} />
                        </button>
                    )}

                    <div className="flex gap-2">
                        {isCompleted ? (
                            <button 
                                onClick={handleViewResults}
                                className="flex items-center gap-2 rounded-lg bg-indigo-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all shadow-lg shadow-indigo-500/0 hover:shadow-indigo-500/20"
                            >
                                Results <ArrowUpRight size={12} />
                            </button>
                        ) : isFailed ? (
                            <button className="flex items-center gap-2 rounded-lg bg-rose-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-rose-400 hover:bg-rose-500 hover:text-white transition-all">
                                <RotateCcw size={12} /> Retry
                            </button>
                        ) : isNotStarted ? (
                            <button 
                                onClick={() => onToggle(job._id)}
                                className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all"
                            >
                                <PlayCircle size={12} /> Ready
                            </button>
                        ) : (
                            <button className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-200 transition-all cursor-not-allowed">
                                <Eye size={12} /> Logs
                            </button>
                        )}
                    </div>
                </div>
            </td>
        </tr>
    );
};