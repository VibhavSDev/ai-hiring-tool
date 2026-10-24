import React, { useEffect, useState, useMemo } from "react";
import { Loader2, CheckCircle2, AlertCircle, Clock, Zap, Cpu } from "lucide-react";
import { useScoringSocket } from "../../hooks/useScoringSocket";
import API from "../../services/api";

const LiveScoringModal = ({ open, onClose, scoringJobId, onNavigateToResults }) => {
  const [statusData, setStatusData] = useState(null);
  const [startTime] = useState(Date.now());

  // Hook up real-time socket updates
  const { progress: socketProgress, isConnected } = useScoringSocket(scoringJobId);

  useEffect(() => {
    if (!open || !scoringJobId) return;

    const fetchStatus = async () => {
      try {
        const payload = await API.get(`/scoring-jobs/${scoringJobId}/status`);
        setStatusData(payload);

        if (payload?.status === "completed" || payload?.status === "COMPLETED") {
          setTimeout(() => {
            if (onNavigateToResults) {
                onNavigateToResults(scoringJobId);
            }
            onClose();
          }, 2000);
        }
      } catch (err) {
        console.error("Failed to fetch scoring status", err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000); // Polling as a robust backup to sockets

    return () => clearInterval(interval);
  }, [open, scoringJobId, onNavigateToResults, onClose]);

  // Merge REST status data with real-time socket progress if socket data is active
  const activeProgress = useMemo(() => {
    const total = statusData?.progress?.total || socketProgress?.total || 0;
    const processed = socketProgress?.processed > (statusData?.progress?.processed || 0) 
      ? socketProgress.processed 
      : (statusData?.progress?.processed || 0);
    const latestCandidate = socketProgress?.latestCandidate || statusData?.latestProcessedName || "";

    return { processed, total, latestCandidate };
  }, [statusData, socketProgress]);

  const progressPercentage = useMemo(() => {
    if (!activeProgress.total) return 0;
    return Math.round((activeProgress.processed / activeProgress.total) * 100);
  }, [activeProgress]);

  const estimatedRemaining = useMemo(() => {
    if (!activeProgress.total || progressPercentage <= 5 || progressPercentage >= 100) return "Calculating...";
    const elapsed = (Date.now() - startTime) / 1000;
    const rate = activeProgress.processed / (elapsed || 1);
    const remainingItems = activeProgress.total - activeProgress.processed;
    const remainingSeconds = Math.round(remainingItems / rate);
    
    return remainingSeconds > 60 
      ? `${Math.ceil(remainingSeconds / 60)}m remaining` 
      : `${remainingSeconds}s remaining`;
  }, [activeProgress, progressPercentage, startTime]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-md animate-in fade-in duration-300" />

      <div className="relative w-full max-w-xl rounded-2xl bg-[#0b0f14] border border-white/10 shadow-[0_0_50px_-12px_rgba(99,102,241,0.3)] p-6 sm:p-8 overflow-hidden">
        
        <div className="absolute -top-24 -right-24 h-48 w-48 bg-indigo-500/10 blur-[80px]" />

        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">AI Scoring Engine</h2>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">
              Job Run: {scoringJobId?.slice(-8).toUpperCase()} {isConnected && "(Live Stream)"}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-2xl font-black text-white">{progressPercentage}%</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase">Complete</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="h-2 w-full rounded-full bg-slate-800/50 p-0.5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-emerald-500 transition-all duration-500 ease-out shadow-[0_0_15px_rgba(16,185,129,0.4)]"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between items-center px-1">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <Clock size={14} className="text-indigo-400 shrink-0" />
              {estimatedRemaining}
            </div>
            <div className="text-xs text-slate-500">
              {activeProgress.processed} / {activeProgress.total} Candidates
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 my-8">
          <StatusCard 
            label="Queued" 
            value={Math.max(0, activeProgress.total - activeProgress.processed)} 
            icon={<Zap size={14} />} 
          />
          <StatusCard 
            label="Successful" 
            value={activeProgress.processed} 
            icon={<CheckCircle2 size={14} />} 
            activeColor="text-emerald-400" 
          />
          <StatusCard 
            label="Failed" 
            value={statusData?.errorCount || 0} 
            icon={<AlertCircle size={14} />} 
            activeColor="text-red-400" 
          />
        </div>

        <div className="rounded-xl bg-black/40 border border-white/5 p-4 h-32 overflow-y-auto custom-scrollbar font-mono">
          {activeProgress.latestCandidate ? (
            <div className="space-y-2">
              <LogEntry
                message={`Analyzing ${activeProgress.latestCandidate}...`} 
                icon={<Loader2 className="animate-spin text-indigo-400" />} 
              />
              <LogEntry 
                message="Cross-referencing technical skills vs JD requirements" 
                icon={<CheckCircle2 size={10} className="text-emerald-500" />} 
              />
              <LogEntry 
                message="Calculating semantic suitability score" 
                icon={<Zap size={10} className="text-amber-500" />} 
              />
            </div>
          ) : (
            <LogEntry message="Waking up Gemini 2.5 Flash & establishing socket stream..." icon={<Cpu className="animate-pulse" />} />
          )}
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            Run in Background
          </button>
        </div>
      </div>
    </div>
  );
};

const StatusCard = ({ label, value, icon, activeColor = "text-slate-300" }) => (
  <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white/[0.02] border border-white/5">
    <div className="text-slate-500">{icon}</div>
    <span className={`text-lg font-black ${activeColor}`}>{value}</span>
    <span className="text-[9px] font-bold uppercase tracking-tighter text-slate-500">{label}</span>
  </div>
);

const LogEntry = ({ message, icon }) => (
  <div className="flex items-center gap-3 text-[11px] font-medium text-slate-400">
    <div className="shrink-0">{React.cloneElement(icon, { size: 12 })}</div>
    <span className="truncate">{message}</span>
  </div>
);

export default LiveScoringModal;