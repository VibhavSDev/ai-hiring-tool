import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const interviewSchema = {
  type: SchemaType.OBJECT,
  properties: {
    skillGapQuestions: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "2-3 realistic questions targeting the candidate's missing or weak skills.",
    },
    practicalQuestions: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "2-3 scenario-based questions relevant to the job title.",
    },
    behavioralQuestions: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "2-3 behavioral questions to assess cultural fit and past experience.",
    },
  },
  required: ["skillGapQuestions", "practicalQuestions", "behavioralQuestions"],
};

export async function generateInterviewQuestions({
  jobTitle,
  jobSkills = [],
  candidateSkills = [],
  missingSkills = [],
  experienceLevel = "Mid",
}) {
  const prompt = `
You are a senior technical interviewer. Generate interview questions for a candidate applying for:
Role: "${jobTitle}" (${experienceLevel} level).

Job Required Skills: ${jobSkills.join(", ") || "None specified"}
Candidate Skills: ${candidateSkills.join(", ") || "None specified"}
Missing or Weak Skills: ${missingSkills.join(", ") || "None specified"}

Rules:
- Focus heavily on missing skills to test the candidate's adaptability.
- Questions must be realistic, scenario-based, and interview-ready.
- Avoid generic textbook questions.
- Do not include explanations or answers, only the questions.
`;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: interviewSchema,
      },
    });

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (err) {
    console.error("Interview question generation failed:", err);
    return {
      skillGapQuestions: ["Could not generate questions at this time."],
      practicalQuestions: ["Could not generate questions at this time."],
      behavioralQuestions: ["Could not generate questions at this time."],
    };
  }
}