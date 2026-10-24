import React from 'react';
import { Target, MapPin, Briefcase, Clock, Award } from "lucide-react";

const OverviewTab = ({ job }) => {
  // Use parsed title or seniority as a secondary indicator if description is short
  const hasMetadata = job.parsed && Object.keys(job.parsed).length > 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Resumes" value={job.resumeCount || 0} icon={<Briefcase size={14}/>} />
        <StatCard label="Active Candidates" value={job.candidateCount || 0} icon={<Target size={14}/>} />
        <StatCard label="Last Scored" value={job.lastScoredAt ? new Date(job.lastScoredAt).toLocaleDateString() : "Never"} icon={<Clock size={14}/>} />
        <StatCard label="Seniority" value={job.parsed?.seniority_level || "Not Specified"} icon={<Award size={14}/>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content: Description */}
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-xl bg-[#111827] p-6 border border-white/5 shadow-sm">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-5 flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-indigo-500" />
              Job Description
            </h3>
            <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line prose prose-invert max-w-none">
              {/* Fallback to rawText if description is empty */}
              {job.description || job.rawText || (
                <div className="py-10 text-center border-2 border-dashed border-white/5 rounded-lg text-slate-500">
                  No job description available.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar: Metadata & Skills */}
        <div className="space-y-6">
          <section className="rounded-xl bg-[#111827] p-6 border border-white/5 shadow-sm">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-5">
              Parsed Metadata
            </h3>
            <div className="space-y-4">
              <MetaItem label="Location" value={job.parsed?.location} icon={<MapPin size={12}/>} />
              <MetaItem label="Employment" value={job.parsed?.employment_type} icon={<Briefcase size={12}/>} />
              <MetaItem label="Experience" value={job.parsed?.experience_required || job.parsed?.experience} />
              <MetaItem label="Education" value={job.parsed?.education_required || job.parsed?.education} />
            </div>
          </section>

          <section className="rounded-xl bg-[#111827] p-6 border border-white/5 shadow-sm">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-5">
              Required Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.parsed?.skills_required?.length > 0 || job.parsed?.skills?.length > 0 ? (
                (job.parsed.skills_required || job.parsed.skills).map((skill, i) => (
                  <span key={i} className="rounded bg-indigo-500/10 px-2.5 py-1 text-[11px] font-bold text-indigo-400 ring-1 ring-inset ring-indigo-500/20 transition-colors hover:bg-indigo-500/20">
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-600 italic">No skills identified by AI.</span>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon }) => (
  <div className="rounded-xl bg-[#111827] p-5 border border-white/5 shadow-lg group hover:border-indigo-500/30 transition-all">
    <div className="flex items-center justify-between mb-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
      <div className="text-slate-600 group-hover:text-indigo-400 transition-colors">
        {icon}
      </div>
    </div>
    <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
  </div>
);

const MetaItem = ({ label, value, icon }) => (
  <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
    <div className="flex items-center gap-2 text-slate-500">
      {icon}
      <span className="text-[12px]">{label}</span>
    </div>
    <span className="font-semibold text-slate-200 text-right truncate max-w-[120px]" title={value}>
      {value || "—"}
    </span>
  </div>
);

export default OverviewTab;