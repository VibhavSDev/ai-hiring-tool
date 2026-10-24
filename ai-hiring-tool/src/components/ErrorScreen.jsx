import React from "react";
import { AlertTriangle, ChevronLeft, RefreshCcw } from "lucide-react";

const ErrorScreen = ({ message, onBack }) => {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-300">
        <div className="h-20 w-20 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-6">
            <AlertTriangle className="text-rose-500" size={40} />
        </div>

        <div className="text-center max-w-md space-y-3 mb-8">
            <h2 className="text-2xl font-black text-white tracking-tight">Analysis Interrupted</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
            {message || "We encountered an unexpected error while fetching the leaderboard data. This might be due to a network interruption or a temporary server glitch."}
            </p>
        </div>

        <div className="flex gap-4">
            <button 
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 text-slate-300 text-xs font-black border border-white/10 hover:bg-white/10 transition-all"
            >
            <ChevronLeft size={16} /> GO BACK
            </button>
            <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-600 text-white text-xs font-black hover:bg-rose-500 transition-all shadow-xl shadow-rose-600/20"
            >
            <RefreshCcw size={16} /> RETRY CONNECTION
            </button>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 w-full max-w-xs text-center">
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
            Technical Support ID: ERR_LEADERBOARD_FETCH
            </p>
        </div>
        </div>
    );
};

export default ErrorScreen;