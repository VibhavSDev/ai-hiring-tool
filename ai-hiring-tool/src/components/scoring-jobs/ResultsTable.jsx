import React from "react";
import { TrendingUp, TrendingDown, Minus, Eye, Trophy, Target, Cpu } from "lucide-react";

const ResultsTable = ({ results, onViewDetails }) => {
    return (
        <div className="bg-slate-950 rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
            <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-white/[0.02] border-b border-white/5">
                    <tr className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">
                        <th className="px-6 py-5 text-center w-20">Rank</th>
                        <th className="px-6 py-5">Candidate Information</th>
                        <th className="px-6 py-5">Match Breakdown</th>
                        <th className="px-6 py-5 text-center">Final Score</th>
                        <th className="px-6 py-5 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {results.map((item, index) => (
                        <ResultRow 
                            key={item._id} 
                            item={item} 
                            currentIndex={index} 
                            onView={() => onViewDetails(item)}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const ResultRow = ({ item, currentIndex, onView }) => {
    const currentRank = currentIndex + 1;
    const originalRank = item.rank; // The rank saved in DB during initial run
    const rankDelta = originalRank - currentRank;

    return (
        <tr className="group hover:bg-white/[0.02] transition-colors border-l-2 border-transparent hover:border-indigo-500">
            {/* 1. Rank & Trend */}
            <td className="px-6 py-6 text-center">
                <div className="flex flex-col items-center gap-1">
                    <span className="text-xl font-black text-white leading-none">
                        {currentRank}
                    </span>
                    <RankTrend delta={rankDelta} />
                </div>
            </td>

            {/* 2. Candidate Info */}
            <td className="px-6 py-6">
                <div className="flex items-center gap-3">
                    <div className="font-bold text-slate-200 group-hover:text-white">
                        {item.resumeId?.name}
                    </div>
                    {currentRank <= 3 && (
                        <span className="p-1 rounded bg-amber-500/10 text-amber-500">
                            <Trophy size={12} fill="currentColor" />
                        </span>
                    )}
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-1 uppercase tracking-tighter">
                    {item.resumeId?.email}
                </div>
            </td>

            {/* 3. Micro-Score Bars */}
            <td className="px-6 py-6">
                <div className="flex gap-4">
                    <MiniMetric label="SKL" value={item.scores.skill} color="bg-emerald-500" />
                    <MiniMetric label="EXP" value={item.scores.experience} color="bg-amber-500" />
                    <MiniMetric label="SEM" value={item.scores.semantic} color="bg-indigo-500" />
                </div>
            </td>

            {/* 4. Final Score Badge */}
            <td className="px-6 py-6 text-center">
                <div className="inline-flex flex-col items-center">
                    <div className="text-lg font-black text-indigo-400">
                        {Math.round(item.finalScore)}%
                    </div>
                    <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-0.5">
                        Weighted
                    </div>
                </div>
            </td>

            {/* 5. View Button */}
            <td className="px-6 py-6 text-right">
                <button 
                    onClick={onView}
                    className="p-2.5 rounded-xl bg-slate-900 text-slate-500 hover:text-white hover:bg-indigo-600 transition-all border border-white/5"
                >
                    <Eye size={16} />
                </button>
            </td>
        </tr>
    );
};

/* Helper: Rank Trend Indicator */
const RankTrend = ({ delta }) => {
    if (delta > 0) return (
        <span className="flex items-center text-[10px] font-black text-emerald-400">
            <TrendingUp size={10} className="mr-0.5" /> +{delta}
        </span>
    );
    if (delta < 0) return (
        <span className="flex items-center text-[10px] font-black text-rose-500">
            <TrendingDown size={10} className="mr-0.5" /> {delta}
        </span>
    );
    return <Minus size={10} className="text-slate-700" />;
};

/* Helper: Compact Metric Bar */
const MiniMetric = ({ label, value, color }) => (
    <div className="w-12">
        <div className="flex justify-between text-[8px] font-black text-slate-600 mb-1">
            <span>{label}</span>
            <span>{Math.round(value)}</span>
        </div>
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
        </div>
    </div>
);

export default ResultsTable;