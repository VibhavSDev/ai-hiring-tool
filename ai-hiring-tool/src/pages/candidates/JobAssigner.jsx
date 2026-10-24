import { useState, useEffect } from "react";
import API from "../../services/api";
import { Briefcase } from "lucide-react";

export default function JobAssigner({ candidate, onAssigned }) {
    const [jobs, setJobs] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState(candidate?.jobId?._id || "");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // Fetch active jobs list for selection
    useEffect(() => {
        const fetchJobs = async () => {
        try {
            const payload = await API.get("/jobs", { params: { status: "active" } });
            setJobs(payload?.jobs || payload || []);
        } catch (err) {
            console.error("Failed to load jobs list", err);
        }
        };
        fetchJobs();
    }, []);

    const handleAssign = async (e) => {
        const jobId = e.target.value;
        setSelectedJobId(jobId);
        if (!jobId) return;

        try {
        setLoading(true);
        setMessage("");
        const payload = await API.patch(`/candidates/${candidate._id}/assign-job`, { jobId });
        
        const updatedCandidate = payload?.candidate || payload?.data?.candidate || payload;
        if (onAssigned) onAssigned(updatedCandidate);
        
        setMessage("Job updated successfully!");
        } catch (err) {
        setMessage(err.message || "Failed to assign job.");
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="rounded-2xl border border-white/5 bg-[#111827] p-5 shadow-xl">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">
            <Briefcase size={14} /> Assigned Role / Job
        </div>
        
        <select
            value={selectedJobId}
            onChange={handleAssign}
            disabled={loading}
            className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500/50 transition-colors"
        >
            <option value="">-- General Pool (Unassigned) --</option>
            {jobs.map((job) => (
            <option key={job._id} value={job._id}>
                {job.title} ({job.department})
            </option>
            ))}
        </select>

        {message && <div className="mt-2 text-[11px] text-indigo-400">{message}</div>}
        </div>
    );
}