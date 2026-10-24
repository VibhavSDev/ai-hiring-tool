import { useState } from "react";
import { X, FileText, Database, Code, RefreshCcw, AlertTriangle, ExternalLink, Copy, CheckCircle2 } from "lucide-react";
import API from "../../services/api";

const ResumePreviewDrawer = ({ resume, onClose }) => {
  const [tab, setTab] = useState("overview");
  const [isRetrying, setIsRetrying] = useState(false);
  const [copied, setCopied] = useState(false);
  
  if (!resume) return null;

  const expYears = resume.experienceYears || resume.experience_years || 0;

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(resume, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRetry = async () => {
    try {
      setIsRetrying(true);
      await API.post(`/resumes/${resume._id}/retry`);
      onClose(); 
    } catch (err) {
      alert("Failed to restart parsing. Please check your connection.");
    } finally {
      setIsRetrying(false);
    }
  };

  const isLowConfidence = resume.parseConfidence < 60 || !resume.name || resume.name === "N/A";

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-[#020617] border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-5 bg-slate-950">
          <div className="flex items-center gap-4 min-w-0">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-inner shrink-0 ${
              isLowConfidence ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20"
            }`}>
              {resume.name?.substring(0, 2).toUpperCase() || "?"}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">
                {resume.name && resume.name !== "N/A" ? resume.name : "Unidentified Candidate"}
              </h2>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <p className="text-xs sm:text-sm text-slate-400 truncate">{resume.email || "No email detected"}</p>
                {isLowConfidence && (
                  <span className="flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full border border-amber-500/20 font-bold uppercase">
                    <AlertTriangle size={10} /> Review Needed
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all shrink-0">
            <X size={24} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-6 sm:gap-8 px-6 bg-slate-950 border-b border-white/5 overflow-x-auto">
          <TabBtn active={tab === "overview"} onClick={() => setTab("overview")} icon={<FileText size={16}/>} label="AI Analysis" />
          <TabBtn active={tab === "parsed"} onClick={() => setTab("parsed")} icon={<Database size={16}/>} label="JSON Structure" />
          <TabBtn active={tab === "raw"} onClick={() => setTab("raw")} icon={<Code size={16}/>} label="Original PDF" />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#020617]">
          <div className="p-6">
            {tab === "overview" && <OverviewContent resume={resume} expYears={expYears} />}
            
            {tab === "parsed" && (
              <div className="space-y-4 animate-in fade-in duration-500">
                <div className="flex items-center justify-between bg-white/5 p-3 rounded-t-lg border-x border-t border-white/10">
                  <span className="text-xs text-slate-400 font-mono tracking-wider uppercase">Schema Output</span>
                  <button 
                    onClick={handleCopyJSON} 
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs font-medium text-indigo-400 transition-all border border-white/10"
                  >
                    {copied ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    {copied ? "Copied!" : "Copy JSON"}
                  </button>
                </div>
                <pre className="rounded-b-lg bg-black p-5 text-[12px] font-mono text-indigo-300 border border-white/10 overflow-x-auto leading-relaxed shadow-2xl">
                  {JSON.stringify(resume, null, 2)}
                </pre>
              </div>
            )}

            {tab === "raw" && (
              <div className="h-[70vh] flex flex-col gap-4 animate-in fade-in duration-500">
                <div className="flex justify-between items-center bg-indigo-500/5 p-3 rounded-lg border border-indigo-500/10">
                  <span className="text-xs text-indigo-300 font-medium">Internal PDF Viewer</span>
                  <a href={resume.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                    <ExternalLink size={14} /> Full Screen
                  </a>
                </div>
                <iframe
                  src={`${resume.fileUrl}#toolbar=0&view=FitH`}
                  className="w-full flex-1 rounded-xl border border-white/10 bg-slate-900 shadow-2xl" 
                  title="Resume Preview"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 px-6 py-4 flex items-center justify-between bg-slate-950">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-black tracking-tighter text-slate-500">Parsing Integrity</span>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${(resume.parseConfidence || 0) > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="text-sm text-slate-300 font-semibold italic">
                {resume.parseConfidence || 0}% Accuracy
              </span>
            </div>
          </div>
          
          <button 
            onClick={handleRetry}
            disabled={isRetrying}
            className="group flex items-center gap-2 rounded-lg bg-indigo-600 px-5 sm:px-6 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
          >
            <RefreshCcw size={16} className={isRetrying ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
            {isRetrying ? "Re-processing..." : "Retry Extraction"}
          </button>
        </div>
      </div>
    </>
  );
};

export const TabBtn = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 py-5 text-sm font-bold transition-all relative whitespace-nowrap ${
      active ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"
    }`}
  >
    {icon}
    {label}
    {active && (
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-indigo-500 rounded-t-full shadow-[0_-4px_10px_rgba(99,102,241,0.8)]" />
    )}
  </button>
);

const DrawerSection = ({ title, children }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">
        {title}
      </h4>
      <div className="h-[1px] w-full bg-white/5" />
    </div>
    <div>
      {children}
    </div>
  </div>
);

const OverviewContent = ({ resume, expYears }) => (
  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="grid grid-cols-2 gap-4 sm:gap-6">
      <div className="p-5 rounded-2xl bg-white/5 border border-white/5 shadow-inner group hover:border-indigo-500/30 transition-colors">
        <p className="text-[10px] uppercase text-slate-500 font-black tracking-widest mb-2">Years of Exp</p>
        <p className="text-2xl sm:text-3xl font-black text-indigo-400">{expYears.toFixed(1)} <span className="text-xs sm:text-sm font-normal text-slate-500">Yrs</span></p>
      </div>
      <div className="p-5 rounded-2xl bg-white/5 border border-white/5 shadow-inner group hover:border-emerald-500/30 transition-colors">
        <p className="text-[10px] uppercase text-slate-500 font-black tracking-widest mb-2">Data Quality</p>
        <p className="text-2xl sm:text-3xl font-black text-emerald-400">{resume.parseConfidence || 0}<span className="text-xs sm:text-sm font-normal text-slate-500">%</span></p>
      </div>
    </div>

    <DrawerSection title="Detected Skills">
      <div className="flex flex-wrap gap-2">
        {resume.skills && resume.skills.length > 0 ? (
          resume.skills.map((skill, idx) => (
            <span key={idx} className="rounded-md bg-indigo-500/5 px-3 py-1.5 text-xs font-semibold text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/10 transition-colors cursor-default">
              {skill}
            </span>
          ))
        ) : (
          <div className="w-full p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-center">
            <span className="text-xs text-amber-500 font-medium italic">No technical skills were identified in this document.</span>
          </div>
        )}
      </div>
    </DrawerSection>

    <DrawerSection title="Extracted Raw Content">
      <div className="relative group">
        <div className="absolute inset-0 bg-indigo-500/5 rounded-2xl blur-xl group-hover:bg-indigo-500/10 transition-all" />
        <div className="relative p-6 rounded-2xl bg-black border border-white/5">
          <p className="text-[13px] text-slate-400 font-mono leading-relaxed max-h-[400px] overflow-y-auto custom-scrollbar">
            {resume.rawText || "No raw text available for this candidate."}
          </p>
        </div>
      </div>
    </DrawerSection>
  </div>
);

export default ResumePreviewDrawer;