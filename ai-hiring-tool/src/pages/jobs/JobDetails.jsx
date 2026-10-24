import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import { ChevronLeft, Upload, Play, Briefcase, RefreshCcw } from "lucide-react";

// Components
import OverviewTab from "./tabs/OverviewTab";
import PipelineTab from "./tabs/PipelineTab";
import ResumesTab from "./tabs/ResumesTab";
import ScoringTab from "./tabs/ScoringTab";

const JobDetails = () => {
    const { jobId } = useParams();
    const useNavigateHook = useNavigate();

    const [job, setJob] = useState(null);
    const [activeTab, setActiveTab] = useState("overview"); // Default tab
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchJobDetails = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            // api.js interceptor already unwrapped response.data into the payload data directly!
            const data = await API.get(`/jobs/${jobId}`);
            setJob(data || null);
        } catch (err) {
            setError(err.message || "Failed to load job details");
        } finally {
            setLoading(false);
        }
    }, [jobId]);

    useEffect(() => {
        if (jobId) fetchJobDetails();
    }, [jobId, fetchJobDetails]);

    /* --------------------------------------------
    * Action Handlers
    * ------------------------------------------ */
    const handleStartScoring = () => setActiveTab("scoring");
    const handleUploadClick = () => setActiveTab("resumes");
    const handleViewPipeline = () => setActiveTab("pipeline");

    if (loading) return <LoadingUI />;
    if (error) return <ErrorUI error={error} onRetry={fetchJobDetails} onBack={() => useNavigateHook("/jobs")} />;
    if (!job) return <div className="p-20 text-center text-slate-500">Job not found.</div>;

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
        
        {/* Top Breadcrumb */}
        <div className="flex items-center justify-between">
            <button
            onClick={() => useNavigateHook("/jobs")}
            className="group flex items-center gap-2 text-sm text-slate-400 hover:text-indigo-400 transition-colors"
            >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            Back to Jobs List
            </button>
            <button 
            onClick={fetchJobDetails}
            className="p-2 text-slate-500 hover:text-white transition-colors"
            title="Refresh Data"
            >
            <RefreshCcw size={16} className={`${loading ? 'animate-spin' : ''}`} />
            </button>
        </div>

        {/* Header Profile Card */}
        <div className="rounded-xl bg-[#111827] p-6 shadow-xl ring-1 ring-white/5 border border-white/5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20 shrink-0">
                <Briefcase size={28} />
                </div>
                <div className="min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl font-bold text-white tracking-tight truncate">
                    {job.title || job.parsed?.title || "Untitled Position"}
                    </h1>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                    {job.status || "Active"}
                    </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                    <span>Department: <b className="text-slate-300">{job.department || job.parsed?.employment_type || "Engineering"}</b></span>
                    <span>Created: <b className="text-slate-300">{job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "N/A"}</b></span>
                </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <button 
                onClick={handleUploadClick}
                className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all border border-slate-700"
                >
                <Upload size={16} /> Resumes
                </button>
                <button
                onClick={handleViewPipeline}
                className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all"
                >
                View Pipeline
                </button>
                <button 
                onClick={handleStartScoring}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                >
                <Play size={16} fill="currentColor" /> AI Scorer
                </button>
            </div>
            </div>
        </div>

        {/* Persistence Tabs Section */}
        <div className="space-y-6">
            <div className="flex gap-8 border-b border-white/5 px-2 overflow-x-auto custom-scrollbar">
            {["overview", "pipeline", "resumes", "scoring"].map((tab) => (
                <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-bold capitalize whitespace-nowrap transition-all relative ${
                    activeTab === tab ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"
                }`}
                >
                {tab}
                {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                )}
                </button>
            ))}
            </div>

            {/* Dynamic Tab Content */}
            <div className="min-h-[400px]">
            {activeTab === "overview" && <OverviewTab job={job} />}
            {activeTab === "pipeline" && <PipelineTab jobId={jobId} />}
            {activeTab === "resumes" && <ResumesTab jobId={jobId} />}
            {activeTab === "scoring" && <ScoringTab jobId={jobId} />}
            </div>
        </div>
        </div>
    );
};

const LoadingUI = () => (
    <div className="flex flex-col items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent shadow-lg shadow-indigo-500/20"></div>
        <p className="mt-4 text-sm font-medium text-slate-400 animate-pulse tracking-widest uppercase">Initializing Profile...</p>
    </div>
);

const ErrorUI = ({ error, onRetry, onBack }) => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
        <Briefcase size={24} />
        </div>
        <h2 className="text-lg font-bold text-white">Data Fetch Failed</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-xs">{error}</p>
        <div className="mt-6 flex gap-4">
        <button onClick={onBack} className="text-sm text-slate-400 hover:underline">Go Back</button>
        <button onClick={onRetry} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white">Retry Connection</button>
        </div>
    </div>
);

export default JobDetails;