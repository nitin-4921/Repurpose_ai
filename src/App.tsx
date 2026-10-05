import React, { useEffect, useState } from 'react';
import {
  AnalysisData,
  AppError,
  PlatformContent,
  ProcessingStage,
  RepurposeResult,
  ShowNotesData,
  Moment,
  YouTubeRepurposed,
} from './types/index.ts';
import { Header } from './components/Header.tsx';
import { EpisodeInput } from './components/EpisodeInput.tsx';
import { LoadingStages } from './components/LoadingStages.tsx';
import { OverviewTab } from './components/OverviewTab.tsx';
import { ShowNotesTab } from './components/ShowNotesTab.tsx';
import { HighlightsTab } from './components/HighlightsTab.tsx';
import { PlatformView } from './components/PlatformView.tsx';
import { ExportModal } from './components/ExportModal.tsx';
import { ProjectsView } from './components/ProjectsView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import {
  AlertTriangle,
  RotateCcw,
  Download,
  Share2,
  Check,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

const STORAGE_KEY = 'repurpose_ai_saved_episodes';

export default function App() {
  const [activeNav, setActiveNav] = useState<'dashboard' | 'projects' | 'settings'>('dashboard');
  const [activeTab, setActiveTab] = useState<
    'overview' | 'shownotes' | 'highlights' | 'linkedin' | 'x' | 'instagram' | 'youtube'
  >('overview');

  // Input states
  const [url, setUrl] = useState('');
  const [customNotes, setCustomNotes] = useState('');

  // Processing states
  const [isLoading, setIsLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState<ProcessingStage>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pipelineError, setPipelineError] = useState<AppError | null>(null);

  // Active result state
  const [activeResult, setActiveResult] = useState<RepurposeResult | null>(null);
  const [savedEpisodes, setSavedEpisodes] = useState<RepurposeResult[]>([]);

  // Export modal
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Single platform regeneration loading state
  const [isRegeneratingPlatform, setIsRegeneratingPlatform] = useState(false);

  // Load saved episodes from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedEpisodes(parsed);
          // Set most recent as active result initially
          setActiveResult(parsed[0]);
          setUrl(parsed[0].url);
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved episodes from localStorage:', e);
    }
  }, []);

  // Save to localStorage when savedEpisodes changes
  const persistEpisodes = (episodes: RepurposeResult[]) => {
    setSavedEpisodes(episodes);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(episodes));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard!`);
  };

  // Stepped pipeline runner with realistic stage updates
  const handleAnalyze = async (urlToUse?: string) => {
    const targetUrl = (urlToUse || url).trim();
    if (!targetUrl) {
      setErrorMessage('Please enter a valid YouTube URL.');
      return;
    }

    setErrorMessage(null);
    setPipelineError(null);
    setIsLoading(true);
    setElapsedSeconds(0);
    setCurrentStage('validating');

    // Timer for elapsed seconds
    const timerInterval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    // Progressive stage transitions matching the pipeline
    const stageTimeouts: NodeJS.Timeout[] = [];
    stageTimeouts.push(
      setTimeout(() => setCurrentStage('video_identified'), 700),
      setTimeout(() => setCurrentStage('fetching_transcript'), 1600),
      setTimeout(() => setCurrentStage('understanding_content'), 3500),
      setTimeout(() => setCurrentStage('extracting_moments'), 5500),
      setTimeout(() => setCurrentStage('generating_show_notes'), 7500),
      setTimeout(() => setCurrentStage('adapting_platforms'), 9500)
    );

    try {
      const response = await fetch('/api/analyze-youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: targetUrl,
          customNotes: customNotes.trim() || undefined,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        const errObj: AppError = {
          code: json.error || 'TRANSCRIPT_RETRIEVAL_FAILED',
          message: json.message || "We couldn't retrieve the transcript. Please try again.",
        };
        setPipelineError(errObj);
        throw new Error(errObj.message);
      }

      const newResult: RepurposeResult = json.data;
      setCurrentStage('completed');
      setPipelineError(null);

      // Update active result and save to history
      setActiveResult(newResult);
      setActiveTab('overview');
      setActiveNav('dashboard');

      // Prepend to saved episodes (avoid duplicates by id/url)
      const filtered = savedEpisodes.filter((ep) => ep.url !== newResult.url);
      persistEpisodes([newResult, ...filtered]);

      showToast('Episode analysis completed successfully!');
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setCurrentStage('error');
      setErrorMessage(
        err.message || "We couldn't retrieve the transcript. Please try again."
      );
    } finally {
      clearInterval(timerInterval);
      stageTimeouts.forEach((t) => clearTimeout(t));
      setIsLoading(false);
    }
  };

  const handleSelectSample = (sampleId: string) => {
    setUrl(sampleId);
    handleAnalyze(sampleId);
  };

  // Inline updates for show notes
  const handleUpdateShowNotes = (updatedShowNotes: ShowNotesData) => {
    if (!activeResult) return;
    const updatedResult: RepurposeResult = {
      ...activeResult,
      showNotes: updatedShowNotes,
    };
    setActiveResult(updatedResult);
    const updatedList = savedEpisodes.map((ep) =>
      ep.id === activeResult.id ? updatedResult : ep
    );
    persistEpisodes(updatedList);
    showToast('Show notes updated.');
  };

  // Inline updates for moments
  const handleUpdateMoments = (updatedMoments: Moment[]) => {
    if (!activeResult) return;
    const updatedResult: RepurposeResult = {
      ...activeResult,
      moments: updatedMoments,
    };
    setActiveResult(updatedResult);
    const updatedList = savedEpisodes.map((ep) =>
      ep.id === activeResult.id ? updatedResult : ep
    );
    persistEpisodes(updatedList);
    showToast('Highlight moments updated.');
  };

  // Inline updates for platform content
  const handleUpdatePlatformContent = (
    platform: 'linkedin' | 'x' | 'instagram' | 'youtube',
    newContent: any
  ) => {
    if (!activeResult) return;
    const updatedPlatformContent = {
      ...activeResult.platformContent,
      [platform]: newContent,
    };
    const updatedResult: RepurposeResult = {
      ...activeResult,
      platformContent: updatedPlatformContent,
    };
    setActiveResult(updatedResult);
    const updatedList = savedEpisodes.map((ep) =>
      ep.id === activeResult.id ? updatedResult : ep
    );
    persistEpisodes(updatedList);
    showToast(`${platform.toUpperCase()} content updated.`);
  };

  // Single platform regeneration handler
  const handleRegeneratePlatform = async (
    platform: 'linkedin' | 'x' | 'instagram' | 'youtube',
    customInstruction?: string
  ) => {
    if (!activeResult) return;
    setIsRegeneratingPlatform(true);

    try {
      const response = await fetch('/api/regenerate-platform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          videoTitle: activeResult.showNotes.title,
          summary: activeResult.showNotes.short_summary,
          keyTakeaways: activeResult.showNotes.key_takeaways,
          moments: activeResult.moments.map((m) => ({
            title: m.title,
            hook: m.hook,
            timestamp: m.timestamp,
          })),
          customInstruction,
          currentContent: activeResult.platformContent[platform],
        }),
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || `Failed to regenerate ${platform} content.`);
      }

      handleUpdatePlatformContent(platform, json.data.content);
      showToast(`Regenerated ${platform.toUpperCase()} with fresh copy!`);
    } catch (err: any) {
      console.error('Regeneration error:', err);
      showToast(`Error: ${err.message || 'Failed to regenerate'}`);
    } finally {
      setIsRegeneratingPlatform(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your saved episode history?')) {
      persistEpisodes([]);
      setActiveResult(null);
      setUrl('');
      showToast('Workspace history cleared.');
    }
  };

  const handleDeleteEpisode = (id: string) => {
    const updated = savedEpisodes.filter((ep) => ep.id !== id);
    persistEpisodes(updated);
    if (activeResult?.id === id) {
      setActiveResult(updated[0] || null);
    }
    showToast('Episode removed from workspace.');
  };

  interface TabItem {
    key: 'overview' | 'shownotes' | 'highlights' | 'linkedin' | 'x' | 'instagram' | 'youtube';
    label: string;
    badge?: number;
  }

  const tabs: TabItem[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'shownotes', label: 'Show Notes' },
    { key: 'highlights', label: 'Highlights', badge: activeResult?.moments.length },
    { key: 'linkedin', label: 'LinkedIn' },
    { key: 'x', label: 'X (Twitter)' },
    { key: 'instagram', label: 'Instagram' },
    { key: 'youtube', label: 'YouTube' },
  ];

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#242424] flex flex-col font-sans selection:bg-[#ede8e1]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#1c1917] text-[#faf8f5] text-xs font-medium px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 animate-fadeIn border border-white/10">
          <Check className="w-3.5 h-3.5 text-[#10b981]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Primary Header */}
      <Header
        activeView={activeNav}
        setActiveView={setActiveNav}
        savedCount={savedEpisodes.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeNav === 'projects' && (
          <ProjectsView
            savedEpisodes={savedEpisodes}
            onLoadEpisode={(ep) => {
              setActiveResult(ep);
              setUrl(ep.url);
              setActiveNav('dashboard');
              setActiveTab('overview');
            }}
            onDeleteEpisode={handleDeleteEpisode}
            onNewEpisode={() => {
              setActiveResult(null);
              setUrl('');
              setActiveNav('dashboard');
            }}
          />
        )}

        {activeNav === 'settings' && (
          <SettingsView
            savedCount={savedEpisodes.length}
            onClearHistory={handleClearHistory}
          />
        )}

        {activeNav === 'dashboard' && (
          <div className="space-y-8">
            {/* Input Section (Always prominent or collapsible if result active) */}
            <EpisodeInput
              url={url}
              setUrl={setUrl}
              customNotes={customNotes}
              setCustomNotes={setCustomNotes}
              onSubmit={handleAnalyze}
              isLoading={isLoading}
              onSelectSample={handleSelectSample}
            />

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="bg-[#fef2f2] border border-[#fecaca] rounded-xl p-4 flex items-start gap-3 text-left animate-fadeIn">
                <AlertTriangle className="w-5 h-5 text-[#ef4444] shrink-0 mt-0.5" />
                <div className="flex-1 text-xs">
                  <p className="font-semibold text-[#991b1b]">Unable to complete analysis</p>
                  <p className="text-[#b91c1c] mt-0.5 leading-relaxed">{errorMessage}</p>
                </div>
                <button
                  onClick={() => setErrorMessage(null)}
                  className="text-xs text-[#991b1b] hover:underline cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Stepped Loading Experience (Section 9) */}
            {isLoading && (
              <LoadingStages
                currentStage={currentStage}
                elapsedSeconds={elapsedSeconds}
              />
            )}

            {/* Results Dashboard (Sections 10 - 16) */}
            {!isLoading && activeResult && (
              <div className="space-y-6">
                {/* Editorial Subheader & Segmented Navigation */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e7e3dc] pb-3">
                  {/* Segmented Tab Controls (Zero-pill discipline: quiet functional buttons) */}
                  <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
                    {tabs.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer ${
                          activeTab === tab.key
                            ? 'bg-[#1c1917] text-[#ffffff] shadow-xs'
                            : 'text-[#78716c] hover:text-[#1c1917] hover:bg-[#ede8e1]'
                        }`}
                      >
                        <span>{tab.label}</span>
                        {tab.badge !== undefined && (
                          <span
                            className={`text-[10px] font-mono px-1 rounded-sm ${
                              activeTab === tab.key
                                ? 'bg-[#38332e] text-[#faf8f5]'
                                : 'bg-[#ded9d0] text-[#57534e]'
                            }`}
                          >
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Quick Export CTA */}
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      onClick={() => setIsExportOpen(true)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#ffffff] hover:bg-[#faf8f5] border border-[#ded9d0] text-xs font-medium text-[#1c1917] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5 text-[#8c827a]" />
                      <span>Export All Assets</span>
                    </button>
                  </div>
                </div>

                {/* Tab Views */}
                {activeTab === 'overview' && (
                  <OverviewTab
                    result={activeResult}
                    onNavigateTab={(tab) => setActiveTab(tab)}
                    onCopyText={handleCopyText}
                  />
                )}

                {activeTab === 'shownotes' && (
                  <ShowNotesTab
                    showNotes={activeResult.showNotes}
                    video={activeResult.video}
                    onUpdateShowNotes={handleUpdateShowNotes}
                    onCopyText={handleCopyText}
                    onExport={(fmt) => setIsExportOpen(true)}
                  />
                )}

                {activeTab === 'highlights' && (
                  <HighlightsTab
                    moments={activeResult.moments}
                    onUpdateMoments={handleUpdateMoments}
                    onCopyText={handleCopyText}
                  />
                )}

                {activeTab === 'linkedin' && (
                  <PlatformView
                    platform="linkedin"
                    result={activeResult}
                    onUpdateContent={handleUpdatePlatformContent}
                    onCopyText={handleCopyText}
                    onRegenerate={handleRegeneratePlatform}
                    isRegenerating={isRegeneratingPlatform}
                  />
                )}

                {activeTab === 'x' && (
                  <PlatformView
                    platform="x"
                    result={activeResult}
                    onUpdateContent={handleUpdatePlatformContent}
                    onCopyText={handleCopyText}
                    onRegenerate={handleRegeneratePlatform}
                    isRegenerating={isRegeneratingPlatform}
                  />
                )}

                {activeTab === 'instagram' && (
                  <PlatformView
                    platform="instagram"
                    result={activeResult}
                    onUpdateContent={handleUpdatePlatformContent}
                    onCopyText={handleCopyText}
                    onRegenerate={handleRegeneratePlatform}
                    isRegenerating={isRegeneratingPlatform}
                  />
                )}

                {activeTab === 'youtube' && (
                  <PlatformView
                    platform="youtube"
                    result={activeResult}
                    onUpdateContent={handleUpdatePlatformContent}
                    onCopyText={handleCopyText}
                    onRegenerate={handleRegeneratePlatform}
                    isRegenerating={isRegeneratingPlatform}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Export Modal */}
      {activeResult && (
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          result={activeResult}
          onCopyText={handleCopyText}
        />
      )}

      {/* Editorial Footer */}
      <footer className="border-t border-[#e7e3dc] py-6 text-xs text-[#8c827a] mt-12 bg-[#faf8f5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-serif font-semibold text-[#1c1917]">RepurposeAI</span>
            <span aria-hidden="true">·</span>
            <span>One Episode → Understand → Extract Moments → Repurpose → Adapt → Review</span>
          </div>

          <div className="flex items-center gap-4 text-[#78716c]">
            <span>Phase 1 MVP</span>
            <span aria-hidden="true">·</span>
            <span>Gemini 3.8 Flash</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
