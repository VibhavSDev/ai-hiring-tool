import { useState } from "react";
import { X, CheckCircle2, AlertCircle, FileText, Fingerprint, Target, Trophy, Cpu, Zap, Loader2 } from "lucide-react";
import API from "../../services/api";

const CandidateScoreDrawer = ({ open, onClose, candidate }) => {
  const [activeTab, setActiveTab] = useState("analysis");
  const [isShortlisting, setIsShortlisting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(candidate?.resumeId?.status || candidate?.status);

  if (!open || !candidate) return null;

  const { 
    scores = {}, 
    signals = { matchedSkills: [], missingSkills: [] }, 
    explanation = {} 
  } = candidate;

  const normalize = (s) => s?.toLowerCase().replace(/[\s\.\-\/]/g, "").trim();

  const getBonusSkills = (allSkills, matched, missing) => {
    if (!allSkills || !Array.isArray(allSkills)) return [];
    
    const jdSet = new Set([
      ...(matched || []).map(normalize),
      ...(missing || []).map(normalize)
    ]);
    
    return allSkills.filter(skill => !jdSet.has(normalize(skill))).slice(0, 8);
  };

  const handleShortlist = async () => {
    try {
      setIsShortlisting(true);
      
      // 1. Bulletproof ID extraction
      const resumeObj = candidate?.resumeId || candidate.resumeId?.id;
      const extractedId = typeof resumeObj === 'object' && resumeObj !== null
        ? (resumeObj._id || resumeObj.id) // If populated object, grab the ID string
        : (resumeObj || candidate?._id || candidate?.id); // If string or undefined, fallback safely
      
      const targetShortlistState = currentStatus !== 'shortlisted';
      
      // 2. Use the extractedId
      const payload = await API.patch(`/resumes/${extractedId}/shortlist`, {
        isShortlisted: targetShortlistState
      });
      
      setCurrentStatus(targetShortlistState ? 'shortlisted' : 'parsed');
    } catch (err) {
      console.error("Shortlist toggle failed", err);
    } finally {
      setIsShortlisting(false);
    }
  };

  const bonusSkills = getBonusSkills(
    candidate.resumeId?.skills || candidate.skills, 
    signals.matchedSkills, 
    signals.missingSkills
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-300" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-[#020617] shadow-2xl flex flex-col border-l border-white/10 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-6 bg-slate-950">
          <div className="flex items-center gap-4 min-w-0">
            <div className={`h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner shrink-0 ${
               explanation.recommendation === 'strong_yes' ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30" : "bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/30"
            }`}>
              {(candidate.resumeId?.name || candidate.name || "C").substring(0, 1)}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight truncate">{candidate.resumeId?.name || candidate.name || "Candidate"}</h2>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <RecommendationBadge rec={explanation.recommendation} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 font-mono">
                  Ranked #{candidate.rank || "—"}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Match</p>
                <p className={`text-2xl sm:text-3xl font-black leading-none ${getScoreTextColor(scores.overall)}`}>
                    {scores.overall}%
                </p>
            </div>
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-all">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Breakdown Tiles */}
        <div className="grid grid-cols-3 divide-x divide-white/5 bg-slate-900/10 border-b border-white/10">
          <BreakdownTile label="Technical" value={scores.skill} icon={<Target size={14} />} color="text-indigo-400" />
          <BreakdownTile label="Experience" value={scores.experience} icon={<FileText size={14} />} color="text-emerald-400" />
          <BreakdownTile label="Semantic" value={scores.semantic} icon={<Fingerprint size={14} />} color="text-amber-400" />
        </div>

        {/* Tabs */}
        <div className="flex px-6 bg-slate-950 overflow-x-auto">
          <TabButton active={activeTab === "analysis"} onClick={() => setActiveTab("analysis")} label="Requirement Fit" />
          <TabButton active={activeTab === "ai"} onClick={() => setActiveTab("ai")} label="AI Reasoning" />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-8 space-y-10 bg-[#020617] custom-scrollbar">
          {activeTab === "analysis" && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Section title="Tech Stack Density" icon={<Cpu size={16} className="text-indigo-400" />}>
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                  <div className="flex flex-wrap justify-center gap-3">
                    {signals.matchedSkills?.map((skill, idx) => (
                      <span key={`match-${idx}`} className="cursor-default rounded-full bg-emerald-500/10 px-4 py-2 text-xs sm:text-sm font-black text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                        {skill}
                      </span>
                    ))}

                    {signals.missingSkills?.map((skill, idx) => (
                      <span key={`miss-${idx}`} className="cursor-default rounded-full bg-transparent px-3 py-1.5 text-xs font-bold text-slate-600 border border-slate-800">
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex justify-center gap-6 mt-8 pt-6 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Confirmed Match</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full border border-slate-600" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Requirement Gap</span>
                    </div>
                  </div>
                </div>
              </Section>

              <Section title="Bonus Skillset" icon={<Trophy size={16} className="text-violet-500" />}>
                <div className="flex flex-wrap gap-2">
                  {bonusSkills.length > 0 ? (
                    bonusSkills.map((skill, idx) => (
                      <span key={idx} className="rounded-lg bg-violet-500/5 px-3 py-1.5 text-xs font-bold text-violet-400 border border-violet-500/20">
                        + {skill}
                      </span>
                    ))
                  ) : <p className="text-xs text-slate-500 italic">No additional specialized skills found.</p>}
                </div>
              </Section>
            </div>
          )}

          {activeTab === "ai" && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="bg-indigo-500/5 p-6 rounded-2xl border border-indigo-500/10">
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Synthesis Summary</h4>
                <p className="text-sm text-slate-300 leading-relaxed italic">
                  "{explanation.summary || "AI analysis not available for this candidate."}"
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <Section title="Why Hire?">
                  <div className="space-y-3">
                    {explanation.strengths?.map((str, i) => (
                      <div key={i} className="text-xs text-slate-400 flex items-start gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        {str}
                      </div>
                    ))}
                  </div>
                </Section>
                <Section title="Risk Factors">
                  <div className="space-y-3">
                    {explanation.concerns?.map((con, i) => (
                      <div key={i} className="text-xs text-slate-400 flex items-start gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                        <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                        {con}
                      </div>
                    ))}
                  </div>
                </Section>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 px-6 sm:px-8 py-6 flex items-center justify-between bg-slate-950">
           <div className="flex flex-col">
             <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Processing Node</span>
             <span className="text-xs text-slate-400 font-mono">v2.5-flash</span>
           </div>
           <button 
            onClick={handleShortlist}
            disabled={isShortlisting}
            className={`rounded-xl px-6 sm:px-8 py-3 text-sm font-black text-white transition-all shadow-xl flex items-center gap-2 ${
              currentStatus === 'shortlisted' 
              ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20" 
              : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20"
            }`}
          >
            {isShortlisting ? (
              <Loader2 className="animate-spin" size={16} />
            ) : currentStatus === 'shortlisted' ? (
              <CheckCircle2 size={16} />
            ) : (
              <Zap size={16} fill="currentColor" />
            )}
            {currentStatus === 'shortlisted' ? "Shortlisted" : "Shortlist Candidate"}
          </button>
        </div>
      </div>
    </>
  );
};

const BreakdownTile = ({ label, value, icon, color }) => (
  <div className="flex flex-col items-center py-5 px-4 gap-1">
    <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>
    </div>
    <span className={`text-lg sm:text-xl font-black ${color}`}>{value}%</span>
  </div>
);

const RecommendationBadge = ({ rec }) => {
    const styles = {
        strong_yes: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        yes: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        maybe: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        no: "bg-rose-500/10 text-rose-500 border-rose-500/20"
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${styles[rec] || "bg-slate-800 text-slate-400"}`}>
            {rec?.replace('_', ' ')}
        </span>
    );
};

const TabButton = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`py-5 mr-8 sm:mr-10 text-xs font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${
      active ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"
    }`}
  >
    {label}
    {active && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 rounded-t-full" />}
  </button>
);

const Section = ({ title, icon, children }) => (
  <div className="space-y-5">
    <div className="flex items-center gap-4">
        <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.25em] flex items-center gap-2 whitespace-nowrap">
          {icon} {title}
        </h4>
        <div className="h-[1px] w-full bg-white/5" />
    </div>
    {children}
  </div>
);

const getScoreTextColor = (score) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-rose-400";
};

export default CandidateScoreDrawer;