import React, { useState } from 'react';
import { PlatformContent, YouTubeRepurposed, RepurposeResult } from '../types/index.ts';
import {
  Copy,
  Edit3,
  RotateCcw,
  Save,
  X,
  Share2,
  Sparkles,
  Check,
  Hash,
  ListOrdered,
  FileText,
  Sliders,
  Send,
} from 'lucide-react';

interface PlatformViewProps {
  platform: 'linkedin' | 'x' | 'instagram' | 'youtube';
  result: RepurposeResult;
  onUpdateContent: (platform: 'linkedin' | 'x' | 'instagram' | 'youtube', newContent: any) => void;
  onCopyText: (text: string, label: string) => void;
  onRegenerate: (
    platform: 'linkedin' | 'x' | 'instagram' | 'youtube',
    customInstruction?: string
  ) => Promise<void>;
  isRegenerating: boolean;
}

export const PlatformView: React.FC<PlatformViewProps> = ({
  platform,
  result,
  onUpdateContent,
  onCopyText,
  onRegenerate,
  isRegenerating,
}) => {
  const { platformContent, showNotes, moments } = result;

  const [isEditing, setIsEditing] = useState(false);
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [customRegenPrompt, setCustomRegenPrompt] = useState('');

  // Editable states for text platforms (LinkedIn, X, Instagram)
  const currentTextContent =
    platform === 'youtube' ? '' : (platformContent[platform] as string);
  const [editedText, setEditedText] = useState(currentTextContent);

  // Editable states for YouTube package
  const yt = platformContent.youtube || {
    title_alternatives: [],
    description: '',
    chapters_formatted: '',
    key_points: [],
    tags: [],
  };
  const [editedYtTitles, setEditedYtTitles] = useState(yt.title_alternatives.join('\n'));
  const [editedYtDesc, setEditedYtDesc] = useState(yt.description);
  const [editedYtChapters, setEditedYtChapters] = useState(yt.chapters_formatted);
  const [editedYtKeyPoints, setEditedYtKeyPoints] = useState(yt.key_points.join('\n'));
  const [editedYtTags, setEditedYtTags] = useState(yt.tags.join(', '));

  const platformMeta = {
    linkedin: {
      name: 'LinkedIn',
      badge: 'Thought Leadership Post',
      description:
        'Engineered for high engagement, professional storytelling, clean line breaks, and industry reach.',
      charCountNotice: 'Recommended: 1,200 – 2,000 characters for high algorithm dwell-time.',
    },
    x: {
      name: 'X (Twitter)',
      badge: 'Viral Thread & Post',
      description:
        'Formatted as high-signal numbered tweets with an irresistible hook and rapid conceptual payoff.',
      charCountNotice: 'Each tweet is optimized to fit within 280 characters with high viral tension.',
    },
    instagram: {
      name: 'Instagram',
      badge: 'Editorial Carousel / Reel Caption',
      description:
        'Hook-first conversational caption formatted with spacing, takeaway bullet points, and strategic hashtag bank.',
      charCountNotice: 'Includes CTA to save/share and relevant hashtags.',
    },
    youtube: {
      name: 'YouTube',
      badge: 'Metadata & SEO Package',
      description:
        'High-converting title variations, search-optimized description, timestamped chapters, and tags.',
      charCountNotice: 'Ready to paste into YouTube Studio description and tags fields.',
    },
  }[platform];

  const handleSaveText = () => {
    onUpdateContent(platform, editedText);
    setIsEditing(false);
  };

  const handleSaveYouTube = () => {
    const updatedYt: YouTubeRepurposed = {
      title_alternatives: editedYtTitles
        .split('\n')
        .map((t) => t.trim())
        .filter(Boolean),
      description: editedYtDesc,
      chapters_formatted: editedYtChapters,
      key_points: editedYtKeyPoints
        .split('\n')
        .map((t) => t.trim())
        .filter(Boolean),
      tags: editedYtTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };
    onUpdateContent('youtube', updatedYt);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (platform === 'youtube') {
      setEditedYtTitles(yt.title_alternatives.join('\n'));
      setEditedYtDesc(yt.description);
      setEditedYtChapters(yt.chapters_formatted);
      setEditedYtKeyPoints(yt.key_points.join('\n'));
      setEditedYtTags(yt.tags.join(', '));
    } else {
      setEditedText(currentTextContent);
    }
    setIsEditing(false);
  };

  const executeRegeneration = async () => {
    await onRegenerate(platform, customRegenPrompt.trim() || undefined);
    setShowRegenModal(false);
    setCustomRegenPrompt('');
  };

  return (
    <div className="space-y-6 animate-fadeIn text-left">
      {/* Header Bar */}
      <div className="bg-[#ffffff] border border-[#e7e3dc] rounded-xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#8c827a]">
              {platformMeta.badge}
            </span>
          </div>
          <h2 className="font-serif text-2xl text-[#1c1917] tracking-tight">
            {platformMeta.name} Content Package
          </h2>
          <p className="text-xs text-[#78716c] mt-0.5">
            {platformMeta.description}
          </p>
        </div>

        {/* Global Toolbar: Edit, Copy, Regenerate */}
        <div className="flex items-center gap-2 shrink-0">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 rounded-lg border border-[#ded9d0] hover:bg-[#faf8f5] text-xs font-medium text-[#1c1917] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              <button
                onClick={() => {
                  if (platform === 'youtube') {
                    const fullYt = `TITLES:\n${yt.title_alternatives.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\nDESCRIPTION:\n${yt.description}\n\nCHAPTERS:\n${yt.chapters_formatted}\n\nTAGS:\n${yt.tags.join(', ')}`;
                    onCopyText(fullYt, 'YouTube Metadata Package');
                  } else {
                    onCopyText(currentTextContent, `${platformMeta.name} Post`);
                  }
                }}
                className="px-3 py-1.5 rounded-lg border border-[#ded9d0] hover:bg-[#faf8f5] text-xs font-medium text-[#1c1917] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy All</span>
              </button>

              <button
                onClick={() => setShowRegenModal(true)}
                disabled={isRegenerating}
                className="px-3 py-1.5 rounded-lg border border-[#ded9d0] hover:bg-[#faf8f5] text-xs font-medium text-[#c25e36] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                <span>{isRegenerating ? 'Regenerating...' : 'Regenerate'}</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 rounded-lg border border-[#ded9d0] hover:bg-[#faf8f5] text-xs font-medium text-[#78716c] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
              <button
                onClick={platform === 'youtube' ? handleSaveYouTube : handleSaveText}
                className="px-3.5 py-1.5 rounded-lg bg-[#10b981] hover:bg-[#059669] text-xs font-medium text-white transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Regeneration Modal / Drawer */}
      {showRegenModal && (
        <div className="bg-[#faf8f5] border border-[#e7e3dc] rounded-xl p-5 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#c25e36]" />
              <h3 className="font-serif text-base text-[#1c1917]">
                Regenerate {platformMeta.name} Post
              </h3>
            </div>
            <button
              onClick={() => setShowRegenModal(false)}
              className="text-[#a8a29e] hover:text-[#1c1917] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-[#78716c]">
            Optionally provide special instructions (e.g. "Focus on contrarian angle", "Shorten by 30%", "Make tone more technical"), or leave blank for a fresh creative variation.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={customRegenPrompt}
              onChange={(e) => setCustomRegenPrompt(e.target.value)}
              placeholder="e.g. Emphasize the second takeaway and use a more provocative opening hook..."
              className="flex-1 p-2.5 bg-white border border-[#ded9d0] rounded-lg text-xs text-[#1c1917] focus:ring-1 focus:ring-[#1c1917]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') executeRegeneration();
              }}
            />
            <button
              onClick={executeRegeneration}
              disabled={isRegenerating}
              className="px-4 py-2 bg-[#c25e36] hover:bg-[#a94f2d] text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>{isRegenerating ? 'Generating...' : 'Regenerate Now'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area: YouTube vs Text Platforms */}
      {platform === 'youtube' ? (
        /* YouTube Repurposed Package */
        <div className="space-y-6">
          {/* Title Variations */}
          <div className="bg-[#ffffff] border border-[#e7e3dc] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#f0ede6] pb-3">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8c827a]">
                Title Variations (3 Angles)
              </label>
              <span className="text-xs text-[#78716c]">Curiosity · Contrarian · High Benefit</span>
            </div>

            {isEditing ? (
              <div>
                <p className="text-xs text-[#a8a29e] mb-1">One title per line:</p>
                <textarea
                  value={editedYtTitles}
                  onChange={(e) => setEditedYtTitles(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 border border-[#ded9d0] rounded-lg text-sm font-medium text-[#1c1917]"
                />
              </div>
            ) : (
              <div className="space-y-2.5">
                {yt.title_alternatives.map((titleOption, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#faf8f5] border border-[#e7e3dc] rounded-lg flex items-center justify-between text-sm group hover:border-[#ded9d0] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-semibold text-[#8c827a]">
                        Angle {idx + 1}
                      </span>
                      <span className="font-medium text-[#1c1917]">{titleOption}</span>
                    </div>
                    <button
                      onClick={() => onCopyText(titleOption, `Title Option ${idx + 1}`)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-[#78716c] hover:text-[#1c1917] flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description & Key Points */}
          <div className="bg-[#ffffff] border border-[#e7e3dc] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#f0ede6] pb-3">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8c827a]">
                Optimized Video Description
              </label>
              {!isEditing && (
                <button
                  onClick={() => onCopyText(yt.description, 'YouTube Description')}
                  className="text-xs text-[#78716c] hover:text-[#1c1917] flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Description</span>
                </button>
              )}
            </div>

            {isEditing ? (
              <textarea
                value={editedYtDesc}
                onChange={(e) => setEditedYtDesc(e.target.value)}
                rows={8}
                className="w-full p-3 border border-[#ded9d0] rounded-lg text-sm text-[#1c1917] font-mono leading-relaxed"
              />
            ) : (
              <div className="p-4 bg-[#faf8f5] border border-[#e7e3dc] rounded-lg text-sm text-[#38332e] leading-relaxed whitespace-pre-line font-mono text-xs">
                {yt.description}
              </div>
            )}
          </div>

          {/* Chapters formatted for YouTube */}
          <div className="bg-[#ffffff] border border-[#e7e3dc] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#f0ede6] pb-3">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8c827a]">
                Timestamped Chapters (Paste into YouTube Description)
              </label>
              {!isEditing && (
                <button
                  onClick={() => onCopyText(yt.chapters_formatted, 'YouTube Chapters')}
                  className="text-xs text-[#78716c] hover:text-[#1c1917] flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Chapters</span>
                </button>
              )}
            </div>

            {isEditing ? (
              <textarea
                value={editedYtChapters}
                onChange={(e) => setEditedYtChapters(e.target.value)}
                rows={6}
                className="w-full p-3 border border-[#ded9d0] rounded-lg text-xs font-mono text-[#1c1917]"
              />
            ) : (
              <div className="p-4 bg-[#faf8f5] border border-[#e7e3dc] rounded-lg font-mono text-xs text-[#1c1917] whitespace-pre-line">
                {yt.chapters_formatted}
              </div>
            )}
          </div>

          {/* SEO Tags */}
          <div className="bg-[#ffffff] border border-[#e7e3dc] rounded-xl p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-[#f0ede6] pb-3">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8c827a]">
                SEO Video Tags ({yt.tags.length})
              </label>
              {!isEditing && (
                <button
                  onClick={() => onCopyText(yt.tags.join(', '), 'YouTube Tags')}
                  className="text-xs text-[#78716c] hover:text-[#1c1917] flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Comma-Separated</span>
                </button>
              )}
            </div>

            {isEditing ? (
              <input
                type="text"
                value={editedYtTags}
                onChange={(e) => setEditedYtTags(e.target.value)}
                className="w-full p-2.5 border border-[#ded9d0] rounded-lg text-xs font-mono text-[#1c1917]"
              />
            ) : (
              <div className="flex flex-wrap gap-2 pt-1">
                {yt.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="font-mono text-xs text-[#57534e] bg-[#faf8f5] border border-[#e7e3dc] px-2 py-1 rounded-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Text Platforms (LinkedIn, X / Twitter, Instagram) */
        <div className="bg-[#ffffff] border border-[#e7e3dc] rounded-xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between text-xs text-[#78716c] border-b border-[#f0ede6] pb-3">
            <span>{platformMeta.charCountNotice}</span>
            <span className="font-mono text-[#a8a29e]">
              {(isEditing ? editedText : currentTextContent).length} characters
            </span>
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                rows={16}
                className="w-full p-4 border border-[#ded9d0] rounded-lg text-sm text-[#1c1917] leading-relaxed font-sans focus:ring-1 focus:ring-[#1c1917]"
              />
            </div>
          ) : (
            <div className="p-6 bg-[#fdfcfb] border border-[#e7e3dc] rounded-lg text-sm text-[#292524] leading-relaxed whitespace-pre-line font-sans select-text">
              {currentTextContent}
            </div>
          )}

          <div className="pt-2 flex items-center justify-between text-xs text-[#8c827a]">
            <span>Grounded in episode transcript</span>
            <button
              onClick={() => onCopyText(isEditing ? editedText : currentTextContent, `${platformMeta.name} text`)}
              className="text-[#1c1917] hover:underline font-medium flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy to clipboard</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
