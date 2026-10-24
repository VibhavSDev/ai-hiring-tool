import { useEffect, useMemo, useState } from "react";
import { X, Loader2, UserPlus } from "lucide-react";
import API from "../../services/api";

const stageOrder = ["new", "screening", "interview", "offer", "hired", "rejected"];
const sourceOptions = ["manual", "upload", "linkedin", "referral"];

export default function AddCandidateModal({ isOpen, onClose, initialJobId, onCreated }) {
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [formData, setFormData] = useState({
    jobId: initialJobId || "",
    name: "",
    email: "",
    phone: "",
    source: "manual",
    stage: "new",
    notes: "",
    summary: "",
  });

  useEffect(() => {
    if (!isOpen) return;

    const fetchJobsList = async () => {
      try {
        const payload = await API.get("/jobs", { params: { limit: 100, page: 1 } });
        const jobItems = payload?.jobs || payload || [];
        setJobs(jobItems);
        if (!formData.jobId && jobItems[0]?._id) {
          setFormData((prev) => ({ ...prev, jobId: jobItems[0]._id }));
        }
      } catch (error) {
        console.error("Failed to load jobs for modal:", error);
      }
    };

    fetchJobsList();
  }, [isOpen]);

  useEffect(() => {
    if (initialJobId) {
      setFormData((prev) => ({ ...prev, jobId: initialJobId }));
    }
  }, [initialJobId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.jobId || !formData.name || !formData.email) {
      alert("Please fill in the job, name, and email fields.");
      return;
    }

    try {
      setLoading(true);
      const candidatePayload = await API.post("/candidates", {
        jobId: formData.jobId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        source: formData.source,
        notes: formData.notes,
        summary: formData.summary,
      });

      const createdCandidate = candidatePayload?.candidate || candidatePayload;
      if (createdCandidate?._id && formData.stage !== "new") {
        await API.patch(`/candidates/${createdCandidate._id}/stage`, {
          stage: formData.stage,
          note: "Initial stage set from add-candidate form",
        });
      }

      onCreated?.(createdCandidate);
      onClose();
      setFormData({
        jobId: initialJobId || "",
        name: "",
        email: "",
        phone: "",
        source: "manual",
        stage: "new",
        notes: "",
        summary: "",
      });
    } catch (err) {
      alert(err.message || "Failed to create candidate");
    } finally {
      setLoading(false);
    }
  };

  const jobOptions = useMemo(() => jobs, [jobs]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0b0f14] p-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-400">New candidate</p>
            <h2 className="text-lg sm:text-xl font-semibold text-white">Add a candidate to the pipeline</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Job</label>
            <select
              required
              value={formData.jobId}
              onChange={(event) => setFormData((prev) => ({ ...prev, jobId: event.target.value }))}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-sm text-slate-200 outline-none"
            >
              <option value="">Select a job</option>
              {jobOptions.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.title || job.parsed?.title || "Untitled position"}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Full name</label>
            <input
              required
              value={formData.name}
              onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-sm text-white outline-none"
              placeholder="Alex Morgan"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Email</label>
            <input
              required
              type="email"
              value={formData.email}
              onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-sm text-white outline-none"
              placeholder="alex@example.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Phone</label>
            <input
              value={formData.phone}
              onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-sm text-white outline-none"
              placeholder="+1 555 111 2222"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Initial stage</label>
            <select
              value={formData.stage}
              onChange={(event) => setFormData((prev) => ({ ...prev, stage: event.target.value }))}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-sm text-slate-200 outline-none capitalize"
            >
              {stageOrder.map((stage) => (
                <option key={stage} value={stage} className="capitalize">{stage}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Source</label>
            <select
              value={formData.source}
              onChange={(event) => setFormData((prev) => ({ ...prev, source: event.target.value }))}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-sm text-slate-200 outline-none capitalize"
            >
              {sourceOptions.map((source) => (
                <option key={source} value={source} className="capitalize">{source}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Summary</label>
            <textarea
              rows={2}
              value={formData.summary}
              onChange={(event) => setFormData((prev) => ({ ...prev, summary: event.target.value }))}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-sm text-white outline-none"
              placeholder="A quick note about this candidate"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(event) => setFormData((prev) => ({ ...prev, notes: event.target.value }))}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-sm text-white outline-none"
              placeholder="Recruiter notes"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Saving...
              </>
            ) : (
              <>
                <UserPlus size={16} /> Add candidate
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}