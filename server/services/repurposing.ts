import type { RepurposeResult, ShowNotesData } from '../../src/types/index.ts';
import { analyzeTranscript, generatePlatformContent } from './gemini.ts';
import {
  extractYouTubeVideoId,
  fetchYouTubeMetadata,
  fetchYouTubeTranscript,
  YouTubePipelineError,
} from './youtubeTranscript.ts';

export async function processRepurposePipeline(params: {
  url: string;
  customNotes?: string;
}): Promise<RepurposeResult> {
  const { url, customNotes } = params;

  console.log(`[YouTube] Received URL: ${url}`);

  if (!url || typeof url !== 'string' || !url.trim()) {
    throw new YouTubePipelineError(
      'INVALID_YOUTUBE_URL',
      'Please provide a valid YouTube URL.',
      400
    );
  }

  // 1. Validate & extract video ID
  const videoId = extractYouTubeVideoId(url.trim());
  if (!videoId) {
    console.warn(`[YouTube] URL validation failed for input: "${url}"`);
    throw new YouTubePipelineError(
      'INVALID_YOUTUBE_URL',
      'Please provide a valid YouTube URL.',
      400
    );
  }

  console.log(`[YouTube] Extracted video ID: ${videoId}`);

  // 2. Fetch video metadata
  const metadata = await fetchYouTubeMetadata(videoId, url.trim());

  // 3. Fetch transcript
  const { items, formattedText, timestampedText, estimatedDuration } =
    await fetchYouTubeTranscript(videoId);

  metadata.durationEstimate = estimatedDuration;
  metadata.transcriptLength = items.length;

  // 4. Long transcript token safety handling
  let processedTimestamped = timestampedText;
  const wordCount = formattedText.split(/\s+/).length;
  console.log(`[Transcript] Checking transcript word count: ~${wordCount} words`);

  if (wordCount > 100000) {
    console.warn(`[Transcript] Extremely large transcript (${wordCount} words). Safely windowing to 1500 segments.`);
    const lines = timestampedText.split('\n');
    processedTimestamped =
      lines.slice(0, 1500).join('\n') +
      '\n[...Transcript safely windowed for token limits...]';
  }

  // 5. Send transcript for AI content understanding and moment extraction
  console.log(`[Gemini] Sending transcript for analysis (Video: "${metadata.title}")...`);
  let analysis;
  try {
    analysis = await analyzeTranscript({
      videoTitle: metadata.title,
      author: metadata.author,
      timestampedTranscript: processedTimestamped,
      estimatedDuration,
    });
    console.log(`[Gemini] Content analysis generated successfully (${analysis.moments.length} moments identified)`);
  } catch (aiErr: any) {
    console.error(`[Gemini] Analysis failed: ${aiErr.message}`);
    throw new YouTubePipelineError(
      'AI_PROCESSING_FAILED',
      'The transcript was retrieved, but AI processing failed.',
      500
    );
  }

  // 6. Structure Show Notes
  const showNotes: ShowNotesData = {
    title: analysis.title || metadata.title,
    short_summary: analysis.summary,
    detailed_summary: analysis.detailed_summary || analysis.summary,
    key_takeaways: analysis.key_takeaways || [],
    chapters: analysis.chapters || [],
    important_quotes: analysis.important_quotes || [],
  };

  // 7. Multi-platform repurposing
  console.log(`[Gemini] Adapting content for platforms (LinkedIn, X, Instagram, YouTube)...`);
  let platformContent;
  try {
    platformContent = await generatePlatformContent({
      videoTitle: showNotes.title,
      author: metadata.author,
      summary: showNotes.short_summary,
      keyTakeaways: showNotes.key_takeaways,
      quotes: showNotes.important_quotes,
      chapters: showNotes.chapters,
      moments: analysis.moments.map((m) => ({
        title: m.title,
        hook: m.hook,
        timestamp: m.timestamp,
      })),
      customNotes,
    });
    console.log(`[Gemini] Platform adaptation completed successfully!`);
  } catch (aiErr: any) {
    console.error(`[Gemini] Platform adaptation failed: ${aiErr.message}`);
    throw new YouTubePipelineError(
      'AI_PROCESSING_FAILED',
      'The transcript was retrieved, but AI processing failed.',
      500
    );
  }

  const result: RepurposeResult = {
    id: `rep-${Date.now()}-${videoId}`,
    url: url.trim(),
    analyzedAt: new Date().toISOString(),
    video: metadata,
    analysis,
    showNotes,
    moments: analysis.moments,
    platformContent,
  };

  return result;
}
