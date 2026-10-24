import { useState, useRef } from "react";
import { X, Upload, FileText, Loader2, CheckCircle2 } from "lucide-react";
import API from "../../services/api";

const   ResumeUploadModal = ({ isOpen, onClose, jobId, onUploadSuccess }) => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...selectedFiles]);
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        const formData = new FormData();
        formData.append("jobId", jobId);
        files.forEach(file => formData.append("resumes", file));

        try {
            setUploading(true);
            const response = await API.post("/resumes/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                    setProgress(percent);
                },
            });

            console.log(response);
            onUploadSuccess?.();
            setFiles([]);
            onClose();
        } catch (err) {
            alert(err.message || "Upload failed");
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-xl rounded-2xl bg-[#0b0f14] border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg sm:text-xl font-bold text-white uppercase tracking-tight">Upload Candidates</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={20}/></button>
                </div>

                {/* Drop Zone */}
                <div 
                    onClick={() => fileInputRef.current.click()}
                    className="border-2 border-dashed border-white/10 rounded-2xl p-6 sm:p-10 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all"
                >
                    <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.docx" />
                    <div className="p-4 bg-indigo-500/10 rounded-full text-indigo-400">
                        <Upload size={32} />
                    </div>
                    <p className="text-sm text-slate-300 font-medium text-center">Click to browse or drag and drop</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">PDF, DOCX up to 10MB each</p>
                </div>

                {/* File List */}
                {files.length > 0 && (
                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                        {files.map((f, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-lg">
                                <div className="flex items-center gap-3 min-w-0">
                                    <FileText size={16} className="text-indigo-400 shrink-0" />
                                    <span className="text-xs text-slate-300 truncate">{f.name}</span>
                                </div>
                                <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="text-slate-500 hover:text-red-400 shrink-0 ml-2">
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {uploading && (
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                )}

                <button
                    disabled={files.length === 0 || uploading}
                    onClick={handleUpload}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 py-3.5 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                    {uploading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                    {uploading ? `Uploading ${progress}%` : `Import ${files.length} Candidates`}
                </button>
            </div>
        </div>
    );
};

export default ResumeUploadModal;