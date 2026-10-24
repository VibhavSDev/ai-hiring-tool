import { useState } from "react";
import { Plus } from "lucide-react";
import Breadcrumbs from "../layout/Breadcrumbs";
import CreateJobModal from "../../pages/jobs/CreateJobModal";
import { exportJobsToCSV } from "../../utils/exportUtils";

const JobsHeader = ({ jobs, fetchJobs }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="mb-8">
      {/* Breadcrumbs at the very top */}
      <Breadcrumbs />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Title & Subtitle */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Jobs
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage job postings and monitor incoming resume pipelines.
          </p>
        </div>

        {/* Primary Action */}
        <div className="flex items-center gap-3">
          <button 
          onClick={() => exportJobsToCSV(jobs)}
          className="hidden sm:inline-flex items-center rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white">
            Export List
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-500 active:scale-95"
          >
            <Plus size={18} />
            Create Job
          </button>

          <CreateJobModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onCreated={() => fetchJobs()} // This ensures the list updates immediately
          />
        </div>
      </div>
    </div>
  );
};

export default JobsHeader;