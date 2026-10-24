import { useState } from "react";
import { X, Loader2, Save } from "lucide-react";
import API from "../../services/api";

const EditJobModal = ({ isOpen, onClose, job, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: job.title,
    department: job.department,
    status: job.status,
    experience_required: job.parsed?.experience_required || "",
    skills_required: job.parsed?.skills_required?.join(", ") || ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Construct payload maintaining the 'parsed' object structure
      const payload = {
        title: formData.title,
        department: formData.department,
        status: formData.status,
        parsed: {
          ...job.parsed,
          experience_required: formData.experience_required,
          skills_required: formData.skills_required.split(",").map(s => s.trim()).filter(Boolean)
        }
      };

      await API.patch(`/jobs/${job._id}`, payload);
      onRefresh();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative w-full max-w-xl rounded-2xl bg-[#0b0f14] border border-white/10 p-8 shadow-2xl space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">Edit Configuration</h2>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-white"><X size={20}/></button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Job Title</label>
            <input 
              required
              value={formData.title}
              className="w-full bg-slate-900 border border-white/5 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500"
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Department</label>
            <input 
              value={formData.department}
              className="w-full bg-slate-900 border border-white/5 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500"
              onChange={(e) => setFormData({...formData, department: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Experience Level</label>
          <input 
            value={formData.experience_required}
            className="w-full bg-slate-900 border border-white/5 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500"
            onChange={(e) => setFormData({...formData, experience_required: e.target.value})}
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Required Skills (Comma Separated)</label>
          <textarea 
            rows={3}
            value={formData.skills_required}
            className="w-full bg-slate-900 border border-white/5 rounded-lg px-4 py-3 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500"
            onChange={(e) => setFormData({...formData, skills_required: e.target.value})}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg text-sm font-bold text-slate-400 hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button 
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-8 py-2.5 rounded-lg font-bold text-sm text-white shadow-lg transition-all"
          >
            {loading ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditJobModal;