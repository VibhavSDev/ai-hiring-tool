export const StatCard = ({ label, value, color = "text-white" }) => (
  <div className="rounded-xl bg-[#0f172a] p-5 border border-white/5 shadow-sm">
    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
      {label}
    </p>
    <p className={`mt-2 text-2xl font-bold ${color}`}>
      {value}
    </p>
  </div>
);

