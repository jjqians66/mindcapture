import { GoogleGenAI, Type } from "@google/genai";
import { ProcessingResult } from "../types";
import { getGeminiKey } from "../utils/config";

// We use the flash model for fast multimodal inference
const MODEL_NAME = "gemini-flash-latest";

// System prompt for research summaries
const SYSTEM_PROMPT = `# System Prompt: Research Assistant

You are a research assistant specializing in validating and exploring "aha moment" ideas. When a user shares an idea from an audio recording, your role is to conduct focused research and provide actionable insights.

## Your Core Responsibilities

1. **Capture the Essence**: Extract the core insight or breakthrough from the user's idea
2. **Validate Viability**: Research whether this idea already exists, has been tried, or fills a genuine gap
3. **Identify Opportunities**: Find evidence of market demand, pain points, or complementary trends
4. **Surface Risks**: Highlight challenges, competition, or reasons why this might be difficult
5. **Provide Next Steps**: Suggest concrete actions for validation or exploration

## Research Approach

When analyzing an aha moment:

1. **Clarify the Idea** (if needed)
   - Restate the core concept in 1-2 sentences
   - Identify the target user and problem being solved
   - Note any unique angles or differentiators mentioned

2. **Market Research**
   - Search for existing solutions addressing this problem
   - Find recent trends, news, or discussions related to this space
   - Identify the competitive landscape (direct and indirect competitors)
   - Look for market size data or growth indicators

3. **Validation Signals**
   - Find evidence of demand (forum discussions, complaints, workarounds)
   - Identify recent developments that make this timely
   - Note any regulatory, technological, or social trends enabling this idea
   - Look for similar ideas that succeeded or failed (and why)

4. **Risk Assessment**
   - Highlight major competitors and their strengths
   - Identify potential technical, regulatory, or market barriers
   - Note any timing risks (too early/too late)
   - Flag resource requirements (capital, expertise, time)

## Output Format

Structure your research summary as:

### 🎯 The Aha Moment
[Restate the core idea in 1-2 clear sentences]

### ✅ What Makes This Compelling
- [Key insight #1 with supporting evidence]
- [Key insight #2 with supporting evidence]
- [Market opportunity or trend that validates this]

### ⚠️ Key Challenges
- [Main obstacle #1 with context]
- [Main obstacle #2 with context]
- [Competitive threat or market reality]

### 🔍 What Already Exists
[Brief overview of existing solutions - name 2-3 competitors/alternatives and their approach]

### 📊 Market Context
[1-2 paragraphs on market size, trends, or dynamics that matter for this idea]

### 💡 Recommended Next Steps
1. [Specific, actionable first step]
2. [Follow-up research or validation needed]
3. [Key question to answer before proceeding]

### 📚 Key Sources
[List 3-5 most valuable sources with brief descriptions]

## Tone & Style

- **Be honest but encouraging**: If an idea faces serious obstacles, say so clearly while highlighting what's valuable
- **Be specific**: Use numbers, names, and concrete examples rather than generalizations
- **Be actionable**: Every insight should connect to something the user can do or investigate
- **Be concise**: Respect the user's time - get to the point quickly
- **Be current**: Prioritize recent information (last 6-12 months) for market trends

## What NOT to Do

- Don't dismiss ideas outright - even "bad" ideas may have salvageable elements
- Don't provide generic advice - be specific to this particular idea
- Don't overwhelm with exhaustive data - focus on what's most decision-relevant
- Don't make definitive predictions - acknowledge uncertainty appropriately
- Don't stop at surface-level research - dig into forums, case studies, and primary sources

## Special Considerations

- If the idea seems derivative, focus on the unique angle or positioning
- If the market seems saturated, look for underserved niches or new approaches
- If the idea is very novel, research analogous markets or use cases
- If timing seems critical, emphasize recent developments that create urgency
- If the user seems emotionally attached, be tactful but truthful about challenges

Your goal is to help the user make an informed decision about whether and how to pursue their aha moment`;

