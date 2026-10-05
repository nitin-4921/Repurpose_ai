import React from 'react';
import { Check, Loader2, Circle, AlertCircle, RotateCcw } from 'lucide-react';
import { ProcessingStage, AppError } from '../types/index.ts';

interface LoadingStagesProps {
  currentStage: ProcessingStage;
  elapsedSeconds: number;
  error?: AppError | null;
  onRetry?: () => void;
}

interface StageStep {
  key: ProcessingStage;
  label: string;
  subtext: string;
}

export const LoadingStages: React.FC<LoadingStagesProps> = ({
  currentStage,
  elapsedSeconds,
  error,
  onRetry,
}) => {
  const steps: StageStep[] = [
    {
      key: 'validating',
      label: 'YouTube URL validated',
      subtext: 'Verifying canonical video identifier syntax',
    },
    {
      key: 'video_identified',
      label: 'Video identified',
      subtext: 'Retrieving canonical metadata and verifying playability',
    },
    {
      key: 'fetching_transcript',
      label: 'Transcript retrieved',
      subtext: 'Extracting timestamped caption tracks & speech segments',
    },
    {
      key: 'understanding_content',
      label: 'Understanding content',
      subtext: 'Analyzing core argument, themes, tone, and speaker context',
    },
    {
      key: 'extracting_moments',
      label: 'Finding valuable moments',
      subtext: 'Identifying viral clip opportunities and 3-second audio hooks',
    },
    {
      key: 'generating_show_notes',
      label: 'Generating content',
      subtext: 'Synthesizing takeaways, quotes, and timestamped chapters',
    },
    {
      key: 'adapting_platforms',
      label: 'Adapting for platforms',
      subtext: 'Formatting native LinkedIn, X thread, Instagram, and YouTube packages',
    },
  ];

  const getStepStatus = (stepKey: ProcessingStage): 'completed' | 'active' | 'pending' | 'failed' => {
    if (error) {
      if (
        (stepKey === 'fetching_transcript' &&
          (error.code === 'NO_TRANSCRIPT' || error.code === 'TRANSCRIPT_RETRIEVAL_FAILED')) ||
        (stepKey === 'video_identified' && error.code === 'VIDEO_NOT_FOUND') ||
        (stepKey === 'validating' && error.code === 'INVALID_YOUTUBE_URL')
      ) {
        return 'failed';
      }
    }

    const stageOrder: ProcessingStage[] = [
      'validating',
      'video_identified',
      'fetching_transcript',
      'understanding_content',
      'extracting_moments',
      'generating_show_notes',
      'adapting_platforms',
      'completed',
    ];

    const currentIndex = stageOrder.indexOf(currentStage);
    const stepIndex = stageOrder.indexOf(stepKey);

    if (currentStage === 'completed' || currentIndex > stepIndex) {
      return 'completed';
    }
    if (currentIndex === stepIndex) {
      return 'active';
    }
    return 'pending';
  };

  return (
    <div className="bg-[#ffffff] border border-[#e7e3dc] rounded-xl p-8 max-w-xl mx-auto shadow-xs text-left">
      <div className="flex items-center justify-between border-b border-[#f0ede6] pb-4 mb-6">
        <div>
          <h3 className="font-serif text-2xl text-[#1c1917]">
            {error ? 'Analysis halted' : 'Analyzing your episode...'}
          </h3>
          <p className="text-xs text-[#78716c] mt-0.5">
            {error
              ? 'A problem was encountered during processing.'
              : 'Processing YouTube transcript through the RepurposeAI editorial pipeline.'}
          </p>
        </div>
        <div className="text-right">
          <span className="font-mono text-xs text-[#8c827a] bg-[#faf8f5] px-2.5 py-1 rounded-sm border border-[#e7e3dc]">
            {elapsedSeconds}s elapsed
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {steps.map((step) => {
          const status = getStepStatus(step.key);

          return (
            <div
              key={step.key}
              className={`flex items-start gap-3.5 transition-opacity duration-300 ${
                status === 'pending' ? 'opacity-40' : 'opacity-100'
              }`}
            >
              <div className="pt-0.5">
                {status === 'completed' && (
                  <div className="w-5 h-5 rounded-full bg-[#10b981]/15 text-[#10b981] flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                )}
                {status === 'active' && (
                  <div className="w-5 h-5 rounded-full bg-[#c25e36]/15 text-[#c25e36] flex items-center justify-center animate-spin">
                    <Loader2 className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                )}
                {status === 'pending' && (
                  <div className="w-5 h-5 rounded-full border border-[#d6d1c9] text-transparent flex items-center justify-center">
                    <Circle className="w-2.5 h-2.5 text-[#d6d1c9]" />
                  </div>
                )}
                {status === 'failed' && (
                  <div className="w-5 h-5 rounded-full bg-[#ef4444]/15 text-[#ef4444] flex items-center justify-center">
                    <AlertCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                )}
              </div>

              <div>
                <p
                  className={`text-sm font-medium ${
                    status === 'active'
                      ? 'text-[#c25e36]'
                      : status === 'completed'
                      ? 'text-[#1c1917]'
                      : status === 'failed'
                      ? 'text-[#ef4444]'
                      : 'text-[#78716c]'
                  }`}
                >
                  {status === 'completed' && '✓ '}
                  {status === 'active' && '● '}
                  {status === 'pending' && '○ '}
                  {status === 'failed' && '✕ '}
                  {status === 'failed' && step.key === 'fetching_transcript'
                    ? 'Transcript retrieval failed'
                    : step.label}
                </p>
                <p className="text-xs text-[#8c827a] mt-0.5">
                  {status === 'failed' && error ? error.message : step.subtext}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mt-6 pt-4 border-t border-[#f0ede6] flex items-center justify-between">
          <span className="text-xs font-mono text-[#ef4444] bg-[#fef2f2] px-2 py-0.5 rounded-sm">
            {error.code}
          </span>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-3.5 py-1.5 bg-[#1c1917] hover:bg-[#2d2926] text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Pipeline</span>
            </button>
          )}
        </div>
      )}

      {!error && (
        <div className="mt-8 pt-4 border-t border-[#f0ede6] flex items-center justify-between text-xs text-[#a8a29e]">
          <span>Grounded Gemini Processing</span>
          <span>Zero hallucination constraint active</span>
        </div>
      )}
    </div>
  );
};
