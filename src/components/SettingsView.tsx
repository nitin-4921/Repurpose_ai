import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Cpu, ShieldCheck, Terminal, RefreshCw, Trash2 } from 'lucide-react';

interface SettingsViewProps {
  onClearHistory: () => void;
  savedCount: number;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onClearHistory,
  savedCount,
}) => {
  const [healthStatus, setHealthStatus] = useState<{
    status: string;
    hasGeminiKey: boolean;
    timestamp?: string;
  } | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkHealth = async () => {
    setIsChecking(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setHealthStatus(data);
      } else {
        setHealthStatus({ status: 'error', hasGeminiKey: false });
      }
    } catch {
      setHealthStatus({ status: 'offline', hasGeminiKey: false });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto animate-fadeIn">
      <div className="border-b border-[#e7e3dc] pb-4">
        <h2 className="font-serif text-3xl text-[#1c1917] tracking-tight">
          System & Pipeline Settings
        </h2>
        <p className="text-xs sm:text-sm text-[#78716c] mt-1">
          Review backend engine status, grounding invariants, and Phase 1 MVP configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gemini Engine Status */}
        <div className="bg-[#ffffff] border border-[#e7e3dc] rounded-xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#f0ede6] pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#c25e36]" />
              <h3 className="font-serif text-lg text-[#1c1917]">
                AI Backend Engine
              </h3>
            </div>
            <button
              onClick={checkHealth}
              disabled={isChecking}
              className="text-xs text-[#78716c] hover:text-[#1c1917] flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              <span>Verify</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#78716c]">Model Tier</span>
              <span className="font-mono text-[#1c1917] font-medium">gemini-3.8-flash</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#78716c]">API Connection</span>
              <div className="flex items-center gap-1.5">
                {healthStatus?.hasGeminiKey ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                    <span className="text-[#10b981] font-medium">Connected & Active</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-[#f59e0b]" />
                    <span className="text-[#f59e0b] font-medium">Missing GEMINI_API_KEY</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#78716c]">SDK Implementation</span>
              <span className="font-mono text-[#1c1917]">@google/genai (Server-Side)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#78716c]">Execution Mode</span>
              <span className="text-[#1c1917]">Strict Structured JSON Schema</span>
            </div>
          </div>
        </div>

        {/* Phase 1 Constraints & Invariants */}
        <div className="bg-[#ffffff] border border-[#e7e3dc] rounded-xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-[#f0ede6] pb-3">
            <ShieldCheck className="w-4 h-4 text-[#10b981]" />
            <h3 className="font-serif text-lg text-[#1c1917]">
              Grounding & Safety Rules
            </h3>
          </div>

          <div className="space-y-2.5 text-xs text-[#57534e] leading-relaxed">
            <div className="flex items-start gap-2">
              <span className="text-[#10b981] font-bold">✓</span>
              <span><strong>Zero Hallucination:</strong> All quotes, takeaways, and timestamps must originate directly from the transcript text.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#10b981] font-bold">✓</span>
              <span><strong>Token Budget Protection:</strong> Large transcripts (&gt;120k words) are safely bounded before generation.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#10b981] font-bold">✓</span>
              <span><strong>Isolated Transcript Module:</strong> YouTube caption fetcher is decoupled and hot-swappable.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Local Workspace Data */}
      <div className="bg-[#ffffff] border border-[#e7e3dc] rounded-xl p-6 space-y-4 shadow-xs">
        <h3 className="font-serif text-lg text-[#1c1917] border-b border-[#f0ede6] pb-3">
          Local Storage & Cache
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <p className="font-medium text-[#1c1917]">
              Saved Episode Runs ({savedCount} in local cache)
            </p>
            <p className="text-[#78716c]">
              Episode analyses are preserved in your browser session for instant retrieval.
            </p>
          </div>

          {savedCount > 0 && (
            <button
              onClick={onClearHistory}
              className="px-3.5 py-2 rounded-lg border border-[#fecaca] hover:bg-[#fef2f2] text-xs font-medium text-[#ef4444] transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Saved History</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
