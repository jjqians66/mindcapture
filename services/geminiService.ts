import { GoogleGenAI, Type } from "@google/genai";
import { ProcessingResult } from "../types";
import { getGeminiKey } from "../utils/config";

// We use the flash model for fast multimodal inference
const MODEL_NAME = "gemini-flash-latest";

export const processAudioInsight = async (base64Audio: string, mimeType: string): Promise<ProcessingResult> => {
  try {
    const apiKey = getGeminiKey();
    console.log("🔑 Gemini API Key check:", apiKey ? `Found (${apiKey.substring(0, 10)}...)` : "❌ Missing");
    console.log("🔍 Checking import.meta.env:", {
      VITE_GEMINI_API_KEY: typeof import.meta !== 'undefined' ? import.meta.env?.VITE_GEMINI_API_KEY?.substring(0, 10) + '...' : 'N/A',
      GEMINI_API_KEY: typeof import.meta !== 'undefined' ? import.meta.env?.GEMINI_API_KEY?.substring(0, 10) + '...' : 'N/A',
    });
    
    if (!apiKey) {
      const errorMsg = "Missing Gemini API Key. Please set VITE_GEMINI_API_KEY in your Vercel environment variables.";
      console.error("❌", errorMsg);
      throw new Error(errorMsg);
    }

    console.log("Initializing GoogleGenAI with API key...");
    // Initialize per request to ensure we have the latest key if it changed in settings
    const ai = new GoogleGenAI({ apiKey });

    console.log("Sending request to Gemini API...", { model: MODEL_NAME, mimeType, dataLength: base64Audio.length });
    
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

    console.log("Gemini API response received:", response);

    if (response.text) {
      try {
        const parsed = JSON.parse(response.text) as ProcessingResult;
        console.log("Parsed result:", parsed);
        return parsed;
      } catch (parseError) {
        console.error("Failed to parse response:", parseError, "Response text:", response.text);
        throw new Error(`Failed to parse Gemini response: ${parseError}`);
      }
    }
    
    throw new Error("No response text from Gemini");

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Provide more specific error messages
    if (error?.message?.includes("API key")) {
      throw new Error("Invalid or missing Gemini API key. Please check your VITE_GEMINI_API_KEY environment variable.");
    }
    if (error?.status === 429 || error?.message?.includes("quota")) {
      throw new Error("API quota exceeded. Please check your Gemini API quota.");
    }
    if (error?.status === 400) {
      throw new Error(`Bad request: ${error?.message || "Invalid audio format or request"}`);
    }
    if (error?.status === 401) {
      throw new Error("Unauthorized: Invalid API key. Please check your VITE_GEMINI_API_KEY.");
    }
    
    throw new Error(error?.message || `Gemini API error: ${JSON.stringify(error)}`);
  }
};
