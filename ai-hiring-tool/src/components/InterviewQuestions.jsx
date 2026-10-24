import { useState } from "react";
import { Loader2, Sparkles, MessageSquareQuote, Wrench, Users } from "lucide-react";
import { generateInterviewQuestionsAPI } from "../services/api";

const sectionMeta = [
  { key: "skillGapQuestions", title: "Skill-gap questions", icon: Wrench },
  { key: "practicalQuestions", title: "Practical questions", icon: Sparkles },
  { key: "behavioralQuestions", title: "Behavioral questions", icon: Users },
];

export default function InterviewQuestions({ candidate }) {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState(null);
  const [error, setError] = useState("");

  const deriveCandidateSkills = () => {
    const text = [candidate?.summary, candidate?.notes].filter(Boolean).join(" ");
    if (!text) return [];

    return text
      .split(/[,;.|\n]+/)
      .map((entry) => entry.trim())
      .filter(Boolean)
      .slice(0, 8);
  };

  const deriveMissingSkills = () => {
    const requiredSkills = candidate?.jobId?.parsed?.skills_required || [];
    const candidateSkills = deriveCandidateSkills().map((skill) => skill.toLowerCase());

    return requiredSkills.filter((skill) => !candidateSkills.includes(skill.toLowerCase())).slice(0, 6);
  };

  const handleGenerate = async () => {
    if (!candidate) return;

    try {
      setLoading(true);
      setError("");
      // api.js interceptor already unwraps response.data globally
      const payload = await generateInterviewQuestionsAPI({
        jobTitle: candidate?.jobId?.title || "Role",
        jobSkills: candidate?.jobId?.parsed?.skills_required || [],
        candidateSkills: deriveCandidateSkills(),
        missingSkills: deriveMissingSkills(),
        experienceLevel: candidate?.jobId?.parsed?.experience_required || "Mid",
      });
      
      // Safely extract questions object whether nested under data or returned directly
      const resultData = payload?.questions || payload?.data || payload;
      setQuestions(resultData || null);
    } catch (err) {
      setError(err.message || "Unable to generate interview questions right now.");
      setQuestions(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-[#111827] p-6 shadow-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-indigo-400">
            <MessageSquareQuote size={16} /> Interview prep
          </div>
          <p className="mt-2 text-sm text-slate-400">Generate AI-assisted questions for the next interview round.</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading || !candidate}
          className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Loader2 size={16} className="mr-2 inline animate-spin" /> : <Sparkles size={16} className="mr-2 inline" />}
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>

      {error ? <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</div> : null}

      {!questions && !loading && !error ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-500">
          Kick off a fresh set of interview questions tailored to this role and candidate profile.
        </div>
      ) : null}

      {questions ? (
        <div className="mt-5 space-y-3">
          {sectionMeta.map((section) => {
            const Icon = section.icon;
            const items = questions[section.key] || [];

            return (
              <div key={section.key} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <Icon size={16} className="text-indigo-400" /> {section.title}
                </div>
                {items.length > 0 ? (
                  <ul className="mt-3 space-y-2 text-sm text-slate-400">
                    {items.map((item, index) => (
                      <li key={`${section.key}-${index}`} className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-3 text-sm text-slate-500">No questions generated for this section yet.</div>
                )}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}