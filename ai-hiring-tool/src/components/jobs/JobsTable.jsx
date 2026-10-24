import { FilePlus, AlertCircle, Inbox, Loader2 } from "lucide-react";
import JobRow from "./JobRow";

export default function JobsTable({ jobs, fetchJobs, loading, error }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#111827] shadow-2xl">
      {/* Table Container */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-slate-900/40 border-b border-white/5">
            <tr className="text-[11px] uppercase tracking-[0.15em] text-slate-500 font-bold">
              <th className="px-6 py-5">Position Details</th>
              <th className="px-6 py-5">Department</th>
              <th className="px-6 py-5">Pipeline</th>
              <th className="px-6 py-5">Status</th>
              <th className="px-6 py-5 text-right">Activity</th>
              <th className="px-6 py-5 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5 bg-[#111827]">
            {loading ? (
              <SkeletonRows />
            ) : error ? (
              <ErrorRow message={error} />
            ) : jobs.length === 0 ? (
              <EmptyRow />
            ) : (
              jobs.map((job) => (
                <JobRow key={job._id || job.id} job={job} onRefresh={fetchJobs} />
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Subtle bottom gradient for depth */}
      {!loading && jobs.length > 0 && (
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent" />
      )}
    </div>
  );
}

/**
 * Skeleton Loader - Matches the real row height and spacing
 */
function SkeletonRows() {
  return Array.from({ length: 5 }).map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="px-6 py-6"><div className="h-4 w-48 rounded bg-slate-800/60" /></td>
      <td className="px-6 py-6"><div className="h-4 w-24 rounded bg-slate-800/40" /></td>
      <td className="px-6 py-6"><div className="h-4 w-16 rounded bg-slate-800/40" /></td>
      <td className="px-6 py-6"><div className="h-4 w-20 rounded bg-slate-800/40" /></td>
      <td className="px-6 py-6 text-right"><div className="h-4 w-24 ml-auto rounded bg-slate-800/40" /></td>
      <td className="px-6 py-6 text-right"><div className="h-4 w-8 ml-auto rounded bg-slate-800/40" /></td>
    </tr>
  ));
}

/**
 * Empty state - Prompting immediate action
 */
function EmptyRow() {
  return (
    <tr>
      <td colSpan={6} className="px-6 py-24">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 scale-150 bg-indigo-500/10 blur-2xl rounded-full" />
            <Inbox size={48} className="relative text-slate-700" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">No Active Positions</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            Your recruitment pipeline is currently empty. Start by creating a new job profile to begin analyzing resumes.
          </p>
          <button
            onClick={() => document.getElementById('create-job-trigger')?.click()}
            className="mt-8 flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95"
          >
            <FilePlus size={18} />
            Create First Job
          </button>
        </div>
      </td>
    </tr>
  );
}

/**
 * Error state - Standardized error handling
 */
function ErrorRow({ message }) {
  return (
    <tr>
      <td colSpan={6} className="px-6 py-20">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-4 rounded-full bg-red-500/10 p-4 text-red-500 border border-red-500/20">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-base font-bold text-slate-200 uppercase tracking-widest">Network Error</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-xs mx-auto">
            {message || "We couldn't reach the servers. Please verify your connection."}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors"
          >
            <Loader2 size={14} /> Tap to Retry
          </button>
        </div>
      </td>
    </tr>
  );
}