import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Search, Filter, Target, Users, Trophy, Eye, Sliders, Loader2, Play, CheckCircle2 } from "lucide-react";
import API from "../../../services/api";
import CandidateScoreDrawer from "../../scoring/CandidateScoreDrawer";
import LiveScoringModal from "../../scoring/LiveScoringModal";
import { StatCard } from "../../../components/resumes/StatCard";

export default function ScoringTab({ jobId }) {
  // --- 1. Scoring Execution State ---
  const [scoringStats, setScoringStats] = useState({ completed: 0, processing: 0, failed: 0 });
  const [isStarting, setIsStarting] = useState(false);
  const [showLiveModal, setShowLiveModal] = useState(false);
  const [currentScoringJobId, setCurrentScoringJobId] = useState(null);
  const isFetchingRef = useRef(false);

  // --- 2. Leaderboard Visualization State ---
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weights, setWeights] = useState({ skill: 0.5, experience: 0.3, semantic: 0.2 });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRec, setFilterRec] = useState("all");
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // --- 3. Combined Fetch Logic ---
  const fetchData = useCallback(async (isSilent = false) => {
    if (!jobId || isFetchingRef.current) return;
    try {
      isFetchingRef.current = true;
      if (!isSilent) setLoading(true);
      
      // api.js interceptor already unwraps response.data globally!
      const [scoringPayload, candidatesPayload] = await Promise.all([
        API.get(`/scoring-jobs/job/${jobId}`),
        API.get(`/jobs/${jobId}/candidates`)
      ]);

      setScoringStats(scoringPayload?.stats || { completed: 0, processing: 0, failed: 0 });

      const rawCandidates = candidatesPayload?.candidates || candidatesPayload || [];
      const normalizedData = rawCandidates.map(c => ({
        ...c,
        resumeId: { id: c.resumeId, name: c.fullName || c.name, email: c.email, ...c.resume },
        scores: {
          overall: c.scoring?.overallScore || c.score || 0,
          skill: c.scoring?.skillMatchScore || 0,
          experience: c.scoring?.experienceScore || 0,
          semantic: c.scoring?.semanticScore || 0,
        },
        explanation: {
          recommendation: c.scoring?.recommendation || 'maybe',
          summary: c.scoring?.aiSummary || c.summary,
          strengths: c.scoring?.strengths || [],
          concerns: c.scoring?.concerns || [],
        },
        signals: {
          matchedSkills: c.scoring?.matchedSkills || [],
          missingSkills: c.scoring?.missingSkills || [],
        }
      }));
      
      setCandidates(normalizedData);
    } catch (err) {
      console.error("Data fetch error:", err);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [jobId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- 4. Trigger Backend Pipeline ---
  const startScoring = async () => {
    try {
      setIsStarting(true);
      const payload = await API.post("/scoring-jobs", { jobId });
      
      setCurrentScoringJobId(payload?._id || payload?.scoringJob?._id);
      setShowLiveModal(true);
      await fetchData(true);
    } catch (err) {
      alert(err.message || "Failed to start scoring");
    } finally {
      setIsStarting(false);
    }
  };

  // --- 5. Dynamic Leaderboard Recalculation ---
  const simulatedResults = useMemo(() => {
    return candidates
      .filter(item => {
        const name = item.resumeId?.name || item.name || "Anonymous";
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterRec === "all" || item.explanation?.recommendation === filterRec;
        return matchesSearch && matchesFilter && item.scores.overall > 0;
      })
      .map(item => {
        const s = item.scores;
        const newOverall = ((s.skill * weights.skill) + (s.experience * weights.experience) + (s.semantic * weights.semantic)).toFixed(1);
        return { ...item, finalScore: parseFloat(newOverall) };
      })
      .sort((a, b) => b.finalScore - a.finalScore)
      .map((item, index) => ({ ...item, rank: index + 1 }));
  }, [candidates, weights, searchTerm, filterRec]);

  // --- 6. Dynamic Stats ---
  const leaderboardStats = useMemo(() => {
    if (!simulatedResults.length) return { avg: 0, top: 0, strong: 0 };
    const scores = simulatedResults.map(r => r.finalScore);
    return {
      avg: (scores.reduce((a, b) => a + b, 0) / simulatedResults.length).toFixed(1),
      top: Math.max(...scores).toFixed(1),
      strong: simulatedResults.filter(r => r.explanation?.recommendation === 'strong_yes').length
    };
  }, [simulatedResults]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Action Panel */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-600/10 via-slate-900 to-transparent p-1 ring-1 ring-white/10 shadow-2xl">
        <div className="bg-[#0f172a]/80 backdrop-blur-xl rounded-[14px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20 shadow-inner shrink-0">
              <Trophy size={28} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">AI Ranker</h3>
              <p className="mt-1 text-sm text-slate-400 max-w-md">
                Analyze all uploaded resumes against this job's requirements.
              </p>
            </div>
          </div>
          
          <button 
            onClick={startScoring}
            disabled={isStarting || scoringStats.processing > 0}
            className="flex items-center justify-center gap-3 rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-black text-white hover:bg-indigo-500 shadow-xl shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {isStarting || scoringStats.processing > 0 ? <Loader2 className="animate-spin" size={20} /> : <Play size={18} fill="currentColor" />}
            {isStarting ? "Warming up AI..." : scoringStats.processing > 0 ? "Scoring in Progress" : "Run AI Scoring"}
          </button>
        </div>
      </div>

      {/* Analytics Grid */}
      {candidates.some(c => c.scores.overall > 0) && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Ranked Profiles" value={simulatedResults.length} icon={<Users size={14}/>} />
          <StatCard label="Avg Match" value={`${leaderboardStats.avg}%`} icon={<Target size={14}/>} color="text-indigo-400" />
          <StatCard label="Top Score" value={`${leaderboardStats.top}%`} icon={<Trophy size={14}/>} color="text-amber-400" />
          <StatCard label="Strong Fits" value={leaderboardStats.strong} icon={<CheckCircle2 size={14}/>} color="text-emerald-400" />
        </div>
      )}

      {/* Weight Simulator & Leaderboard */}
      {candidates.some(c => c.scores.overall > 0) ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Sidebar: Sliders */}
          <div className="lg:col-span-1 rounded-2xl bg-[#111827] p-6 border border-white/5 shadow-xl lg:sticky lg:top-4">
            <div className="flex items-center gap-2 mb-6 text-indigo-400">
              <Sliders size={18} />
              <h3 className="text-sm font-black uppercase tracking-widest">Adjust Weights</h3>
            </div>
            <div className="space-y-6">
              <WeightSlider label="Technical Skills" value={weights.skill} onChange={(val) => setWeights({...weights, skill: val})} />
              <WeightSlider label="Experience Match" value={weights.experience} onChange={(val) => setWeights({...weights, experience: val})} />
              <WeightSlider label="Semantic Fit" value={weights.semantic} onChange={(val) => setWeights({...weights, semantic: val})} />
            </div>
          </div>

          {/* Main Area: Search & Table */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#111827] p-4 rounded-2xl border border-white/5 shadow-xl">
              <div className="relative w-full flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text"
                  placeholder="Search scored candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-sm text-white focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Filter size={16} className="text-slate-500 shrink-0" />
                <select 
                  value={filterRec}
                  onChange={(e) => setFilterRec(e.target.value)}
                  className="w-full md:w-auto bg-slate-900/50 border border-white/10 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-300 focus:outline-none"
                >
                  <option value="all">All Recommendations</option>
                  <option value="strong_yes">Strong Yes</option>
                  <option value="yes">Yes</option>
                  <option value="maybe">Maybe</option>
                  <option value="no">Unsuitable</option>
                </select>
              </div>
            </div>

            {/* Leaderboard Table */}
            <div className="rounded-2xl bg-[#111827] border border-white/5 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[650px]">
                  <thead className="bg-white/[0.02] border-b border-white/5">
                    <tr className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">
                      <th className="px-6 py-5">Rank</th>
                      <th className="px-6 py-5">Candidate</th>
                      <th className="px-6 py-5">Dynamic Score</th>
                      <th className="px-6 py-5">Decision</th>
                      <th className="px-6 py-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {simulatedResults.map((item) => (
                      <tr key={item._id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-6 font-black text-slate-500">#{item.rank}</td>
                        <td className="px-6 py-6 font-bold text-slate-200 truncate max-w-[200px]">{item.resumeId?.name || item.name || "Anonymous"}</td>
                        <td className="px-6 py-6">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-baseline gap-0.5">
                              <span className={`text-lg font-black ${item.finalScore >= 80 ? "text-emerald-400" : item.finalScore >= 60 ? "text-amber-400" : "text-rose-400"}`}>
                                {item.finalScore}
                              </span>
                              <span className="text-[10px] font-bold text-slate-600">%</span>
                            </div>
                            <div className="h-1 w-24 rounded-full bg-white/5 overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-1000 ${item.finalScore >= 80 ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : item.finalScore >= 60 ? "bg-amber-500" : "bg-rose-500"}`} 
                                style={{ width: `${item.finalScore}%` }} 
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <span className="px-2.5 py-1 rounded-full border border-white/10 text-[9px] font-black uppercase text-slate-300">
                            {item.explanation?.recommendation?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-6 text-right">
                          <button 
                            onClick={() => setSelectedCandidate(item)} 
                            className="inline-flex items-center gap-2 rounded-lg bg-indigo-500/10 px-4 py-2 text-xs font-black text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all"
                          >
                            <Eye size={14} /> Profile
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center rounded-2xl border border-dashed border-white/10 bg-[#111827]/50 p-6">
          <Target className="mx-auto text-slate-500 mb-4" size={48} />
          <h3 className="text-white font-bold text-lg">No Profiles Ranked Yet</h3>
          <p className="text-slate-500 text-sm mt-1 mb-6 max-w-sm mx-auto">Upload resumes in the Resumes tab, then click Run AI Scoring above to analyze them against your job description.</p>
        </div>
      )}

      {/* Modals & Drawers */}
      <LiveScoringModal
        open={showLiveModal}
        onClose={() => setShowLiveModal(false)}
        scoringJobId={currentScoringJobId}
        onNavigateToResults={() => fetchData(true)}
      />
      
      <CandidateScoreDrawer 
        open={!!selectedCandidate} 
        onClose={() => setSelectedCandidate(null)} 
        candidate={selectedCandidate} 
      />
    </div>
  );
}

const WeightSlider = ({ label, value, onChange }) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center text-xs font-bold text-slate-300">
      <span>{label}</span>
      <span className="font-mono bg-white/5 px-2 py-0.5 rounded text-[10px]">{(value * 100).toFixed(0)}%</span>
    </div>
    <input 
      type="range" min="0" max="1" step="0.05"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-white/10 accent-indigo-500"
    />
  </div>
);