export function buildAnalysisPrompt(params: {
  videoTitle: string;
  author: string;
  timestampedTranscript: string;
  estimatedDuration: string;
}): string {
  const { videoTitle, author, timestampedTranscript, estimatedDuration } = params;

  return `You are a senior editorial director and content strategist for premier podcasts and long-form video creators.

Analyze the following transcript from the episode:
TITLE: "${videoTitle}"
CREATOR / CHANNEL: "${author}"
APPROX DURATION: ${estimatedDuration}

TRANSCRIPT WITH TIMESTAMPS:
---
${timestampedTranscript}
---

CRITICAL INSTRUCTIONS & GROUNDING RULES:
1. STRICT TRUTHFULNESS: Base every single insight, quote, chapter, and moment strictly on what is stated in the transcript. Do NOT hallucinate quotes or make up facts.
2. TIMESTAMPS: Use the exact timestamps provided in brackets [mm:ss] from the transcript. For chapters and moments, map them accurately to the transcript timestamps.
3. MOMENTS (HIGHLIGHT OPPORTUNITIES): Identify 3 to 6 high-impact moments that would make compelling short-form video clips (Shorts/Reels/TikToks). For each moment:
   - Provide an exact timestamp window (e.g., "04:15 - 05:40")
   - A punchy title describing the topic
   - An irresistible, high-retention verbal hook ("Suggested Hook")
   - Why it matters / why it will perform well ("reason")
   - Short form potential rating ("high", "medium", or "experimental")
4. IMPORTANT QUOTES: Pull real, verbatim or minimally trimmed memorable quotes directly from the speakers.
5. CHAPTERS: Provide structured chapter markers starting with 00:00.

Return ONLY a valid JSON object matching this schema:
{
  "title": "Engaging, definitive episode title",
  "summary": "Crisp 2-3 sentence overview of the episode core message",
  "detailed_summary": "Comprehensive 2-paragraph narrative summary of the discussion and conclusions",
  "main_topic": "Core subject matter in 3-6 words",
  "subtopics": ["Subtopic 1", "Subtopic 2", "Subtopic 3", "Subtopic 4"],
  "themes": ["Theme 1", "Theme 2", "Theme 3"],
  "speakers": ["Speaker 1", "Speaker 2"],
  "tone": "e.g., Analytical & pragmatic, Conversational, Technical & visionary",
  "key_takeaways": [
    "Clear, actionable takeaway 1",
    "Clear, actionable takeaway 2",
    "Clear, actionable takeaway 3",
    "Clear, actionable takeaway 4",
    "Clear, actionable takeaway 5"
  ],
  "important_quotes": [
    {
      "quote": "Direct quote from transcript",
      "speaker": "Speaker name or Host/Guest",
      "context": "Context where this was stated"
    }
  ],
  "chapters": [
    {
      "timestamp": "00:00",
      "title": "Introduction & Overview"
    }
  ],
  "moments": [
    {
      "id": "moment-1",
      "title": "Title of the moment",
      "timestamp": "mm:ss – mm:ss",
      "description": "What happens in this section of the video",
      "hook": "Spoken hook to grab viewers in the first 3 seconds",
      "reason": "Why this moment has high engagement or viral potential",
      "short_form_potential": "high"
    }
  ]
}`;
}

