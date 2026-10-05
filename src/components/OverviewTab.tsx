import React from 'react';
import { RepurposeResult } from '../types/index.ts';
import { Check, Copy, ExternalLink, Flame, MessageSquareQuote, Layers, Bookmark } from 'lucide-react';

interface OverviewTabProps {
  result: RepurposeResult;
  onNavigateTab: (tab: 'shownotes' | 'highlights' | 'linkedin' | 'x' | 'instagram' | 'youtube') => void;
  onCopyText: (text: string, label: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  result,
  onNavigateTab,
  onCopyText,
}) => {
  const { video, analysis, showNotes, moments } = result;

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      {/* Episode Header Banner */}
      <div className="bg-[#ffffff] border border-[#e7e3dc] rounded-xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {video.thumbnailUrl && (
            <div className="w-full md:w-56 shrink-0 rounded-lg overflow-hidden border border-[#ded9d0] relative group bg-[#f0ede6]">
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full aspect-video object-cover"
                onError={(e) => {
                  // Fallback if image fails
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <a
                href={video.url}
                target="_blank"
                rel="noreferrer"
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-1"
              >
                <span>View on YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          <div className="flex-1 space-y-3">
            {/* Metadata (Zero-Pill Discipline: unboxed text with typographic separators) */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#78716c]">
              <span className="font-semibold text-[#1c1917]">{video.author}</span>
              <span aria-hidden="true">·</span>
              <span>{video.durationEstimate || 'Full Episode'}</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#a8a29e]">{analysis.tone || 'Conversational'}</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl text-[#1c1917] tracking-tight leading-snug">
              {showNotes.title || video.title}
            </h1>

            <p className="text-sm text-[#44403c] leading-relaxed">
              {showNotes.short_summary}
            </p>

            {/* Quick Metrics Bar */}
            <div className="pt-3 border-t border-[#f0ede6] flex flex-wrap gap-4 text-xs text-[#78716c]">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#c25e36]" />
                <span><strong className="text-[#1c1917]">{moments.length}</strong> highlight clips identified</span>
              </div>
              <span aria-hidden="true" className="text-[#d6d1c9]">/</span>
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#10b981]" />
                <span><strong className="text-[#1c1917]">4</strong> platform packages generated</span>
              </div>
              <span aria-hidden="true" className="text-[#d6d1c9]">/</span>
              <div className="flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-[#8c827a]" />
                <span><strong className="text-[#1c1917]">{showNotes.chapters.length}</strong> timestamped chapters</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Takeaways Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-[#ffffff] border border-[#e7e3dc] rounded-xl p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl text-[#1c1917]">
              Key Takeaways
            </h2>
            <button
              onClick={() => onCopyText(showNotes.key_takeaways.map((t, i) => `${i + 1}. ${t}`).join('\n'), 'Takeaways')}
              className="text-xs text-[#78716c] hover:text-[#1c1917] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </button>
          </div>

          <div className="space-y-3">
            {showNotes.key_takeaways.map((takeaway, idx) => (
              <div key={idx} className="flex items-start gap-3 text-sm text-[#38332e] leading-relaxed">
                <span className="font-mono text-xs font-semibold text-[#8c827a] pt-0.5 shrink-0 w-5">
                  0{idx + 1}.
                </span>
                <p>{takeaway}</p>
              </div>
            ))}
          </div>

          {/* Topics & Themes in clean unboxed typography */}
          <div className="pt-4 border-t border-[#f0ede6]">
            <p className="text-xs uppercase tracking-wider font-semibold text-[#8c827a] mb-2">
              Topic Breakdown
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-[#57534e]">
              <span className="font-medium text-[#1c1917]">{analysis.main_topic}</span>
              {analysis.subtopics.map((sub, i) => (
                <React.Fragment key={i}>
                  <span aria-hidden="true" className="text-[#d6d1c9]">·</span>
                  <span>{sub}</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Platform Repurposing Summary Card */}
        <div className="space-y-6">
          <div className="bg-[#ffffff] border border-[#e7e3dc] rounded-xl p-6 space-y-4">
            <h3 className="font-serif text-lg text-[#1c1917]">
              Repurposed Assets
            </h3>
            <p className="text-xs text-[#78716c] leading-relaxed">
              Explore your platform-native drafts ready for review, inline editing, and export.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => onNavigateTab('shownotes')}
                className="w-full text-left p-2.5 rounded-lg border border-[#f0ede6] hover:bg-[#faf8f5] hover:border-[#ded9d0] transition-colors flex items-center justify-between text-xs cursor-pointer"
              >
                <span className="font-medium text-[#1c1917]">Full Show Notes & Chapters</span>
                <span className="text-[#8c827a] font-mono">{showNotes.chapters.length} chapters</span>
              </button>

              <button
                onClick={() => onNavigateTab('highlights')}
                className="w-full text-left p-2.5 rounded-lg border border-[#f0ede6] hover:bg-[#faf8f5] hover:border-[#ded9d0] transition-colors flex items-center justify-between text-xs cursor-pointer"
              >
                <span className="font-medium text-[#1c1917]">Highlight Clip Opportunities</span>
                <span className="text-[#c25e36] font-medium">{moments.length} clips</span>
              </button>

              <button
                onClick={() => onNavigateTab('linkedin')}
                className="w-full text-left p-2.5 rounded-lg border border-[#f0ede6] hover:bg-[#faf8f5] hover:border-[#ded9d0] transition-colors flex items-center justify-between text-xs cursor-pointer"
              >
                <span className="font-medium text-[#1c1917]">LinkedIn Thought Post</span>
                <span className="text-[#8c827a]">Ready</span>
              </button>

              <button
                onClick={() => onNavigateTab('x')}
                className="w-full text-left p-2.5 rounded-lg border border-[#f0ede6] hover:bg-[#faf8f5] hover:border-[#ded9d0] transition-colors flex items-center justify-between text-xs cursor-pointer"
              >
                <span className="font-medium text-[#1c1917]">X / Twitter Thread</span>
                <span className="text-[#8c827a]">Ready</span>
              </button>

              <button
                onClick={() => onNavigateTab('instagram')}
                className="w-full text-left p-2.5 rounded-lg border border-[#f0ede6] hover:bg-[#faf8f5] hover:border-[#ded9d0] transition-colors flex items-center justify-between text-xs cursor-pointer"
              >
                <span className="font-medium text-[#1c1917]">Instagram Caption & Tags</span>
                <span className="text-[#8c827a]">Ready</span>
              </button>

              <button
                onClick={() => onNavigateTab('youtube')}
                className="w-full text-left p-2.5 rounded-lg border border-[#f0ede6] hover:bg-[#faf8f5] hover:border-[#ded9d0] transition-colors flex items-center justify-between text-xs cursor-pointer"
              >
                <span className="font-medium text-[#1c1917]">YouTube SEO & Titles</span>
                <span className="text-[#8c827a]">Ready</span>
              </button>
            </div>
          </div>

          {/* Featured Quote Highlight */}
          {showNotes.important_quotes.length > 0 && (
            <div className="bg-[#faf8f5] border border-[#e7e3dc] rounded-xl p-5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-[#8c827a] uppercase tracking-wider font-semibold">
                <MessageSquareQuote className="w-4 h-4 text-[#c25e36]" />
                <span>Featured Quote</span>
              </div>
              <blockquote className="font-serif italic text-base text-[#1c1917] leading-snug">
                "{showNotes.important_quotes[0].quote}"
              </blockquote>
              <p className="text-xs text-[#78716c]">
                — {showNotes.important_quotes[0].speaker || video.author}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
