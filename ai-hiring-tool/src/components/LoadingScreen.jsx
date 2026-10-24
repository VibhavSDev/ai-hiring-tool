import React from "react";
import { Loader2, Cpu, Zap } from "lucide-react";

const LoadingScreen = () => {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-700">
        {/* Animated Icon Core */}
        <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full animate-pulse" />
            <div className="relative h-20 w-20 rounded-3xl bg-slate-900 border border-indigo-500/30 flex items-center justify-center shadow-2xl">
            <Cpu className="text-indigo-400 animate-bounce" size={40} />
            </div>
            <div className="absolute -top-2 -right-2">
                <Zap className="text-amber-400 animate-pulse" size={20} fill="currentColor" />
            </div>
        </div>

        {/* Text Feedback */}
        <div className="text-center space-y-2">
            <h2 className="text-xl font-black text-white tracking-tight uppercase italic">
            Retrieving Intelligence
            </h2>
            <div className="flex items-center justify-center gap-2 text-slate-500 font-mono text-[10px] uppercase tracking-[0.2em]">
            <Loader2 size={12} className="animate-spin" />
            Syncing scoring vectors...
            </div>
        </div>

        {/* Progress Bar Placeholder */}
        <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div className="h-full bg-indigo-500 w-1/3 animate-infinite-loading" />
        </div>
        </div>
    );
};

export default LoadingScreen;