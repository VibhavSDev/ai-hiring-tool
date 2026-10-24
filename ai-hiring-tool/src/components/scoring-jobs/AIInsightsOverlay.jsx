import React, { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp, AlertCircle, Info } from "lucide-react";

const AIInsightsOverlay = ({ results }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Logic to generate insights based on the current results
    const generateInsights = () => {
        if (!results || results.length === 0) return null;

        const avgScore = results.reduce((acc, c) => acc + c.finalScore, 0) / results.length;
        const lowSemantic = results.filter(r => r.scores.semantic < 50).length;
        const topSkills = results[0]?.signals?.matchedSkills?.slice(0, 3) || [];

        return {
            status: avgScore > 70 ? "healthy" : "warning",
            text: avgScore > 70 
                ? `High-quality pool detected. Candidates show strong alignment with ${topSkills.join(", ")}.`
                : `The average score is lower than usual. ${lowSemantic} candidates struggle with the specific intent (Semantic Match) of the job description.`,
            recommendation: avgScore < 60 
                ? "Tip: Consider loosening the 'Semantic' weight if you value raw skills over exact industry context."
                : "Tip: Proceed to shortlist the top 3 candidates; they significantly outpace the pool average."
        };
    };

    const insight = generateInsights();
    if (!insight) return null;

    return (
        <div className="mt-4 animate-in slide-in-from-top-2 duration-500">
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`cursor-pointer group flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    insight.status === 'healthy' 
                    ? "bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/30" 
                    : "bg-amber-500/5 border-amber-500/10 hover:border-amber-500/30"
                }`}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${insight.status === 'healthy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                        <Sparkles size={16} fill="currentColor" className="animate-pulse" />
                    </div>
                    <div>
                        <p className={`text-xs font-black uppercase tracking-widest ${insight.status === 'healthy' ? 'text-emerald-400' : 'text-amber-400'}`}>
                            AI Pipeline Insight
                        </p>
                        <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                            {insight.text}
                        </p>
                    </div>
                </div>
                {isOpen ? <ChevronUp size={16} className="text-slate-600" /> : <ChevronDown size={16} className="text-slate-600" />}
            </div>

            {isOpen && (
                <div className="p-5 rounded-b-2xl border-x border-b border-white/5 bg-slate-900/20 space-y-4 animate-in fade-in slide-in-from-top-1 duration-300">
                    <div className="flex gap-3">
                        <Info size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-slate-400 leading-relaxed italic">
                            {insight.recommendation}
                        </p>
                    </div>
                    
                    {/* Progress distribution visualization */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-[9px] font-black uppercase text-slate-600">
                            <span>Pool Talent Distribution</span>
                            <span>{results.length} Profiles</span>
                        </div>
                        <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-white/5">
                            <div className="h-full bg-emerald-500" style={{ width: '20%' }} />
                            <div className="h-full bg-amber-500" style={{ width: '50%' }} />
                            <div className="h-full bg-slate-700" style={{ width: '30%' }} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIInsightsOverlay;