import React from 'react';
import { Sparkles, FileText, FolderGit2, Settings2 } from 'lucide-react';

interface HeaderProps {
  activeView: 'dashboard' | 'projects' | 'settings';
  setActiveView: (view: 'dashboard' | 'projects' | 'settings') => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  savedCount,
}) => {
  return (
    <header className="border-b border-[#e7e3dc] bg-[#faf8f5]/90 backdrop-blur-xs sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand & Editorial Identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('dashboard')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#242424] text-[#faf8f5] flex items-center justify-center font-serif text-lg font-bold shadow-xs transition-transform group-hover:scale-105">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl font-semibold tracking-tight text-[#1c1917]">
                  RepurposeAI
                </span>
                <span className="text-[10px] tracking-wider uppercase font-semibold text-[#8c827a] border border-[#ded9d0] px-1.5 py-0.5 rounded-sm">
                  Phase 1 MVP
                </span>
              </div>
              <p className="text-xs text-[#78716c] hidden sm:block">
                Create once. Reach everywhere.
              </p>
            </div>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
              activeView === 'dashboard'
                ? 'bg-[#ede8e1] text-[#1c1917]'
                : 'text-[#78716c] hover:text-[#1c1917] hover:bg-[#f3efe8]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveView('projects')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
              activeView === 'projects'
                ? 'bg-[#ede8e1] text-[#1c1917]'
                : 'text-[#78716c] hover:text-[#1c1917] hover:bg-[#f3efe8]'
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            <span>Projects</span>
            {savedCount > 0 && (
              <span className="text-[11px] font-mono bg-[#ded9d0] text-[#44403c] px-1.5 py-0.2 rounded-full">
                {savedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView('settings')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
              activeView === 'settings'
                ? 'bg-[#ede8e1] text-[#1c1917]'
                : 'text-[#78716c] hover:text-[#1c1917] hover:bg-[#f3efe8]'
            }`}
          >
            <Settings2 className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
