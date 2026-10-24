import { useState } from "react";
import { X, Loader2, Sparkles } from "lucide-react";
import API from "../../services/api";

const CreateJobModal = ({ isOpen, onClose, onCreated }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    title: "", 
    description: "", 
    department: "" 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const payload = {
        text: formData.description,
        title: formData.title,
        department: formData.department
      };

      // api.js interceptor returns the data payload directly
      const data = await API.post("/jobs", payload);

      // Success: pass the created job data back up and close
      onCreated(data);
      onClose();
    } catch (err) {
      console.error("Creation error:", err);
      alert(err.message || "Failed to create job. Please ensure the text is long enough.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal Card */}
      <form 
        onSubmit={handleSubmit} 
        className="relative w-full max-w-xl rounded-2xl bg-[#0b0f14] border border-white/10 p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="text-indigo-400" size={20} /> Create New Position
          </h2>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-slate-500 hover:text-white transition-colors"
          >
            <X size={20}/>
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Job Title</label>
              <input 
                required
                className="w-full bg-slate-900 border border-white/5 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                placeholder="Software Engineer..."
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Department</label>
              <input 
                className="w-full bg-slate-900 border border-white/5 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                placeholder="Engineering..."
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Job Description</label>
            <textarea 
              required
              rows={8}
              className="w-full bg-slate-900 border border-white/5 rounded-lg px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/20 custom-scrollbar leading-relaxed"
              placeholder="Paste the full job description here. Our AI will automatically extract skills, responsibilities, and seniority level."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </div>

        <div className="pt-2">
          <button 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed py-3.5 rounded-xl font-bold text-sm text-white shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18}/>
                <span>AI is analyzing & embedding...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Publish & Process Job</span>
              </>
            )}
          </button>
          <p className="mt-4 text-center text-[10px] text-slate-500 uppercase tracking-widest font-medium">
            Powered by Gemini 2.5 Flash & Vector Embeddings
          </p>
        </div>
      </form>
    </div>
  );
};

export default CreateJobModal;