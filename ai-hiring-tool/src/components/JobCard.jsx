export default function JobCard({ job }) {
  return (
    <div className="bg-white/5 border border-white/10 p-4 rounded-xl hover:border-indigo-500 transition">
      <h3 className="font-semibold text-lg mb-1">
        {job.parsed?.title || "Untitled Job"}
      </h3>

      <p className="text-gray-400 text-sm line-clamp-2">
        {job.rawText.slice(0, 120)}...
      </p>

      <div className="mt-4 flex justify-between text-sm">
        <span className="text-gray-500">
          Candidates: {job.candidateCount || 0}
        </span>
        <a
          href={`/rank/${job._id}`}
          className="text-indigo-400 hover:underline"
        >
          View Ranking →
        </a>
      </div>
    </div>
  );
}
