import React, { useState } from 'react';
import { ArrowRight, Play, SlidersHorizontal, Sparkles, Youtube, CheckCircle2 } from 'lucide-react';

interface EpisodeInputProps {
  url: string;
  setUrl: (url: string) => void;
  customNotes: string;
  setCustomNotes: (notes: string) => void;
  onSubmit: (urlToSubmit?: string) => void;
  isLoading: boolean;
  onSelectSample: (sampleId: string) => void;
}

export const EpisodeInput: React.FC<EpisodeInputProps> = ({
  url,
  setUrl,
  customNotes,
  setCustomNotes,
  onSubmit,
  isLoading,
  onSelectSample,
}) => {
  const [showOptions, setShowOptions] = useState(false);

  const sampleItems = [
    {
      id: 'agents-deep-dive',
      title: 'AI Agents: Beyond Simple Prompting',
      channel: 'Next Frontier Tech Podcast',
      duration: '42 min',
    },
    {
      id: 'startup-mvp-playbook',
      title: 'How to Build an MVP in 2026',
      channel: 'Founders Studio',
      duration: '34 min',
    },
    {
      id: 'creator-economy-trends',
      title: 'The Creator Burnout Epidemic',
      channel: 'Creator Economy Review',
      duration: '28 min',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onSubmit();
  };

  return (
    <div className="bg-[#ffffff] border border-[#e7e3dc] rounded-xl p-6 sm:p-8 shadow-xs">
      <div className="max-w-3xl mx-auto">
        {/* Editorial Heading */}
        <div className="mb-6 text-center sm:text-left">
          <p className="text-xs uppercase tracking-widest font-semibold text-[#8c827a] mb-1.5">
            Single Episode Pipeline
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1c1917] tracking-tight mb-2">
            Turn one episode into multiple content assets.
          </h2>
          <p className="text-sm text-[#78716c] leading-relaxed">
            Extract timestamped highlights, professional show notes, thought-leadership posts, and viral threads directly from your YouTube transcript.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a8a29e]">
                <Youtube className="w-5 h-5 text-[#ef4444]" />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste YouTube URL (e.g. https://www.youtube.com/watch?v=...)"
                disabled={isLoading}
                className="w-full pl-11 pr-4 py-3 bg-[#fdfcfb] border border-[#d6d1c9] rounded-lg text-sm text-[#1c1917] placeholder:text-[#a8a29e] focus:outline-hidden focus:ring-2 focus:ring-[#242424] focus:border-transparent transition-all disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="px-6 py-3 bg-[#1c1917] hover:bg-[#2d2926] text-[#faf8f5] text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs cursor-pointer"
            >
              <span>{isLoading ? 'Analyzing...' : 'Analyze Episode'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-[#78716c] gap-2 pt-1">
            <p className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              Supported: public YouTube videos with available captions / transcripts.
            </p>

            <button
              type="button"
              onClick={() => setShowOptions(!showOptions)}
              className="text-[#78716c] hover:text-[#1c1917] transition-colors flex items-center gap-1.5 font-medium cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{showOptions ? 'Hide custom tone instructions' : 'Add custom tone / audience context'}</span>
            </button>
          </div>

          {/* Optional Tone / Context Instruction Drawer */}
          {showOptions && (
            <div className="mt-3 p-4 bg-[#faf8f5] border border-[#e7e3dc] rounded-lg space-y-2 text-left animate-fadeIn">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#78716c]">
                Custom Editorial Persona & Target Audience
              </label>
              <textarea
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="Example: Audience is B2B founders and engineering leaders. Keep LinkedIn analytical with no hype; format Twitter thread with high-tension contrasting frameworks."
                rows={2}
                className="w-full p-2.5 bg-white border border-[#ded9d0] rounded-md text-xs text-[#1c1917] placeholder:text-[#a8a29e] focus:outline-hidden focus:ring-1 focus:ring-[#1c1917]"
              />
            </div>
          )}
        </form>

        {/* Curated Sample Demos for Instant 1-Click Evaluation */}
        <div className="mt-6 pt-5 border-t border-[#f0ede6]">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-medium text-[#8c827a] tracking-wide uppercase">
              Or test with curated podcast transcripts:
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {sampleItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSample(item.id)}
                disabled={isLoading}
                className="text-left p-3 rounded-lg border border-[#e7e3dc] bg-[#faf8f5] hover:bg-[#f3efe8] hover:border-[#ded9d0] transition-all group disabled:opacity-50 cursor-pointer"
              >
                <div className="flex items-center justify-between text-[11px] text-[#78716c] mb-1">
                  <span className="truncate max-w-[130px] font-medium">{item.channel}</span>
                  <span className="text-[#a8a29e]">{item.duration}</span>
                </div>
                <p className="text-xs font-medium text-[#1c1917] line-clamp-1 group-hover:text-[#c25e36] transition-colors">
                  {item.title}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
