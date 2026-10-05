import type { TranscriptItem, VideoMetadata, ErrorCode } from '../../src/types/index.ts';
import { SAMPLE_EPISODES } from './sampleTranscripts.ts';
import { YoutubeTranscript } from 'youtube-transcript';

export class YouTubePipelineError extends Error {
  code: ErrorCode;
  statusCode: number;

  constructor(code: ErrorCode, message: string, statusCode = 400) {
    super(message);
    this.name = 'YouTubePipelineError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * Robustly parses and validates a YouTube video ID from various URL formats
 */
export function extractYouTubeVideoId(inputUrl: string): string | null {
  if (!inputUrl || typeof inputUrl !== 'string') return null;
  const clean = inputUrl.trim();

  // If it matches one of our curated sample IDs directly
  if (SAMPLE_EPISODES[clean]) {
    return clean;
  }

  // 1. Try URL parsing first
  try {
    const urlObj = new URL(clean.startsWith('http://') || clean.startsWith('https://') ? clean : `https://${clean}`);
    const host = urlObj.hostname.toLowerCase().replace(/^www\./, '').replace(/^m\./, '');

    if (host === 'youtu.be') {
      const id = urlObj.pathname.slice(1).split('/')[0].split('?')[0];
      if (/^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
    }

    if (host === 'youtube.com' || host === 'music.youtube.com') {
      // /watch?v=VIDEO_ID
      const v = urlObj.searchParams.get('v');
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;

      // /shorts/VIDEO_ID
      const shortsMatch = urlObj.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
      if (shortsMatch) return shortsMatch[1];

      // /embed/VIDEO_ID
      const embedMatch = urlObj.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
      if (embedMatch) return embedMatch[1];

      // /live/VIDEO_ID
      const liveMatch = urlObj.pathname.match(/\/live\/([a-zA-Z0-9_-]{11})/);
      if (liveMatch) return liveMatch[1];

      // /v/VIDEO_ID
      const vMatch = urlObj.pathname.match(/\/v\/([a-zA-Z0-9_-]{11})/);
      if (vMatch) return vMatch[1];
    }
  } catch (_e) {
    // If URL parsing fails, proceed to regex checks
  }

  // 2. Canonical regex patterns for YouTube video URLs
  const patterns = [
    // Standard watch?v=VIDEO_ID (with optional other params before or after)
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/watch\?(?:[^&]+&)*v=([a-zA-Z0-9_-]{11})(?:&.*)?$/i,
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]{11})/i,
    // Shortened youtu.be/VIDEO_ID
    /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})(?:\?.*)?$/i,
    // Embed URL
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})(?:\?.*)?$/i,
    // YouTube Shorts
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})(?:\?.*)?$/i,
    // YouTube Live
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/live\/([a-zA-Z0-9_-]{11})(?:\?.*)?$/i,
    // /v/VIDEO_ID
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})(?:\?.*)?$/i,
  ];

  for (const pattern of patterns) {
    const match = clean.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // 3. Direct 11-character video ID string
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
    return clean;
  }

  return null;
}

/**
 * Formats seconds into mm:ss or hh:mm:ss
 */
export function formatSecondsToTimestamp(seconds: number): string {
  const totalSec = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hrs > 0) {
    return `${hrs}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

/**
 * Parses timestamp string "mm:ss" or "h:mm:ss" into total seconds
 */
export function parseTimestampToSeconds(stamp: string): number {
  const parts = stamp.trim().split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
}

/**
 * Fetches canonical video metadata using YouTube's official oEmbed endpoint
 */
export async function fetchYouTubeMetadata(videoId: string, originalUrl: string): Promise<VideoMetadata> {
  console.log(`[YouTube] Fetching metadata for video ID: ${videoId}`);

  // Check sample episodes first
  if (SAMPLE_EPISODES[videoId]) {
    const sample = SAMPLE_EPISODES[videoId];
    console.log(`[YouTube] Matched sample episode: "${sample.title}" by ${sample.author}`);
    return {
      id: videoId,
      url: originalUrl || sample.url,
      title: sample.title,
      author: sample.author,
      thumbnailUrl: sample.thumbnailUrl,
      durationEstimate: sample.durationEstimate,
    };
  }

  const standardUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const fallbackThumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(standardUrl)}&format=json`;
    const res = await fetch(oembedUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(6000),
    });

    if (res.ok) {
      const data = await res.json();
      console.log(`[YouTube] Metadata retrieved: "${data.title}" by ${data.author_name}`);
      return {
        id: videoId,
        url: standardUrl,
        title: data.title || `YouTube Video (${videoId})`,
        author: data.author_name || 'YouTube Creator',
        thumbnailUrl: data.thumbnail_url || fallbackThumbnail,
      };
    }

    if (res.status === 404 || res.status === 400) {
      console.warn(`[YouTube] oEmbed returned ${res.status}. Checking video playability...`);
      // Double check watch page
      const watchRes = await fetch(standardUrl, { signal: AbortSignal.timeout(6000) });
      const html = await watchRes.text();
      if (html.includes('"status":"ERROR"') || html.includes('Video unavailable') || html.includes('class="yt-player-error"')) {
        throw new YouTubePipelineError('VIDEO_NOT_FOUND', 'The YouTube video could not be found.', 404);
      }
    }
  } catch (err: any) {
    if (err instanceof YouTubePipelineError) throw err;
    console.warn(`[YouTube] oEmbed fetch warning for ${videoId}:`, err.message);
  }

  return {
    id: videoId,
    url: standardUrl,
    title: `Episode: ${videoId}`,
    author: 'YouTube Creator',
    thumbnailUrl: fallbackThumbnail,
  };
}

