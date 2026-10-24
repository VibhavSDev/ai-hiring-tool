import React from "react";
import { Sliders, Info, Zap } from "lucide-react";

const WeightSimulator = ({ currentWeights, onChange }) => {
    
    // Helper to handle slider changes while maintaining a total of 1.0
    const handleSliderChange = (key, val) => {
        const newValue = parseFloat(val);
        const otherKeys = Object.keys(currentWeights).filter(k => k !== key);
        
        // Calculate how much we need to subtract from others
        const delta = newValue - currentWeights[key];
        const adjustment = delta / otherKeys.length;

        const newWeights = { ...currentWeights };
        newWeights[key] = newValue;

        otherKeys.forEach(k => {
            // Distribute the adjustment, but clamp at 0
            newWeights[k] = Math.max(0, newWeights[k] - adjustment);
        });

        // Final normalization to ensure floating point math doesn't ruin the 1.0 total
        const total = Object.values(newWeights).reduce((a, b) => a + b, 0);
        Object.keys(newWeights).forEach(k => {
            newWeights[k] = newWeights[k] / total;
        });

        onChange(newWeights);
    };

    return (
        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 sticky top-24">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                        <Sliders size={18} />
                    </div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Weight Simulator</h3>
                </div>
                <div className="group relative">
                    <Info size={14} className="text-slate-600 hover:text-slate-400 cursor-help" />
                    <div className="absolute right-0 top-full mt-2 w-48 p-2 bg-black border border-white/10 rounded-xl text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                        Adjust these sliders to change how much importance is given to each scoring engine.
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                <WeightSlider 
                    label="Skill Match" 
                    value={currentWeights.skill} 
                    color="bg-emerald-500"
                    onChange={(val) => handleSliderChange("skill", val)}
                    description="Technical keywords and hard skills."
                />
                <WeightSlider 
                    label="Experience" 
                    value={currentWeights.experience} 
                    color="bg-amber-500"
                    onChange={(val) => handleSliderChange("experience", val)}
                    description="Years of relevant tenure and industry fit."
                />
                <WeightSlider 
                    label="Semantic Alignment" 
                    value={currentWeights.semantic} 
                    color="bg-indigo-500"
                    onChange={(val) => handleSliderChange("semantic", val)}
                    description="Contextual relevance and JD intent."
                />
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 text-emerald-400/80 mb-2">
                    <Zap size={12} fill="currentColor" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Live Calibration Active</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed italic">
                    Ranking is re-calculated instantly on the client. No data is saved until you export or update the job.
                </p>
            </div>
        </div>
    );
};

const WeightSlider = ({ label, value, color, onChange, description }) => (
    <div className="space-y-3">
        <div className="flex justify-between items-end">
            <div>
                <p className="text-[11px] font-black text-slate-300 uppercase tracking-tight">{label}</p>
                <p className="text-[9px] text-slate-600 font-medium">{description}</p>
            </div>
            <span className="text-sm font-mono font-black text-white">
                {Math.round(value * 100)}%
            </span>
        </div>
        <input 
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-indigo-500"
        />
    </div>
);

export default WeightSimulator;