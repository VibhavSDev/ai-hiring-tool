import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit2, Trash2, ShieldCheck, ArrowRight, Layers } from "lucide-react";
import JobStatusBadge from "../JobStatusBadge";
import EditJobModal from "./EditJobModal"; // We'll create this next
import API from "../../services/api";

export default function JobRow({ job, onRefresh }) {
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const department = job.department || "General";
  const parsedData = job.parsed || {};
  const seniority = parsedData.experience_required || "Not Specified";

  const handleOpen = () => navigate(`/jobs/${job._id}`);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${job.title}"?`)) {
      try {
        await API.delete(`/jobs/${job._id}`);
        onRefresh();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete job");
      }
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setIsEditModalOpen(true);
  };

  return (
    <>
      <tr
        tabIndex={0}
        onClick={handleOpen}
        onKeyDown={(e) => e.key === "Enter" && handleOpen()}
        className="group cursor-pointer border-t border-white/5 transition-all duration-200 hover:bg-indigo-500/[0.02] focus:bg-indigo-500/[0.04] focus:outline-none"
      >
        <td className="px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800/50 border border-white/5 group-hover:border-indigo-500/30 group-hover:bg-indigo-500/10 transition-all duration-300">
              <Layers size={18} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-slate-200 group-hover:text-white transition-colors truncate">
                {job.title}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <ShieldCheck size={12} className="text-indigo-400/70" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  {seniority}
                </span>
              </div>
            </div>
          </div>
        </td>

        <td className="px-6 py-5">
          <span className="text-xs font-semibold text-slate-400 bg-slate-800/30 px-2.5 py-1 rounded-md border border-white/5">
            {department}
          </span>
        </td>

        <td className="px-6 py-5">
          <div className="flex flex-col">
            <span className="text-sm font-black text-slate-100">{job.resumeCount || 0}</span>
            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Resumes</span>
          </div>
        </td>

        <td className="px-6 py-5">
          <JobStatusBadge status={job.status || "active"} />
        </td>

        <td className="px-6 py-5 text-right whitespace-nowrap">
          <span className="text-[11px] font-mono text-slate-500">
            {new Date(job.createdAt).toLocaleDateString(undefined, {
              month: "short", day: "numeric", year: "numeric",
            })}
          </span>
        </td>

        <td className="px-6 py-5 text-right">
          <div className="flex items-center justify-end gap-2">
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
              <button
                onClick={handleEdit}
                className="p-2 text-slate-500 hover:bg-slate-800 hover:text-white rounded-lg transition-all"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-slate-500 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <ArrowRight size={16} className="text-slate-600 group-hover:text-indigo-400 transition-all" />
          </div>
        </td>
      </tr>

      {/* Edit Modal Component */}
      <EditJobModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        job={job}
        onRefresh={onRefresh}
      />
    </>
  );
}