import { GoogleGenAI, Type } from "@google/genai";
import { ProcessingResult } from "../types";
import { getGeminiKey } from "../utils/config";

// We use the flash model for fast multimodal inference
const MODEL_NAME = "gemini-flash-latest";

export const processAudioInsight = async (base64Audio: string, mimeType: string): Promise<ProcessingResult> => {
  try {
    const apiKey = getGeminiKey();
    if (!apiKey) {
      throw new Error("Missing Gemini API Key. Please set VITE_GEMINI_API_KEY in .env.local file.");
    }

    // Initialize per request to ensure we have the latest key if it changed in settings
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio,
            },
          },
          {
            text: `You are an advanced research assistant. Listen to the attached audio thought. 
            1. Transcribe the audio exactly.
            2. Generate a concise but insightful title.
            3. Provide a research summary that expands on the thought with factual context or logical steps.
            4. Generate relevant topic tags.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transcription: { type: Type.STRING },
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as ProcessingResult;
    }
    
    throw new Error("No response text from Gemini");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
