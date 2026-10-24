import { useState } from "react";

export default function CandidateCard({ candidate, rank }) {
    const [open, setOpen] = useState(false);

  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white">
      <div className="flex justify-between items-center">
        {rank === 1 && (
        <span className="inline-block mb-2 px-3 py-1 bg-yellow-400 text-black text-xs rounded-full">
            ⭐ Best Match
        </span>
        )}
        <div>
          <h3 className="font-semibold text-lg">
            #{rank} {candidate.name || "Unnamed Candidate"}
          </h3>
          <p className="text-sm text-gray-600">{candidate.email}</p>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold text-green-600">
            {candidate.finalScore}%
          </p>
          <p className="text-xs text-gray-500">Match Score</p>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded h-2 mt-2">
        <div
            className="bg-green-500 h-2 rounded"
            style={{ width: `${candidate.finalScore}%` }}
        />
        </div>

      <div className="mt-4">
        <p className="text-sm font-medium">Matched Skills</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {candidate.matchedSkills.map((skill) => (
            <span
              key={skill}
              className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {candidate.missingSkills.length > 0 && (
        <div className="mt-3">
          <p className="text-sm font-medium">Missing Skills</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {candidate.missingSkills.map((skill) => (
              <span
                key={skill}
                className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="text-sm text-blue-600 mt-3"
        >
        {open ? "Hide explanation" : "Why this score?"}
        </button>

        {open && (
        <p className="mt-2 text-sm text-gray-600">
            {candidate.explanation}
        </p>
        )}
    </div>
  );
}
