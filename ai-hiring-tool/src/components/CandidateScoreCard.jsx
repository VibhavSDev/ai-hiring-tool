import { useEffect, useState } from "react";
import { Star, Send } from "lucide-react";
import API from "../services/api";

export default function CandidateScoreCard({ candidate, onUpdated }) {
  // Read from scoring.overallScore based on your schema object
  const initialScore = candidate?.scoring?.overallScore ?? candidate?.score ?? 0;
  const [score, setScore] = useState(initialScore);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const currentScore = candidate?.scoring?.overallScore ?? candidate?.score ?? 0;
    setScore(currentScore);
  }, [candidate?._id, candidate?.scoring?.overallScore, candidate?.score]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");
      const payload = await API.patch(`/candidates/${candidate._id}/score`, {
        score,
        feedback: feedback || `Score updated to ${score}`,
      });
      if (onUpdated) {
        onUpdated({
          ...(payload?.candidate || payload?.data?.candidate || payload || {}),
          scoring: payload?.scoring || payload?.data?.scoring || { overallScore: score },
        });
      }
      setMessage("Score and feedback updated.");
    } catch (err) {
      setMessage(err.message || "Unable to save score.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-[#111827] p-6 shadow-xl">
      <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-indigo-400">
        <Star size={16} /> Candidate score
      </div>
      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <label className="text-sm text-slate-400">Current score</label>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={score}
          onChange={(event) => setScore(Number(event.target.value))}
          className="mt-3 w-full accent-indigo-500"
        />
        <div className="mt-2 text-sm font-semibold text-white">{score}/100</div>
      </div>

      <textarea
        value={feedback}
        onChange={(event) => setFeedback(event.target.value)}
        placeholder="Add recruiter feedback or interview notes"
        className="mt-4 h-24 w-full rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-sm text-slate-200 outline-none"
      />

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-4 flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Send size={16} /> {saving ? "Saving..." : "Save feedback"}
      </button>

      {message ? <div className="mt-3 text-sm text-slate-400">{message}</div> : null}
    </div>
  );
}