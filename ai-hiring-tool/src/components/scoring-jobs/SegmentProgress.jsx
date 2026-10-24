import React from "react";

export const SegmentedProgress = ({ total = 0, processed = 0, failed = 0 }) => {
    // 1. Calculate counts safely
    const successCount = Math.max(0, processed - failed);
    const pendingCount = Math.max(0, total - processed);

    // 2. Calculate percentages
    const getWidth = (count) => (total > 0 ? (count / total) * 100 : 0);

    const successWidth = getWidth(successCount);
    const failedWidth = getWidth(failed);
    const pendingWidth = getWidth(pendingCount);

    // 3. Determine if the pipeline is empty or just starting
    const isEmpty = total === 0;

    return (
        <div className="w-full space-y-2 group">
            {/* Labels Area */}
            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.1em]">
                <div className="flex gap-3">
                    <span className={`${successCount > 0 ? 'text-emerald-400' : 'text-slate-600'}`}>
                        {successCount} Success
                    </span>
                    {failed > 0 && (
                        <span className="text-rose-500 animate-pulse">
                            {failed} Failed
                        </span>
                    )}
                </div>
                <span className="text-slate-500 font-mono">
                    {isEmpty ? "0/0" : `${processed}/${total}`}
                </span>
            </div>
            
            {/* The Segmented Bar */}
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/5 flex border border-white/5">
                {isEmpty ? (
                    // Default state when no resumes are attached
                    <div className="h-full w-full bg-slate-800/30 italic text-[8px] flex items-center justify-center text-slate-600 uppercase tracking-widest">
                        Waiting for data
                    </div>
                ) : (
                    <>
                        {/* Success Segment */}
                        <div 
                            className="h-full bg-emerald-500 transition-all duration-700 ease-out shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                            style={{ width: `${successWidth}%` }}
                        />
                        
                        {/* Failed Segment */}
                        <div
                            className="h-full bg-rose-500 transition-all duration-700 ease-out shadow-[0_0_12px_rgba(244,63,94,0.4)]"
                            style={{ width: `${failedWidth}%` }}
                        />
                        
                        {/* Pending Segment (with shimmer if active) */}
                        <div
                            className={`h-full bg-slate-800 transition-all duration-500 relative ${processed < total ? 'overflow-hidden' : ''}`}
                            style={{ width: `${pendingWidth}%` }}
                        >
                            {processed > 0 && processed < total && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" 
                                     style={{ backgroundSize: '200% 100%' }} />
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Micro-Tooltip on Hover */}
            {!isEmpty && (
                <div className="h-0 overflow-hidden group-hover:h-3 transition-all duration-300">
                    <p className="text-[8px] text-slate-600 font-bold uppercase tracking-tighter">
                        {pendingCount > 0 ? `AI Workers analyzing ${pendingCount} remaining candidates...` : "Analysis complete."}
                    </p>
                </div>
            )}
        </div>
    );
};