/**
 * Primary transcript retrieval service using youtube-transcript package.
 * youtube-transcript offsets are in milliseconds; we convert to seconds.
 */
export async function fetchYouTubeTranscript(
  videoId: string
): Promise<{
  items: TranscriptItem[];
  formattedText: string;
  timestampedText: string;
  estimatedDuration: string;
  source: string;
}> {
  console.log(`[Transcript] Attempting transcript retrieval for: ${videoId}`);

  // 1. Check curated samples
  if (SAMPLE_EPISODES[videoId]) {
    const sample = SAMPLE_EPISODES[videoId];
    console.log(`[Transcript] Using curated transcript for sample: ${videoId}`);
    const items: TranscriptItem[] = sample.transcript.map((t) => ({
      text: t.text,
      start: t.offset,
      duration: t.duration,
      timestamp: formatSecondsToTimestamp(t.offset),
      offset: t.offset,
    }));
    return processTranscriptItems(items, 'curated_sample');
  }

  // 2. Primary: youtube-transcript npm package (most reliable, no third-party dependency)
  //    Try English manual → English auto-generated → any available language
  const langPreferences = ['en', 'en-US', 'en-GB'];

  for (const lang of langPreferences) {
    try {
      console.log(`[Transcript] Trying youtube-transcript package (lang: ${lang})`);
      const raw = await YoutubeTranscript.fetchTranscript(videoId, { lang });
      if (raw && raw.length > 0) {
        console.log(`[Transcript] Transcript track found via youtube-transcript! (${raw.length} segments, lang: ${lang})`);
        // youtube-transcript returns offset in milliseconds — convert to seconds
        const items: TranscriptItem[] = raw.map((seg) => {
          const startSec = (seg.offset ?? 0) / 1000;
          const durationSec = (seg.duration ?? 2000) / 1000;
          return {
            text: seg.text.replace(/\n/g, ' ').trim(),
            start: startSec,
            duration: durationSec,
            timestamp: formatSecondsToTimestamp(startSec),
            offset: startSec,
          };
        });
        console.log(`[Transcript] Retrieved ${items.length} segments`);
        return processTranscriptItems(items, 'youtube-transcript-pkg');
      }
    } catch (err: any) {
      // TooManyRequestsError or TranscriptDisabledError etc.
      const msg: string = err?.message || String(err);
      if (msg.toLowerCase().includes('disabled') || msg.toLowerCase().includes('no captions')) {
        // Captions definitively disabled on this video — no point trying other langs
        console.warn(`[Transcript] Captions disabled for ${videoId}: ${msg}`);
        break;
      }
      console.warn(`[Transcript] youtube-transcript failed for lang=${lang}: ${msg}`);
    }
  }

  // 3. Fallback: try without specifying language (lets the package pick the default track)
  try {
    console.log(`[Transcript] Trying youtube-transcript without language preference`);
    const raw = await YoutubeTranscript.fetchTranscript(videoId);
    if (raw && raw.length > 0) {
      console.log(`[Transcript] Default language transcript retrieved (${raw.length} segments)`);
      const items: TranscriptItem[] = raw.map((seg) => {
        const startSec = (seg.offset ?? 0) / 1000;
        const durationSec = (seg.duration ?? 2000) / 1000;
        return {
          text: seg.text.replace(/\n/g, ' ').trim(),
          start: startSec,
          duration: durationSec,
          timestamp: formatSecondsToTimestamp(startSec),
          offset: startSec,
        };
      });
      return processTranscriptItems(items, 'youtube-transcript-pkg-default');
    }
  } catch (fallbackErr: any) {
    console.warn(`[Transcript] youtube-transcript default fallback failed: ${fallbackErr?.message}`);
  }

  // 4. If all strategies failed, check if video actually exists before reporting NO_TRANSCRIPT
  console.error(`[Transcript] Retrieval failed for video ID: ${videoId}`);
  try {
    const oembedCheck = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!oembedCheck.ok) {
      throw new YouTubePipelineError('VIDEO_NOT_FOUND', 'The YouTube video could not be found.', 404);
    }
  } catch (checkErr) {
    if (checkErr instanceof YouTubePipelineError) throw checkErr;
  }

  console.error(`[Transcript] Reason: No captions/transcript available for ${videoId}`);
  throw new YouTubePipelineError(
    'NO_TRANSCRIPT',
    'No transcript or captions are available for this video.',
    422
  );
}

