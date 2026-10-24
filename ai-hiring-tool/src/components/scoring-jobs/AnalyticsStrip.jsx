import React from "react";
import { Target, Trophy, BarChart3 } from "lucide-react";

const AnalyticsStrip = ({ results, originalSummary }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard 
            icon={<Target className="text-indigo-400" />} 
            label="Total Pool" 
            value={results.length} 
            subtext="Candidates" 
        />
        <SummaryCard 
            icon={<Trophy className="text-amber-400" />} 
            label="Highest Match" 
            value={`${Math.round(results[0]?.finalScore || 0)}%`} 
            subtext="Best Alignment" 
        />
        <SummaryCard 
            icon={<BarChart3 className="text-emerald-400" />} 
            label="Pool Average" 
            value={`${Math.round(results.reduce((acc, c) => acc + c.finalScore, 0) / results.length || 0)}%`} 
            subtext="Overall Quality" 
        />
        <SummaryCard 
            icon={<Target className="text-rose-400" />} 
            label="Strong Fits" 
            value={results.filter(r => r.finalScore >= 80).length} 
            subtext="Score > 80%" 
        />
    </div>
);

const SummaryCard = ({ icon, label, value, subtext }) => {
    return (
        <div className="relative group overflow-hidden rounded-3xl border border-white/5 bg-slate-900/40 p-5 transition-all duration-300 hover:bg-slate-900/60 hover:border-white/10 hover:translate-y-[-2px]">
            {/* Background Glow Effect */}
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/5 blur-3xl group-hover:bg-white/10 transition-colors" />

            <div className="relative space-y-4">
                {/* Header: Icon & Label */}
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/5 shadow-inner">
                        {React.cloneElement(icon, { size: 18 })}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
                        {label}
                    </span>
                </div>

                {/* Main Value */}
                <div>
                    <div className="text-3xl font-black text-white tracking-tighter">
                        {value}
                    </div>
                    <p className="text-[10px] font-bold uppercase mt-1 text-slate-600 tracking-tight">
                        {subtext}
                    </p>
                </div>
            </div>

            {/* Bottom Accent Line (matches the icon color theme) */}
            <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent transition-all duration-500 group-hover:w-full" />
        </div>
    );
};

export default AnalyticsStrip;