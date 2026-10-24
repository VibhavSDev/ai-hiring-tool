const STATUS_STYLES = {
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  running: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
  completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  failed: "bg-red-500/15 text-red-400 border-red-500/20",
};

const JobStatusBadge = ({ status }) => {
  // Fallback to gray if status is undefined or unknown
  const styleConfig = STATUS_STYLES[status] || "bg-gray-500/15 text-gray-400 border-gray-500/20";

  return (
    <span className={`
      inline-flex items-center px-2.5 py-0.5 
      rounded-full text-xs font-medium border
      capitalize transition-all duration-200
      ${styleConfig}
    `}>
      {/* Optional: Add a small pulsing dot for "running" status */}
      {status === "running" && (
        <span className="mr-1.5 flex h-1.5 w-1.5 items-center">
          <span className="absolute inline-flex h-1.5 w-1.5 animate-ping rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
        </span>
      )}
      {status}
    </span>
  );
};

export default JobStatusBadge;