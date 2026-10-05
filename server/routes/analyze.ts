import { Request, Response, Router } from 'express';
import { regeneratePlatform } from '../services/gemini.ts';
import { processRepurposePipeline } from '../services/repurposing.ts';
import { SAMPLE_EPISODES } from '../services/sampleTranscripts.ts';
import { YouTubePipelineError } from '../services/youtubeTranscript.ts';

export const analyzeRouter = Router();

// Main analyze endpoint: POST /api/analyze-youtube
analyzeRouter.post('/analyze-youtube', async (req: Request, res: Response) => {
  try {
    const { url, customNotes } = req.body;

    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_YOUTUBE_URL',
        message: 'Please provide a valid YouTube URL.',
      });
    }

    const result = await processRepurposePipeline({
      url: url.trim(),
      customNotes: typeof customNotes === 'string' ? customNotes.trim() : undefined,
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[API Error /analyze-youtube]:', error);

    if (error instanceof YouTubePipelineError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.code,
        message: error.message,
      });
    }

    // Default unhandled error
    return res.status(500).json({
      success: false,
      error: 'TRANSCRIPT_RETRIEVAL_FAILED',
      message: error?.message || "We couldn't retrieve the transcript. Please try again.",
    });
  }
});

// Single platform regeneration endpoint: POST /api/regenerate-platform
analyzeRouter.post('/regenerate-platform', async (req: Request, res: Response) => {
  try {
    const { platform, videoTitle, summary, keyTakeaways, moments, customInstruction, currentContent } = req.body;

    if (!['linkedin', 'x', 'instagram', 'youtube'].includes(platform)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_PLATFORM',
        message: 'Invalid platform specified.',
      });
    }

    const updatedContent = await regeneratePlatform({
      platform,
      videoTitle: videoTitle || 'Episode',
      summary: summary || '',
      keyTakeaways: Array.isArray(keyTakeaways) ? keyTakeaways : [],
      moments: Array.isArray(moments) ? moments : [],
      customInstruction,
      currentContent,
    });

    return res.json({
      success: true,
      data: {
        platform,
        content: updatedContent,
      },
    });
  } catch (error: any) {
    console.error('[API Error /regenerate-platform]:', error);
    return res.status(500).json({
      success: false,
      error: 'AI_PROCESSING_FAILED',
      message: error?.message || 'Failed to regenerate platform content.',
    });
  }
});

// Curated sample episodes for instant 1-click testing: GET /api/samples
analyzeRouter.get('/samples', (_req: Request, res: Response) => {
  const samples = Object.values(SAMPLE_EPISODES).map((s) => ({
    id: s.id,
    url: s.url,
    title: s.title,
    author: s.author,
    thumbnailUrl: s.thumbnailUrl,
    durationEstimate: s.durationEstimate,
    description: s.description,
  }));

  res.json({
    success: true,
    data: samples,
  });
});

// Server status & health check: GET /api/health
analyzeRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});
