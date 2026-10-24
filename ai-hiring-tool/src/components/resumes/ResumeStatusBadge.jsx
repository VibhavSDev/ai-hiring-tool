export const ResumeStatusBadge = ({ status }) => {
  const styles = {
    uploaded: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    parsed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    failed: "bg-red-500/10 text-red-400 border-red-500/20",
    scored: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border capitalize ${styles[status] || "bg-slate-500/10 text-slate-400 border-slate-500/20"}`}>
      {status || "unknown"}
    </span>
  );
};

export const ConfidenceScore = ({ score }) => {
  if (!score) return <span className="text-slate-600">—</span>;
  
  const textColor = score >= 85 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-red-400";
  
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-12 rounded-full bg-slate-800 overflow-hidden hidden sm:block">
        <div className={`h-full ${score >= 85 ? 'bg-emerald-500' : 'bg-amber-500'} transition-all`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-xs font-mono font-bold ${textColor}`}>{score}%</span>
    </div>
  );
};