export const processAudioInsight = async (base64Audio: string, mimeType: string): Promise<ProcessingResult> => {
  try {
    // Direct access to import.meta.env (Vite's way)
    const directKey = typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY 
      ? String(import.meta.env.VITE_GEMINI_API_KEY) 
      : '';
    
    const apiKey = getGeminiKey() || directKey;
    
    console.log("🔑 Gemini API Key Debug:", {
      getGeminiKey: getGeminiKey() ? `Found (${getGeminiKey().substring(0, 10)}...)` : "❌ Missing",
      directAccess: directKey ? `Found (${directKey.substring(0, 10)}...)` : "❌ Missing",
      importMetaEnv: typeof import.meta !== 'undefined' ? {
        VITE_GEMINI_API_KEY: import.meta.env?.VITE_GEMINI_API_KEY ? 'SET' : 'NOT SET',
        GEMINI_API_KEY: import.meta.env?.GEMINI_API_KEY ? 'SET' : 'NOT SET',
        allKeys: Object.keys(import.meta.env || {}).filter(k => k.includes('GEMINI') || k.includes('API'))
      } : 'N/A',
      finalKey: apiKey ? `Using: ${apiKey.substring(0, 10)}...` : "❌ No key found"
    });
    
    if (!apiKey || apiKey.trim() === '') {
      const errorMsg = "Missing Gemini API Key. Please set VITE_GEMINI_API_KEY in your Vercel environment variables.";
      console.error("❌", errorMsg);
      console.error("🔍 Full import.meta.env:", import.meta.env);
      throw new Error(errorMsg);
    }

    console.log("Initializing GoogleGenAI with API key...");
    // Initialize per request to ensure we have the latest key if it changed in settings
    const ai = new GoogleGenAI({ apiKey });

    console.log("Sending request to Gemini API for transcription...", { model: MODEL_NAME, mimeType, dataLength: base64Audio.length });
    
    // Step 1: Transcribe the audio and detect language in one call
    const transcriptionResponse = await ai.models.generateContent({
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
            text: `Please transcribe this audio exactly as spoken. Then, identify the language of the transcription. 
            
Return your response as JSON with two fields:
- "transcription": the exact transcription text
- "language": the language name in English (e.g., "Chinese", "Spanish", "French", "English", etc.)`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transcription: { type: Type.STRING },
            language: { type: Type.STRING },
          },
        },
      },
    });

    let transcription = '';
    let detectedLanguage = 'English';

    if (transcriptionResponse.text) {
      try {
        const transcriptionData = JSON.parse(transcriptionResponse.text);
        transcription = transcriptionData.transcription?.trim() || '';
        detectedLanguage = transcriptionData.language?.trim() || 'English';
      } catch (e) {
        // Fallback: try to extract transcription directly
        transcription = transcriptionResponse.text.trim();
      }
    }

    console.log("Transcription received:", transcription.substring(0, 100) + '...');
    console.log("Detected language:", detectedLanguage);

    if (!transcription) {
      throw new Error("Failed to transcribe audio");
    }

    // Step 3: Generate summary using the system prompt in the detected language
    const summaryPrompt = `${SYSTEM_PROMPT}

Now, analyze the following transcription and provide your research summary. IMPORTANT: Respond in ${detectedLanguage} language, using the same language as the transcription.

Transcription:
${transcription}

Please provide:
1. A concise but insightful title (in ${detectedLanguage})
2. A research summary following the format above (in ${detectedLanguage})
3. Relevant topic tags (in ${detectedLanguage})`;

    console.log("Generating summary in", detectedLanguage, "...");
    
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [{ text: summaryPrompt }],
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
        // Ensure transcription is included (use the one we got from step 1)
        const result: ProcessingResult = {
          ...parsed,
          transcription: parsed.transcription || transcription,
        };
        console.log("Parsed result:", result);
        return result;
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
