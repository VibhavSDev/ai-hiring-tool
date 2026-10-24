import { 
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid 
} from "recharts";

export function PipelineChart({ pipeline }) {
    // 1. Transform the pipeline object into an array for Recharts
    // We exclude "rejected" to focus purely on the active funnel progression
    const chartData = [
        { name: "New", count: pipeline.new || 0, color: "#64748b" },       // slate-500
        { name: "Screening", count: pipeline.screening || 0, color: "#f59e0b" }, // amber-500
        { name: "Interview", count: pipeline.interview || 0, color: "#0ea5e9" }, // sky-500
        { name: "Offer", count: pipeline.offer || 0, color: "#d946ef" },     // fuchsia-500
        { name: "Hired", count: pipeline.hired || 0, color: "#10b981" },     // emerald-500
    ];

    // 2. Custom dark mode tooltip
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-slate-700 bg-slate-900/90 p-3 shadow-xl backdrop-blur-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                {payload[0].payload.name} Stage
            </p>
            <p className="text-lg font-black text-white">
                {payload[0].value} <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Candidates</span>
            </p>
            </div>
        );
        }
        return null;
    };

    return (
        <div className="h-[250px] w-full mt-6">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            {/* Subtle grid lines matching your border colors */}
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            
            <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                dy={10}
            />
            <YAxis 
                stroke="#475569" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b', opacity: 0.4 }} />
            
            <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={60}>
                {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
            </Bar>
            </BarChart>
        </ResponsiveContainer>
        </div>
    );
}