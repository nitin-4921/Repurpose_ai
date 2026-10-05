export interface TranscriptItem {
  text: string;
  start: number; // in seconds
  duration: number; // in seconds
  timestamp?: string; // "mm:ss" or "hh:mm:ss"
  offset?: number; // legacy alias
}

export type ErrorCode =
  | 'INVALID_YOUTUBE_URL'
  | 'VIDEO_NOT_FOUND'
  | 'NO_TRANSCRIPT'
  | 'TRANSCRIPT_RETRIEVAL_FAILED'
  | 'AI_PROCESSING_FAILED';

export interface AppError {
  code: ErrorCode;
  message: string;
  details?: string;
}

export interface VideoMetadata {
  id: string;
  url: string;
  title: string;
  author: string;
  thumbnailUrl?: string;
  durationEstimate?: string;
  transcriptLength?: number;
}

export interface Chapter {
  timestamp: string;
  title: string;
}

export interface Quote {
  quote: string;
  speaker?: string;
  context?: string;
}

export interface Moment {
  id: string;
  title: string;
  timestamp: string;
  description: string;
  hook: string;
  reason: string;
  short_form_potential: 'high' | 'medium' | 'experimental';
}

export interface AnalysisData {
  title: string;
  summary: string;
  detailed_summary?: string;
  main_topic: string;
  subtopics: string[];
  themes: string[];
  speakers: string[];
  tone: string;
  key_takeaways: string[];
  important_quotes: Quote[];
  chapters: Chapter[];
  moments: Moment[];
}

export interface ShowNotesData {
  title: string;
  short_summary: string;
  detailed_summary: string;
  key_takeaways: string[];
  chapters: Chapter[];
  important_quotes: Quote[];
}

export interface YouTubeRepurposed {
  title_alternatives: string[];
  description: string;
  chapters_formatted: string;
  key_points: string[];
  tags: string[];
}

export interface PlatformContent {
  linkedin: string;
  x: string;
  instagram: string;
  youtube: YouTubeRepurposed;
}

export interface RepurposeResult {
  id: string;
  url: string;
  analyzedAt: string;
  video: VideoMetadata;
  analysis: AnalysisData;
  showNotes: ShowNotesData;
  moments: Moment[];
  platformContent: PlatformContent;
}

export type ProcessingStage =
  | 'idle'
  | 'validating'
  | 'video_identified'
  | 'fetching_transcript'
  | 'understanding_content'
  | 'extracting_moments'
  | 'generating_show_notes'
  | 'adapting_platforms'
  | 'completed'
  | 'error';
