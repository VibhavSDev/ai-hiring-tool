import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import API from "../../services/api";
import { 
  ArrowLeft, Briefcase, CheckCircle2, CircleOff, MessageSquareText, 
  Mail, Phone, Clock3, FileText, ExternalLink, ChevronRight, Upload, Loader2
} from "lucide-react";

// Components
import InterviewQuestions from "../../components/InterviewQuestions";
import CandidateScoreCard from "../../components/CandidateScoreCard";

const stageOrder = ["new", "screening", "interview", "offer", "hired", "rejected"];
const stageColors = {
  new: "bg-slate-700 text-slate-100 border-slate-600",
  screening: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  interview: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  offer: "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30",
  hired: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  rejected: "bg-rose-500/15 text-rose-400 border-rose-500/30",
};

// Job Assigner Component for the Action Center
function JobAssigner({ candidate, onAssigned }) {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(candidate?.jobId?._id || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setSelectedJobId(candidate?.jobId?._id || candidate?.jobId || "");
  }, [candidate]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const payload = await API.get("/jobs", { params: { status: "active" } });
        setJobs(payload?.jobs || payload || []);
      } catch (err) {
        console.error("Failed to load jobs list", err);
      }
    };
    fetchJobs();
  }, []);

  const handleAssign = async (e) => {
    const jobId = e.target.value;
    setSelectedJobId(jobId);

    try {
      setLoading(true);
      setMessage("");
      const payload = await API.patch(`/candidates/${candidate._id}/assign-job`, { jobId: jobId || null });
      const updatedCandidate = payload?.candidate || payload?.data?.candidate || payload;
      if (onAssigned) onAssigned(updatedCandidate);
      setMessage("Job updated!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.message || "Failed to assign job.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-[#111827] p-5 shadow-xl shrink-0">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">
        <Briefcase size={14} /> Assigned Role / Job
      </div>
      <select
        value={selectedJobId}
        onChange={handleAssign}
        disabled={loading}
        className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500/50 transition-colors"
      >
        <option value="">-- General Pool (Unassigned) --</option>
        {jobs.map((job) => (
          <option key={job._id} value={job._id}>
            {job.title} ({job.department})
          </option>
        ))}
      </select>
      {message && <div className="mt-2 text-[10px] font-bold text-indigo-400">{message}</div>}
    </div>
  );
}

export default function CandidateDetailPage() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const jobIdFromState = location.state?.fromJobId; 
  
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [note, setNote] = useState("");
  const [updating, setUpdating] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  
  const [rightPanelTab, setRightPanelTab] = useState("resume"); 

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        setLoading(true);
        const payload = await API.get(`/candidates/${candidateId}`);
        setCandidate(payload?.candidate || payload?.data || payload || null);
      } catch (err) {
        setError(err.message || "Failed to load candidate");
      } finally {
        setLoading(false);
      }
    };

    if (candidateId) fetchCandidate();
  }, [candidateId]);

  const handleStageChange = async (newStage) => {
    if (newStage === candidate.stage) return;
    try {
      setUpdating(true);
      const payload = await API.patch(`/candidates/${candidateId}/stage`, { stage: newStage, note });
      const updatedData = payload?.candidate || payload?.data?.candidate || payload?.data || payload;
      setCandidate(updatedData);
      setNote(""); 
    } catch (err) {
      setError(err.message || "Failed to update stage");
    } finally {
      setUpdating(false);
    }
  };

  const handleSingleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingResume(true);
      const formData = new FormData();
      formData.append("resume", file);
      if (candidate.jobId?._id || candidate.jobId) {
        formData.append("jobId", candidate.jobId?._id || candidate.jobId);
      }

      const payload = await API.post(`/candidates/${candidateId}/resume`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedCandidate = payload?.candidate || payload?.data?.candidate || payload;
      setCandidate((prev) => ({ ...prev, ...updatedCandidate }));
    } catch (err) {
      alert(err.message || "Failed to upload resume.");
    } finally {
      setUploadingResume(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mb-4 shadow-lg shadow-indigo-500/20"></div>
        <span className="text-sm font-bold uppercase tracking-widest animate-pulse">Loading Workspace...</span>
      </div>
    );
  }

  if (error || !candidate) {
    return <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-10 text-center text-rose-300">{error || "Candidate not found"}</div>;
  }

  const activeStage = candidate.stage || "new";
  const activityTimeline = [
    ...(candidate.application?.stageHistory || []).map((entry) => ({
      type: "stage", label: `Moved to ${entry.stage}`, detail: entry.note, timestamp: entry.changedAt,
    })),
    ...(candidate.application?.notesHistory || []).map((entry) => ({
      type: "note", label: "Note added", detail: entry.note, timestamp: entry.createdAt,
    })),
    ...(candidate.application?.evaluations || []).map((entry) => ({
      type: "score", label: `Score ${entry.score}`, detail: entry.feedback, timestamp: entry.createdAt,
    })),
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);

  const resumeUrl = candidate.resumeId?.fileUrl;

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] min-h-[800px] animate-in fade-in duration-500">
      
      {/* 1. Header & Navigation */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => jobIdFromState ? navigate(`/jobs/${jobIdFromState}`) : navigate(-1)} 
            className="flex items-center justify-center h-8 w-8 rounded-lg border border-white/10 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
            <span className="truncate max-w-[200px]">{candidate.jobId?.title || "General Pool"}</span>
            <ChevronRight size={14} className="opacity-50" />
            <span className="text-indigo-400">Candidate Workspace</span>
          </div>
        </div>
      </div>

      {/* 2. Side-by-Side Workspace */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT PANEL: Recruiter Action Center */}
        <div className="w-full lg:w-[450px] xl:w-[500px] flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2 pb-10">
          
          {/* Identity Card */}
          <div className="rounded-2xl border border-white/5 bg-[#111827] p-5 shadow-xl shrink-0">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-black shadow-lg shadow-indigo-500/20">
                {candidate.name?.substring(0, 2).toUpperCase() || "CN"}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-white truncate">{candidate.name}</h1>
                <p className="text-sm text-slate-400 truncate">{candidate.email}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border ${stageColors[activeStage]}`}>
                    {activeStage}
                  </span>
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border border-white/10 bg-white/5 text-slate-300">
                    Source: {candidate.source || "Manual"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Job Assigner Component */}
          <JobAssigner 
            candidate={candidate} 
            onAssigned={(updated) => setCandidate((prev) => ({ ...prev, ...updated }))} 
          />

          {/* Workflow / Stage Manager */}
          <div className="rounded-2xl border border-white/5 bg-[#111827] p-5 shadow-xl shrink-0">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4">Pipeline Stage</h2>
            <div className="grid grid-cols-3 gap-2">
              {stageOrder.map((stage) => (
                <button
                  key={stage}
                  onClick={() => handleStageChange(stage)}
                  disabled={updating}
                  className={`
                    flex flex-col items-center justify-center gap-1 rounded-xl p-2.5 text-xs font-bold transition-all border
                    ${activeStage === stage 
                      ? "bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]" 
                      : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                    }
                    ${updating ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                >
                  {stage === "hired" ? <CheckCircle2 size={14} /> : stage === "rejected" ? <CircleOff size={14} /> : null}
                  <span className="capitalize">{stage}</span>
                </button>
              ))}
            </div>
            <div className="mt-3">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a reason before moving stage (optional)..."
                className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
          </div>

          {/* AI Score & Feedback */}
          <CandidateScoreCard 
            candidate={candidate} 
            onUpdated={(updated) => setCandidate((prev) => ({ ...prev, ...updated }))} 
          />

          {/* Interview Questions Generator */}
          <InterviewQuestions candidate={candidate} />

          {/* Timeline Feed */}
          {activityTimeline.length > 0 && (
            <div className="rounded-2xl border border-white/5 bg-[#111827] p-5 shadow-xl shrink-0">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-2">
                <Clock3 size={14} /> Activity Feed
              </h2>
              <div className="space-y-3 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">
                {activityTimeline.map((entry, index) => (
                  <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full border border-slate-700 bg-slate-900 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      {entry.type === 'stage' ? <Briefcase size={10} /> : <MessageSquareText size={10} />}
                    </div>
                    <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] rounded-xl border border-slate-800 bg-slate-900/50 p-3 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-xs font-bold text-slate-200">{entry.label}</div>
                        <time className="text-[9px] font-bold uppercase text-slate-500">{new Date(entry.timestamp).toLocaleDateString()}</time>
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{entry.detail || "No notes provided."}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Data & Resume Viewer */}
        <div className="flex-1 flex flex-col rounded-2xl border border-white/5 bg-[#111827] shadow-2xl overflow-hidden min-h-[600px]">
          
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-slate-900/40">
            <div className="flex gap-4">
              <button
                onClick={() => setRightPanelTab("resume")}
                className={`text-sm font-bold transition-colors ${rightPanelTab === "resume" ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"}`}
              >
                Resume Document
              </button>
              <button
                onClick={() => setRightPanelTab("profile")}
                className={`text-sm font-bold transition-colors ${rightPanelTab === "profile" ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"}`}
              >
                Profile Details
              </button>
            </div>
            
            {rightPanelTab === "resume" && resumeUrl && (
              <a 
                href={resumeUrl} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg"
              >
                <ExternalLink size={14} /> Open Native
              </a>
            )}
          </div>

          <div className="flex-1 overflow-y-auto bg-[#0b0f14] custom-scrollbar p-0">
            {rightPanelTab === "resume" && (
              <div className="h-full w-full flex flex-col">
                {resumeUrl ? (
                  <iframe 
                    src={`${resumeUrl}#toolbar=0&view=FitH`} 
                    className="w-full h-full border-none"
                    title={`${candidate.name} Resume`}
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-10 text-slate-500">
                    <FileText size={48} className="mb-4 opacity-20" />
                    <p className="text-sm font-bold text-slate-300">No resume attached</p>
                    <p className="text-xs mt-1 mb-6">Attach a resume document to enable AI parsing and viewer.</p>
                    
                    <label className="cursor-pointer rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                      {uploadingResume ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                      {uploadingResume ? "Uploading..." : "Upload Resume Document"}
                      <input 
                        type="file" 
                        accept=".pdf,.doc,.docx" 
                        onChange={handleSingleResumeUpload} 
                        disabled={uploadingResume}
                        className="hidden" 
                      />
                    </label>
                  </div>
                )}
              </div>
            )}

            {rightPanelTab === "profile" && (
              <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-300">
                <section>
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4 border-b border-white/5 pb-2">Contact & Source</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4 flex items-center gap-3">
                      <Mail size={16} className="text-slate-500" />
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-500">Email Address</div>
                        <div className="text-sm font-semibold text-slate-200 mt-0.5">{candidate.email}</div>
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4 flex items-center gap-3">
                      <Phone size={16} className="text-slate-500" />
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-500">Phone Number</div>
                        <div className="text-sm font-semibold text-slate-200 mt-0.5">{candidate.phone || "Not provided"}</div>
                      </div>
                    </div>
                  </div>
                </section>

                {(candidate.summary || candidate.notes) && (
                  <section>
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4 border-b border-white/5 pb-2">AI Summary / Notes</h3>
                    <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-5">
                      <p className="text-sm leading-relaxed text-slate-300">
                        {candidate.summary || candidate.notes}
                      </p>
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}