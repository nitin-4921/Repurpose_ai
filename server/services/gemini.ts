import { GoogleGenAI } from '@google/genai';
import type { AnalysisData, PlatformContent, YouTubeRepurposed } from '../../src/types/index.ts';
import {
  buildAnalysisPrompt,
  buildPlatformRepurposingPrompt,
  buildSinglePlatformRegeneratePrompt,
} from '../prompts/repurposePrompt.ts';

let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please check your environment variables or Secrets panel.');
  }

  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  return aiInstance;
}

function cleanJsonString(raw: string): string {
  if (!raw) return '{}';
  let cleaned = raw.trim();
  // Strip markdown code fences if model enclosed in ```json ... ```
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/i, '');
  }
  return cleaned.trim();
}

async function generateWithFallback(
  ai: GoogleGenAI,
  params: {
    contents: string;
    config: any;
  }
) {
  // Models in preference order — verified working right now
  const modelsToTry = [
    'gemini-3.6-flash',
    'gemini-3.1-flash-lite',
    'gemini-3.1-flash-lite-preview',
    'gemini-3-flash-preview',
    'gemini-flash-lite-latest',
    'gemini-3.8-flash',         // may hit quota but keep as last resort
  ];

  let lastError: any = null;
  for (const model of modelsToTry) {
    try {
      // 25-second per-model timeout to skip hanging models
      const response = await Promise.race([
        ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Model ${model} timed out after 25s`)), 25000)
        ),
      ]);
      if (response && response.text) {
        return response;
      }
      console.warn(`[Gemini API] Model ${model} returned empty response. Trying next.`);
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini API] Model ${model} failed: ${err.message?.substring(0, 120)}. Trying next fallback.`);
      continue;
    }
  }
  throw lastError;
}

/**
 * Stage 1 & 2: Understand content, extract moments, takeaways, chapters, quotes
 */
export async function analyzeTranscript(params: {
  videoTitle: string;
  author: string;
  timestampedTranscript: string;
  estimatedDuration: string;
}): Promise<AnalysisData> {
  const ai = getGeminiClient();
  const prompt = buildAnalysisPrompt(params);

  const response = await generateWithFallback(ai, {
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.2, // Low temperature for high grounding and factuality
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('Gemini model returned an empty response during content analysis.');
  }

  try {
    const parsed = JSON.parse(cleanJsonString(text)) as AnalysisData;
    // Ensure moments have IDs
    if (parsed.moments && Array.isArray(parsed.moments)) {
      parsed.moments = parsed.moments.map((m, idx) => ({
        ...m,
        id: m.id || `moment-${idx + 1}`,
      }));
    }
    return parsed;
  } catch (err: any) {
    console.error('[Gemini Analysis] Failed to parse JSON response:', text);
    throw new Error(`Failed to parse AI analysis output: ${err.message}`);
  }
}

/**
 * Stage 3 & 4: Multi-platform repurposing (LinkedIn, X, Instagram, YouTube)
 */
export async function generatePlatformContent(params: {
  videoTitle: string;
  author: string;
  summary: string;
  keyTakeaways: string[];
  quotes: Array<{ quote: string; speaker?: string }>;
  chapters: Array<{ timestamp: string; title: string }>;
  moments: Array<{ title: string; hook: string; timestamp: string }>;
  customNotes?: string;
}): Promise<PlatformContent> {
  const ai = getGeminiClient();
  const prompt = buildPlatformRepurposingPrompt(params);

  const response = await generateWithFallback(ai, {
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.3,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('Gemini model returned an empty response during platform repurposing.');
  }

  try {
    const parsed = JSON.parse(cleanJsonString(text)) as PlatformContent;
    return parsed;
  } catch (err: any) {
    console.error('[Gemini Platform Repurposing] Failed to parse JSON response:', text);
    throw new Error(`Failed to parse platform content output: ${err.message}`);
  }
}

/**
 * Regenerate a single platform's content with optional user prompt instructions
 */
export async function regeneratePlatform(params: {
  platform: 'linkedin' | 'x' | 'instagram' | 'youtube';
  videoTitle: string;
  summary: string;
  keyTakeaways: string[];
  moments: Array<{ title: string; hook: string; timestamp: string }>;
  customInstruction?: string;
  currentContent?: any;
}): Promise<string | YouTubeRepurposed> {
  const ai = getGeminiClient();
  const prompt = buildSinglePlatformRegeneratePrompt(params);

  const response = await generateWithFallback(ai, {
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.4,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('Gemini returned an empty response during regeneration.');
  }

  const parsed = JSON.parse(cleanJsonString(text));
  if (params.platform === 'youtube') {
    return parsed as YouTubeRepurposed;
  }
  return (parsed.content || text) as string;
}
