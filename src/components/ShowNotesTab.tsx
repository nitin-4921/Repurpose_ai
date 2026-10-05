import React, { useState } from 'react';
import { ShowNotesData, VideoMetadata } from '../types/index.ts';
import { Check, Copy, Edit3, Save, X, Download, Clock, Quote, Sparkles } from 'lucide-react';

interface ShowNotesTabProps {
  showNotes: ShowNotesData;
  video: VideoMetadata;
  onUpdateShowNotes: (updated: ShowNotesData) => void;
  onCopyText: (text: string, label: string) => void;
  onExport: (format: 'txt' | 'md') => void;
}

export const ShowNotesTab: React.FC<ShowNotesTabProps> = ({
  showNotes,
  video,
  onUpdateShowNotes,
  onCopyText,
  onExport,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(showNotes.title);
  const [editedShortSummary, setEditedShortSummary] = useState(showNotes.short_summary);
  const [editedDetailedSummary, setEditedDetailedSummary] = useState(showNotes.detailed_summary);
  const [editedTakeawaysText, setEditedTakeawaysText] = useState(
    showNotes.key_takeaways.join('\n')
  );

  const handleSave = () => {
    onUpdateShowNotes({
      ...showNotes,
      title: editedTitle,
      short_summary: editedShortSummary,
      detailed_summary: editedDetailedSummary,
      key_takeaways: editedTakeawaysText
        .split('\n')
        .map((t) => t.trim())
        .filter((t) => t.length > 0),
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(showNotes.title);
    setEditedShortSummary(showNotes.short_summary);
    setEditedDetailedSummary(showNotes.detailed_summary);
    setEditedTakeawaysText(showNotes.key_takeaways.join('\n'));
    setIsEditing(false);
  };

  const getFullShowNotesText = () => {
    let text = `# ${showNotes.title}\n\n`;
    text += `Host/Channel: ${video.author}\n`;
    text += `Duration: ${video.durationEstimate || 'N/A'}\n\n`;
    text += `## Short Summary\n${showNotes.short_summary}\n\n`;
    text += `## Detailed Summary\n${showNotes.detailed_summary}\n\n`;
    text += `## Key Takeaways\n`;
    showNotes.key_takeaways.forEach((t, i) => {
      text += `${i + 1}. ${t}\n`;
    });
    text += `\n## Chapters & Timestamps\n`;
    showNotes.chapters.forEach((c) => {
      text += `${c.timestamp} - ${c.title}\n`;
    });
    if (showNotes.important_quotes.length > 0) {
      text += `\n## Important Quotes\n`;
      showNotes.important_quotes.forEach((q) => {
        text += `> "${q.quote}" — ${q.speaker || 'Speaker'}\n\n`;
      });
    }
    return text;
  };

  return (
    <div className="space-y-6 animate-fadeIn text-left">
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#ffffff] border border-[#e7e3dc] rounded-xl p-4">
        <div>
          <h2 className="font-serif text-lg text-[#1c1917]">
            Comprehensive Episode Show Notes
          </h2>
          <p className="text-xs text-[#78716c]">
            Editorial recap, timestamped chapters, and key quotes ready for your website or newsletter.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
                onClick={() => onCopyText(getFullShowNotesText(), 'Full Show Notes')}
                className="px-3 py-1.5 rounded-lg border border-[#ded9d0] hover:bg-[#faf8f5] text-xs font-medium text-[#1c1917] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy All</span>
              </button>

              <button
                onClick={() => onExport('md')}
                className="px-3 py-1.5 rounded-lg bg-[#1c1917] hover:bg-[#2d2926] text-xs font-medium text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Markdown</span>
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
                onClick={handleSave}
                className="px-3.5 py-1.5 rounded-lg bg-[#10b981] hover:bg-[#059669] text-xs font-medium text-white transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Show Notes Content Card */}
      <div className="bg-[#ffffff] border border-[#e7e3dc] rounded-xl p-6 sm:p-8 space-y-8">
        {/* Title Section */}
        <section className="space-y-2 border-b border-[#f0ede6] pb-6">
          <label className="text-[11px] font-semibold tracking-wider uppercase text-[#8c827a]">
            Episode Title
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full p-2.5 border border-[#ded9d0] rounded-lg font-serif text-2xl text-[#1c1917] focus:ring-1 focus:ring-[#1c1917]"
            />
          ) : (
            <h1 className="font-serif text-2xl sm:text-3xl text-[#1c1917] leading-tight">
              {showNotes.title}
            </h1>
          )}
        </section>

        {/* Short Summary */}
        <section className="space-y-2 border-b border-[#f0ede6] pb-6">
          <label className="text-[11px] font-semibold tracking-wider uppercase text-[#8c827a]">
            Short Summary
          </label>
          {isEditing ? (
            <textarea
              value={editedShortSummary}
              onChange={(e) => setEditedShortSummary(e.target.value)}
              rows={3}
              className="w-full p-2.5 border border-[#ded9d0] rounded-lg text-sm text-[#1c1917] focus:ring-1 focus:ring-[#1c1917]"
            />
          ) : (
            <p className="text-sm text-[#38332e] leading-relaxed">
              {showNotes.short_summary}
            </p>
          )}
        </section>

        {/* Detailed Summary */}
        <section className="space-y-2 border-b border-[#f0ede6] pb-6">
          <label className="text-[11px] font-semibold tracking-wider uppercase text-[#8c827a]">
            Detailed Summary
          </label>
          {isEditing ? (
            <textarea
              value={editedDetailedSummary}
              onChange={(e) => setEditedDetailedSummary(e.target.value)}
              rows={6}
              className="w-full p-2.5 border border-[#ded9d0] rounded-lg text-sm text-[#1c1917] focus:ring-1 focus:ring-[#1c1917]"
            />
          ) : (
            <div className="text-sm text-[#38332e] leading-relaxed whitespace-pre-line">
              {showNotes.detailed_summary}
            </div>
          )}
        </section>

        {/* Key Takeaways */}
        <section className="space-y-3 border-b border-[#f0ede6] pb-6">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold tracking-wider uppercase text-[#8c827a]">
              Key Takeaways
            </label>
            {!isEditing && (
              <button
                onClick={() =>
                  onCopyText(showNotes.key_takeaways.map((t, i) => `${i + 1}. ${t}`).join('\n'), 'Takeaways')
                }
                className="text-xs text-[#78716c] hover:text-[#1c1917] flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>Copy Takeaways</span>
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-1">
              <p className="text-xs text-[#a8a29e]">One takeaway per line:</p>
              <textarea
                value={editedTakeawaysText}
                onChange={(e) => setEditedTakeawaysText(e.target.value)}
                rows={5}
                className="w-full p-2.5 border border-[#ded9d0] rounded-lg text-sm text-[#1c1917] focus:ring-1 focus:ring-[#1c1917]"
              />
            </div>
          ) : (
            <ol className="space-y-2.5 text-sm text-[#38332e]">
              {showNotes.key_takeaways.map((takeaway, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="font-mono text-xs font-semibold text-[#8c827a] pt-0.5 shrink-0">
                    {idx + 1}.
                  </span>
                  <span>{takeaway}</span>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* Chapters */}
        <section className="space-y-3 border-b border-[#f0ede6] pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#8c827a]" />
              <label className="text-[11px] font-semibold tracking-wider uppercase text-[#8c827a]">
                Chapters & Timestamps
              </label>
            </div>
            <button
              onClick={() =>
                onCopyText(showNotes.chapters.map((c) => `${c.timestamp} - ${c.title}`).join('\n'), 'Chapters')
              }
              className="text-xs text-[#78716c] hover:text-[#1c1917] flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              <span>Copy Chapters</span>
            </button>
          </div>

          <div className="divide-y divide-[#f0ede6] border border-[#f0ede6] rounded-lg overflow-hidden bg-[#faf8f5]/50">
            {showNotes.chapters.map((chapter, idx) => (
              <div
                key={idx}
                className="p-3 sm:px-4 flex items-center justify-between text-xs sm:text-sm hover:bg-[#faf8f5] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-medium text-[#c25e36] bg-[#fbf5f0] border border-[#f3e7dc] px-2 py-0.5 rounded-sm text-xs">
                    {chapter.timestamp}
                  </span>
                  <span className="text-[#1c1917] font-medium">{chapter.title}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Important Quotes */}
        {showNotes.important_quotes.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Quote className="w-4 h-4 text-[#8c827a]" />
                <label className="text-[11px] font-semibold tracking-wider uppercase text-[#8c827a]">
                  Important Quotes
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {showNotes.important_quotes.map((q, idx) => (
                <div
                  key={idx}
                  className="bg-[#faf8f5] border border-[#e7e3dc] rounded-lg p-4 space-y-2 relative group"
                >
                  <blockquote className="font-serif italic text-sm text-[#1c1917] leading-relaxed">
                    "{q.quote}"
                  </blockquote>
                  <div className="flex items-center justify-between text-xs text-[#78716c] pt-1">
                    <span>— {q.speaker || video.author}</span>
                    <button
                      onClick={() => onCopyText(`"${q.quote}" — ${q.speaker || video.author}`, 'Quote')}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[#8c827a] hover:text-[#1c1917] cursor-pointer"
                      title="Copy Quote"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {q.context && (
                    <p className="text-[11px] text-[#a8a29e] italic border-t border-[#ede8e1] pt-1.5">
                      Context: {q.context}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
