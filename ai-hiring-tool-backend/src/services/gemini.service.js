import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Define strict schemas to guarantee JSON structure
const jdSchema = {
  type: SchemaType.OBJECT,
  properties: {
    title: { type: SchemaType.STRING },
    experience_required: { type: SchemaType.STRING },
    skills_required: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    nice_to_have: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    job_summary: { type: SchemaType.STRING },
    responsibilities: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    keywords: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    seniority_level: { type: SchemaType.STRING },
    employment_type: { type: SchemaType.STRING },
    education_required: { type: SchemaType.STRING },
  },
};

const resumeSchema = {
  type: SchemaType.OBJECT,
  properties: {
    name: { type: SchemaType.STRING, description: "Candidate full name" },
    email: { type: SchemaType.STRING, description: "Clean email without symbols" },
    phone: { type: SchemaType.STRING },
    skills: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    experience_years: { type: SchemaType.NUMBER, description: "Total years of experience" },
    summary: { type: SchemaType.STRING },
    education: { type: SchemaType.STRING },
    confidence: { type: SchemaType.NUMBER, description: "Confidence score 1-100" },
  },
};

export async function parseJobDescription(jdText) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: jdSchema,
      },
    });

    const prompt = `Extract structured information from this Job Description:\n\n${jdText}`;
    const result = await model.generateContent(prompt);
    
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("Gemini JD Parse Error:", error.message);
    throw new Error("Failed to parse Job Description with AI"); 
  }
}

export async function parseResumeWithAI(rawText) {
  if (!rawText || rawText.trim().length < 20) {
    return { name: "Manual Review Required", email: "", skills: [], experience_years: 0, confidence: 0 };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: resumeSchema,
      },
    });

    const prompt = `Analyze this OCR-extracted resume text and extract the details. Calculate total years of experience based on the current date:\n\n${rawText}`;
    const result = await model.generateContent(prompt);
    
    return JSON.parse(result.response.text());
  } catch (err) {
    console.error("Gemini Resume Parse Error:", err);
    return {
      name: "Unknown Candidate",
      email: "not-found",
      skills: [],
      experience_years: 0,
      confidence: 10
    };
  }
}