export function buildPlatformRepurposingPrompt(params: {
  videoTitle: string;
  author: string;
  summary: string;
  keyTakeaways: string[];
  quotes: Array<{ quote: string; speaker?: string }>;
  chapters: Array<{ timestamp: string; title: string }>;
  moments: Array<{ title: string; hook: string; timestamp: string }>;
  customNotes?: string;
}): string {
  const { videoTitle, author, summary, keyTakeaways, quotes, chapters, moments, customNotes } = params;

  return `You are an elite multi-platform content strategist who writes native content for top executives, podcasters, and YouTube creators.

You are given the verified analysis of this episode:
Episode Title: "${videoTitle}"
Host/Creator: "${author}"
Summary: ${summary}

Key Takeaways:
${keyTakeaways.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Memorable Quotes:
${quotes.map((q) => `"${q.quote}" - ${q.speaker || author}`).join('\n')}

Key Highlight Moments:
${moments.map((m) => `• [${m.timestamp}] ${m.title}: "${m.hook}"`).join('\n')}

${customNotes ? `Additional creator instructions: ${customNotes}` : ''}

PLATFORM ADAPTATION RULES:
1. LINKEDIN:
   - Create a high-engagement thought-leadership post.
   - Start with a compelling 1-line hook that stops the scroll (no cheesy clickbait).
   - Use clean whitespace, line breaks, and clear bullet points for scannability.
   - Deliver real business/creator value from the episode.
   - Conclude with a thought-provoking discussion question.
   - Include 3-5 tasteful, professional hashtags.

2. X / TWITTER:
   - Create a high-signal, viral thread (formatted as numbered tweets 1/N, 2/N...).
   - Tweet 1: Magnetic hook with immediate payoff promise.
   - Tweets 2-5: Sharp, punchy breakdowns of the most insightful ideas, with quotes or frameworks.
   - Final Tweet: Recap & call to action to watch the full episode or bookmark.

3. INSTAGRAM:
   - Create an engaging caption tailored for an aesthetic or carousel post.
   - Line 1: Strong emotional or curiosity hook in all-caps or bold phrasing.
   - Body: Conversational storytelling highlighting 3 key breakthroughs.
   - Call to action: "Save this for later & share with a creator."
   - 10-15 relevant, targeted hashtags separated cleanly.

4. YOUTUBE REPURPOSED PACKAGE:
   - 3 high-converting title alternatives (e.g. curiosity-based, contrarian, direct benefit).
   - SEO-optimized YouTube video description with hook, summary, and links.
   - Formatted timestamped chapters list ready to paste directly into YouTube description (e.g., 00:00 Introduction).
   - Bulleted list of key points covered.
   - 10-15 comma-separated SEO tags.

Return ONLY a valid JSON object matching this schema:
{
  "linkedin": "Full LinkedIn post text with proper line breaks",
  "x": "Full X thread text with 1/ 2/ numbering and clear tweet dividers",
  "instagram": "Full Instagram caption with hook, body, CTA, and hashtags",
  "youtube": {
    "title_alternatives": [
      "Title option 1",
      "Title option 2",
      "Title option 3"
    ],
    "description": "Full YouTube description text...",
    "chapters_formatted": "00:00 - Introduction\\n03:15 - ...",
    "key_points": [
      "Point 1",
      "Point 2",
      "Point 3"
    ],
    "tags": [
      "tag1", "tag2", "tag3"
    ]
  }
}`;
}

export function buildSinglePlatformRegeneratePrompt(params: {
  platform: 'linkedin' | 'x' | 'instagram' | 'youtube';
  videoTitle: string;
  summary: string;
  keyTakeaways: string[];
  moments: Array<{ title: string; hook: string; timestamp: string }>;
  customInstruction?: string;
  currentContent?: string;
}): string {
  const { platform, videoTitle, summary, keyTakeaways, moments, customInstruction, currentContent } = params;

  return `You are a specialist copywriter for ${platform.toUpperCase()}.

Episode: "${videoTitle}"
Summary: ${summary}
Takeaways:
${keyTakeaways.slice(0, 5).map((t, i) => `${i + 1}. ${t}`).join('\n')}
Highlight Moments:
${moments.slice(0, 4).map((m) => `• [${m.timestamp}] ${m.title}`).join('\n')}

${currentContent ? `Current Version:\n${typeof currentContent === 'string' ? currentContent : JSON.stringify(currentContent)}\n` : ''}

${customInstruction ? `USER INSTRUCTION: ${customInstruction}` : 'Refine and provide a fresh, high-impact version with superior hook, structure, and clarity.'}

Return ONLY the updated content:
- If platform is 'linkedin', 'x', or 'instagram', return a JSON object: { "content": "..." }
- If platform is 'youtube', return a JSON object: { "title_alternatives": [...], "description": "...", "chapters_formatted": "...", "key_points": [...], "tags": [...] }
`;
}