/**
 * Normalizes transcript items into combined structures
 */
function processTranscriptItems(items: TranscriptItem[], source: string) {
  const validItems = items.filter((i) => i.text && i.text.trim().length > 0);

  if (validItems.length === 0) {
    throw new YouTubePipelineError(
      'NO_TRANSCRIPT',
      'No transcript or captions are available for this video.',
      422
    );
  }

  const lastItem = validItems[validItems.length - 1];
  const totalSeconds = (lastItem.start || 0) + (lastItem.duration || 0);
  const estimatedDuration = formatSecondsToTimestamp(totalSeconds);

  // Build clean timestamped text with [mm:ss] anchors for Gemini
  const timestampedBlocks: string[] = validItems.map((item) => {
    const stamp = item.timestamp || formatSecondsToTimestamp(item.start);
    return `[${stamp}] ${item.text}`;
  });

  const timestampedText = timestampedBlocks.join('\n');
  const formattedText = validItems.map((i) => i.text).join(' ');

  console.log(`[Transcript] Normalized transcript (${validItems.length} segments, ~${formattedText.split(/\s+/).length} words)`);

  return {
    items: validItems,
    formattedText,
    timestampedText,
    estimatedDuration,
    source,
  };
}

/**
 * Fallback timedtext parser
 */
async function fetchTimedTextFallback(videoId: string): Promise<TranscriptItem[]> {
  const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    signal: AbortSignal.timeout(6000),
  });

  if (!pageRes.ok) return [];

  const html = await pageRes.text();
  const splitted = html.split('"captionTracks":');
  if (splitted.length < 2) return [];

  const jsonEnd = splitted[1].indexOf(']');
  if (jsonEnd === -1) return [];

  const captionTracksJson = splitted[1].substring(0, jsonEnd + 1);
  const captionTracks = JSON.parse(captionTracksJson);

  if (!Array.isArray(captionTracks) || captionTracks.length === 0) return [];

  const track =
    captionTracks.find((t: any) => t.languageCode === 'en' && t.kind !== 'asr') ||
    captionTracks.find((t: any) => t.languageCode === 'en') ||
    captionTracks[0];

  if (!track || !track.baseUrl) return [];

  const xmlRes = await fetch(track.baseUrl, { signal: AbortSignal.timeout(6000) });
  if (!xmlRes.ok) return [];

  const xml = await xmlRes.text();
  const items: TranscriptItem[] = [];
  const regex = /<text start="([\d\.]+)" dur="([\d\.]+)"[^>]*>([\s\S]*?)<\/text>/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(xml)) !== null) {
    const start = parseFloat(match[1]);
    const duration = parseFloat(match[2]);
    const cleanText = match[3]
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();

    if (cleanText) {
      items.push({
        start,
        duration,
        timestamp: formatSecondsToTimestamp(start),
        text: cleanText,
      });
    }
  }

  return items;
}

/**
 * Decodes standard HTML entities in captions
 */
export function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  return text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parses XML transcript format containing <text start="..." dur="...">
 */
export function parseXmlTranscript(xml: string): TranscriptItem[] {
  if (!xml) return [];
  const items: TranscriptItem[] = [];
  const regex = /<text\s+start="([\d\.]+)"(?:\s+dur="([\d\.]+)")?[^>]*>([\s\S]*?)<\/text>/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(xml)) !== null) {
    const start = parseFloat(match[1]);
    const duration = match[2] ? parseFloat(match[2]) : 2;
    const cleanText = decodeHtmlEntities(match[3]);

    if (cleanText) {
      items.push({
        start,
        offset: start,
        duration,
        timestamp: formatSecondsToTimestamp(start),
        text: cleanText,
      });
    }
  }

  return items;
}
