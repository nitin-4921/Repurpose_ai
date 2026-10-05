import React from 'react';
import { RepurposeResult } from '../types/index.ts';
import { FolderGit2, Trash2, ArrowRight, Clock, Flame, Layers } from 'lucide-react';

interface ProjectsViewProps {
  savedEpisodes: RepurposeResult[];
  onLoadEpisode: (episode: RepurposeResult) => void;
  onDeleteEpisode: (id: string) => void;
  onNewEpisode: () => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  savedEpisodes,
  onLoadEpisode,
  onDeleteEpisode,
  onNewEpisode,
}) => {
  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto animate-fadeIn">
      <div className="flex items-center justify-between border-b border-[#e7e3dc] pb-4">
        <div>
          <h2 className="font-serif text-3xl text-[#1c1917] tracking-tight">
            Episode Workspace
          </h2>
          <p className="text-xs sm:text-sm text-[#78716c] mt-1">
            Access and manage previously analyzed podcast and video episodes.
          </p>
        </div>

        <button
          onClick={onNewEpisode}
          className="px-4 py-2 bg-[#1c1917] hover:bg-[#2d2926] text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <span>Analyze New Episode</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {savedEpisodes.length === 0 ? (
        <div className="bg-[#ffffff] border border-[#e7e3dc] rounded-xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#faf8f5] border border-[#ded9d0] flex items-center justify-center mx-auto text-[#8c827a]">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-xl text-[#1c1917]">No Saved Episodes Yet</h3>
            <p className="text-xs text-[#78716c] mt-1 max-w-sm mx-auto leading-relaxed">
              When you analyze YouTube podcasts or videos, your generated assets, show notes, and moments will automatically appear here.
            </p>
          </div>
          <button
            onClick={onNewEpisode}
            className="px-4 py-2 bg-[#1c1917] hover:bg-[#2d2926] text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            Start Your First Analysis
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {savedEpisodes.map((ep) => (
            <div
              key={ep.id}
              className="bg-[#ffffff] border border-[#e7e3dc] rounded-xl p-5 hover:border-[#ded9d0] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-[#78716c]">
                  <span className="font-medium text-[#1c1917]">{ep.video.author}</span>
                  <span aria-hidden="true">·</span>
                  <span>{new Date(ep.analyzedAt).toLocaleDateString()}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-[#8c827a]">{ep.video.durationEstimate || 'Episode'}</span>
                </div>

                <h3 className="font-serif text-lg text-[#1c1917] truncate group-hover:text-[#c25e36] transition-colors">
                  {ep.showNotes.title || ep.video.title}
                </h3>

                <div className="flex items-center gap-3 text-xs text-[#8c827a] pt-1">
                  <span className="flex items-center gap-1 text-[#c25e36]">
                    <Flame className="w-3.5 h-3.5" />
                    {ep.moments.length} clips
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-[#10b981]">
                    <Layers className="w-3.5 h-3.5" />
                    4 platforms
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                <button
                  onClick={() => onDeleteEpisode(ep.id)}
                  className="p-2 text-[#a8a29e] hover:text-[#ef4444] hover:bg-[#faf8f5] rounded-lg transition-colors cursor-pointer"
                  title="Delete from workspace"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onLoadEpisode(ep)}
                  className="px-3.5 py-1.5 bg-[#faf8f5] hover:bg-[#ede8e1] border border-[#ded9d0] text-xs font-medium text-[#1c1917] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Assets</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
