import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Define schema to enforce clean JSON output without markdown or conversational filler
const explanationSchema = {
  type: SchemaType.OBJECT,
  properties: {
    executiveSummary: {
      type: SchemaType.STRING,
      description: "A professional, 2-sentence executive summary synthesizing candidate strengths and areas for growth.",
    },
  },
  required: ["executiveSummary"],
};

export async function generateAIExplanation(structuredData) {
  if (!structuredData) return null;

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { 
        temperature: 0.2, 
        topP: 0.8,
        responseMimeType: "application/json",
        responseSchema: explanationSchema,
      } 
    });

    const strengthsText = Array.isArray(structuredData.strengths) 
      ? structuredData.strengths.join("; ") 
      : "None listed";
      
    const concernsText = Array.isArray(structuredData.concerns) 
      ? structuredData.concerns.join("; ") 
      : "None listed";

    const prompt = `
      SYSTEM: You are an objective HR Data Analyst. 
      TASK: Synthesize the provided 'Strengths' and 'Concerns' into a 2-sentence professional executive summary.
      
      CONSTRAINTS:
      - Use professional, active voice.
      - If "Concerns" exist, mention them as "areas for growth" or "gaps".
      - Strictly NO hallucinations; use only provided text.

      INPUT DATA:
      Summary: ${structuredData.summary || "N/A"}
      Strengths: ${strengthsText}
      Concerns: ${concernsText}
    `;

    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(result.response.text());
    
    return parsed.executiveSummary?.trim() || "AI-generated summary unavailable.";
  } catch (err) {
    console.error("AI Narrative Generation Failed:", err);
    return "AI-generated summary unavailable.";
  }
}