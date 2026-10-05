import React, { useState } from 'react';
import { Moment } from '../types/index.ts';
import { Sparkles, Copy, Clock, Film, Edit3, Check, Info, Flame } from 'lucide-react';

interface HighlightsTabProps {
  moments: Moment[];
  onUpdateMoments: (updated: Moment[]) => void;
  onCopyText: (text: string, label: string) => void;
}

export const HighlightsTab: React.FC<HighlightsTabProps> = ({
  moments,
  onUpdateMoments,
  onCopyText,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Moment | null>(null);

  const startEdit = (moment: Moment) => {
    setEditingId(moment.id);
    setEditForm({ ...moment });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEdit = () => {
    if (!editForm) return;
    const updated = moments.map((m) => (m.id === editForm.id ? editForm : m));
    onUpdateMoments(updated);
    setEditingId(null);
    setEditForm(null);
  };

  const copyMomentPitch = (moment: Moment, idx: number) => {
    const text = `Moment #${idx + 1}: ${moment.title}
Timestamp: ${moment.timestamp}
Hook: "${moment.hook}"
Why it matters: ${moment.reason}
Potential: ${moment.short_form_potential.toUpperCase()} (Short / Reel opportunity)`;
    onCopyText(text, `Moment #${idx + 1}`);
  };

  return (
    <div className="space-y-6 animate-fadeIn text-left">
      {/* Editorial Header & Phase 1 Scope Clarification */}
      <div className="bg-[#ffffff] border border-[#e7e3dc] rounded-xl p-6 sm:p-7">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#c25e36] flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                Short-Form Clip Opportunities
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#1c1917] tracking-tight">
              Highlight Moments & Viral Hooks
            </h2>
            <p className="text-xs sm:text-sm text-[#78716c] mt-1 max-w-2xl leading-relaxed">
              Gemini analyzed the episode transcript to discover peak engagement segments, conversation turning points, and high-retention audio hooks for Shorts, Reels, and TikToks.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                const allPitches = moments
                  .map(
                    (m, i) =>
                      `MOMENT #${i + 1}: ${m.title}\nTimestamp: ${m.timestamp}\nHook: "${m.hook}"\nReason: ${m.reason}\nPotential: ${m.short_form_potential}\n`
                  )
                  .join('\n---\n\n');
                onCopyText(allPitches, 'All Highlight Moments');
              }}
              className="px-3.5 py-2 rounded-lg border border-[#ded9d0] hover:bg-[#faf8f5] text-xs font-medium text-[#1c1917] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy All Moments</span>
            </button>
          </div>
        </div>

        {/* Phase 1 MVP Scope Notice */}
        <div className="mt-4 pt-4 border-t border-[#f0ede6] flex items-center gap-2 text-xs text-[#8c827a]">
          <Info className="w-4 h-4 text-[#8c827a] shrink-0" />
          <span>
            <strong>Phase 1 Scope:</strong> Identifying editorial clip opportunities and timestamp boundaries. (Automated video rendering/clipping is planned for Phase 2).
          </span>
        </div>
      </div>

      {/* Moments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {moments.map((moment, idx) => {
          const isCurrentlyEditing = editingId === moment.id;

          return (
            <div
              key={moment.id || idx}
              className="bg-[#ffffff] border border-[#e7e3dc] rounded-xl p-5 sm:p-6 space-y-4 hover:border-[#ded9d0] transition-all shadow-xs relative"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-[#f0ede6] pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-[#8c827a]">
                    Moment #{idx + 1}
                  </span>
                  <span className="text-[#ded9d0]">·</span>
                  <div className="flex items-center gap-1 text-xs font-mono font-medium text-[#c25e36]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{moment.timestamp}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Clean unboxed potential indicator */}
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-wider ${
                      moment.short_form_potential === 'high'
                        ? 'text-[#10b981]'
                        : moment.short_form_potential === 'medium'
                        ? 'text-[#f59e0b]'
                        : 'text-[#6366f1]'
                    }`}
                  >
                    {moment.short_form_potential} potential
                  </span>

                  {!isCurrentlyEditing && (
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => startEdit(moment)}
                        className="p-1.5 text-[#8c827a] hover:text-[#1c1917] hover:bg-[#faf8f5] rounded-md transition-colors cursor-pointer"
                        title="Edit Moment"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => copyMomentPitch(moment, idx)}
                        className="p-1.5 text-[#8c827a] hover:text-[#1c1917] hover:bg-[#faf8f5] rounded-md transition-colors cursor-pointer"
                        title="Copy Moment Pitch"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {isCurrentlyEditing && editForm ? (
                /* Inline Edit Mode */
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8c827a]">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full p-2 border border-[#ded9d0] rounded-md text-sm text-[#1c1917]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8c827a]">
                      Timestamp Range
                    </label>
                    <input
                      type="text"
                      value={editForm.timestamp}
                      onChange={(e) => setEditForm({ ...editForm, timestamp: e.target.value })}
                      className="w-full p-2 border border-[#ded9d0] rounded-md text-xs font-mono text-[#1c1917]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8c827a]">
                      Suggested Hook
                    </label>
                    <textarea
                      value={editForm.hook}
                      onChange={(e) => setEditForm({ ...editForm, hook: e.target.value })}
                      rows={2}
                      className="w-full p-2 border border-[#ded9d0] rounded-md text-xs text-[#1c1917]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8c827a]">
                      Why it matters
                    </label>
                    <textarea
                      value={editForm.reason}
                      onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                      rows={2}
                      className="w-full p-2 border border-[#ded9d0] rounded-md text-xs text-[#1c1917]"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={cancelEdit}
                      className="px-2.5 py-1 text-xs text-[#78716c] hover:text-[#1c1917] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveEdit}
                      className="px-3 py-1 bg-[#10b981] hover:bg-[#059669] text-white text-xs font-medium rounded-md cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                /* Display Mode */
                <div className="space-y-3.5">
                  <h3 className="font-serif text-lg text-[#1c1917] leading-snug">
                    {moment.title}
                  </h3>

                  {/* Suggested Hook Box */}
                  <div className="bg-[#faf8f5] border border-[#e7e3dc] rounded-lg p-3.5 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold tracking-wider uppercase text-[#8c827a]">
                      <span>Suggested Hook (First 3s)</span>
                      <button
                        onClick={() => onCopyText(moment.hook, 'Suggested Hook')}
                        className="text-[#8c827a] hover:text-[#1c1917] cursor-pointer"
                        title="Copy hook only"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="font-serif italic text-sm text-[#1c1917] leading-relaxed">
                      "{moment.hook}"
                    </p>
                  </div>

                  {/* Why it matters */}
                  <div>
                    <p className="text-[11px] uppercase tracking-wider font-semibold text-[#8c827a] mb-1">
                      Why It Matters / Viral Angle
                    </p>
                    <p className="text-xs text-[#44403c] leading-relaxed">
                      {moment.reason}
                    </p>
                  </div>

                  {moment.description && (
                    <div className="pt-2 border-t border-[#f0ede6] text-xs text-[#78716c]">
                      <span>{moment.description}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-[#f0ede6] flex items-center justify-between text-xs text-[#8c827a]">
                    <span className="flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-[#8c827a]" />
                      Format: 9:16 Short / Reel
                    </span>
                    <button
                      onClick={() => copyMomentPitch(moment, idx)}
                      className="text-[#1c1917] hover:underline font-medium cursor-pointer"
                    >
                      Copy clip brief →
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
