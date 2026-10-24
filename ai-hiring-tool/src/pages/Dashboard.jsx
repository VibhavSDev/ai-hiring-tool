import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Users, Target, Award, ArrowRight, Activity, Plus } from "lucide-react";
import { PipelineChart } from "../components/PipelineChart";
import API from "../services/api";

export default function Dashboard() {
  const [data, setData] = useState({
    kpis: { activeJobs: 0, totalCandidates: 0, activeInterviews: 0, totalHires: 0 },
    pipeline: { new: 0, screening: 0, interview: 0, offer: 0, hired: 0, rejected: 0 },
    recentJobs: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // api.js interceptor already unwrapped the response! 
        // 'res' is now exactly the data payload.
        const res = await API.get("/analytics/dashboard");
        if (res) {
          setData(res);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent shadow-lg shadow-indigo-500/20"></div>
          <p className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-500 animate-pulse">Compiling Analytics...</p>
        </div>
      </div>
    );
  }

  const { kpis, pipeline, recentJobs } = data;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/5 bg-[#111827] p-6 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back, Recruiter</h1>
          <p className="mt-1 text-sm text-slate-400">Here is what is happening across your pipelines today.</p>
        </div>
        <Link 
          to="/jobs" 
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
        >
          <Plus size={16} /> Create New Job
        </Link>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Active Jobs" value={kpis?.activeJobs || 0} icon={<Briefcase size={20} />} color="text-indigo-400" bg="bg-indigo-500/10" ring="ring-indigo-500/20" />
        <KPICard label="Total Candidates" value={kpis?.totalCandidates || 0} icon={<Users size={20} />} color="text-sky-400" bg="bg-sky-500/10" ring="ring-sky-500/20" />
        <KPICard label="Active Interviews" value={kpis?.activeInterviews || 0} icon={<Target size={20} />} color="text-amber-400" bg="bg-amber-500/10" ring="ring-amber-500/20" />
        <KPICard label="Total Hires" value={kpis?.totalHires || 0} icon={<Award size={20} />} color="text-emerald-400" bg="bg-emerald-500/10" ring="ring-emerald-500/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pipeline Funnel */}
        <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-[#111827] p-6 shadow-xl">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-slate-500 mb-6">
            <Activity size={16} className="text-indigo-400" /> Global Pipeline Health
          </div>
          {/* Tweaked grid classes slightly to make 5 items wrap more elegantly on medium screens */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <FunnelStep label="New" count={pipeline?.new || 0} color="border-slate-700 bg-slate-800/50 text-slate-300" />
            <FunnelStep label="Screening" count={pipeline?.screening || 0} color="border-amber-500/30 bg-amber-500/10 text-amber-400" />
            <FunnelStep label="Interview" count={pipeline?.interview || 0} color="border-sky-500/30 bg-sky-500/10 text-sky-400" />
            <FunnelStep label="Offer" count={pipeline?.offer || 0} color="border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-400" />
            <FunnelStep label="Hired" count={pipeline?.hired || 0} color="border-emerald-500/30 bg-emerald-500/10 text-emerald-400" />
          </div>

          <div className="flex-1 mt-4">
            <PipelineChart pipeline={pipeline || {}} />
          </div>
        </div>

        {/* Recent Jobs Panel */}
        <div className="rounded-2xl border border-white/5 bg-[#111827] p-6 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Recent Jobs</h2>
            <Link to="/jobs" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">View All</Link>
          </div>
          
          <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
            {!recentJobs || recentJobs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-500">
                No jobs created yet.
              </div>
            ) : (
              recentJobs.map((job) => (
                <Link 
                  key={job._id} 
                  to={`/jobs/${job._id}`}
                  className="group block rounded-xl border border-slate-800 bg-slate-900/50 p-4 hover:border-indigo-500/50 hover:bg-slate-800 transition-all shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-200 group-hover:text-indigo-300 transition-colors line-clamp-1">{job.title}</h3>
                      <p className="mt-1 text-[11px] text-slate-500">{job.department || "General"}</p>
                    </div>
                    <ArrowRight size={14} className="text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- UI Sub-components --- */

function KPICard({ label, value, icon, color, bg, ring }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#111827] p-5 shadow-xl flex items-center gap-4">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg} ${color} ring-1 shrink-0 ${ring}`}>
        {icon}
      </div>
      <div className="truncate">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 truncate">{label}</div>
        <div className="mt-1 text-2xl font-black text-white">{value}</div>
      </div>
    </div>
  );
}

function FunnelStep({ label, count, color }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-xl border p-4 text-center ${color}`}>
      <div className="text-2xl font-black">{count}</div>
      <div className="mt-1 text-[10px] font-bold uppercase tracking-widest opacity-80">{label}</div>
    </div>
  );
}