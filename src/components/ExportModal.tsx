import React, { useState } from 'react';
import { RepurposeResult } from '../types/index.ts';
import { Download, Copy, Check, X, FileText, FileCode } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: RepurposeResult;
  onCopyText: (text: string, label: string) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  result,
  onCopyText,
}) => {
  if (!isOpen) return null;

  const [activeFormat, setActiveFormat] = useState<'markdown' | 'txt'>('markdown');
  const [copied, setCopied] = useState(false);

  const generateMarkdown = (): string => {
    const { video, showNotes, moments, platformContent } = result;

    let md = `# ${showNotes.title}\n\n`;
    md += `*Source:* [${video.title}](${video.url})  \n`;
    md += `*Creator/Channel:* ${video.author}  \n`;
    md += `*Duration:* ${video.durationEstimate || 'N/A'}  \n`;
    md += `*Analyzed via RepurposeAI:* ${new Date(result.analyzedAt).toLocaleDateString()}\n\n`;
    md += `---\n\n`;

    md += `## 1. Episode Summary\n\n`;
    md += `### Quick Summary\n${showNotes.short_summary}\n\n`;
    md += `### Detailed Overview\n${showNotes.detailed_summary}\n\n`;

    md += `## 2. Key Takeaways\n\n`;
    showNotes.key_takeaways.forEach((t, i) => {
      md += `${i + 1}. ${t}\n`;
    });
    md += `\n`;

    md += `## 3. Timestamped Chapters\n\n`;
    showNotes.chapters.forEach((c) => {
      md += `- **${c.timestamp}** — ${c.title}\n`;
    });
    md += `\n`;

    if (showNotes.important_quotes.length > 0) {
      md += `## 4. Notable Quotes\n\n`;
      showNotes.important_quotes.forEach((q) => {
        md += `> "${q.quote}"  \n> — *${q.speaker || video.author}* ${q.context ? `(${q.context})` : ''}\n\n`;
      });
    }

    md += `## 5. Highlight Clip Opportunities (Shorts/Reels)\n\n`;
    moments.forEach((m, i) => {
      md += `### Moment #${i + 1}: ${m.title}\n`;
      md += `- **Timestamp:** ${m.timestamp}\n`;
      md += `- **Suggested 3s Hook:** "${m.hook}"\n`;
      md += `- **Why it matters:** ${m.reason}\n`;
      md += `- **Potential:** ${m.short_form_potential.toUpperCase()}\n\n`;
    });

    md += `## 6. Multi-Platform Repurposed Assets\n\n`;

    md += `### LinkedIn Post\n\n\`\`\`\n${platformContent.linkedin}\n\`\`\`\n\n`;
    md += `### X / Twitter Thread\n\n\`\`\`\n${platformContent.x}\n\`\`\`\n\n`;
    md += `### Instagram Caption\n\n\`\`\`\n${platformContent.instagram}\n\`\`\`\n\n`;

    const yt = platformContent.youtube;
    md += `### YouTube Package\n\n`;
    md += `#### Title Alternatives\n`;
    yt.title_alternatives.forEach((t, i) => {
      md += `${i + 1}. ${t}\n`;
    });
    md += `\n#### Description\n\`\`\`\n${yt.description}\n\`\`\`\n\n`;
    md += `#### Chapters (Formatted)\n\`\`\`\n${yt.chapters_formatted}\n\`\`\`\n\n`;
    md += `#### Tags\n${yt.tags.join(', ')}\n\n`;

    return md;
  };

  const generatePlainText = (): string => {
    return generateMarkdown()
      .replace(/#{1,6}\s?/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/```/g, '');
  };

  const currentExportContent = activeFormat === 'markdown' ? generateMarkdown() : generatePlainText();

  const handleDownload = () => {
    const filename = `${result.showNotes.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.${
      activeFormat === 'markdown' ? 'md' : 'txt'
    }`;
    const blob = new Blob([currentExportContent], {
      type: activeFormat === 'markdown' ? 'text/markdown;charset=utf-8' : 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    onCopyText(currentExportContent, `Full Export (${activeFormat.toUpperCase()})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 text-left">
      <div className="bg-[#ffffff] border border-[#e7e3dc] rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-6 border-b border-[#f0ede6] flex items-center justify-between">
          <div>
            <h3 className="font-serif text-2xl text-[#1c1917]">
              Export Episode Package
            </h3>
            <p className="text-xs text-[#78716c] mt-0.5">
              Download or copy your complete show notes, clip opportunities, and multi-platform copy.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8c827a] hover:text-[#1c1917] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector */}
        <div className="px-6 py-3 bg-[#faf8f5] border-b border-[#f0ede6] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFormat('markdown')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeFormat === 'markdown'
                  ? 'bg-white text-[#1c1917] shadow-xs border border-[#ded9d0]'
                  : 'text-[#78716c] hover:text-[#1c1917]'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Markdown (.md)</span>
            </button>
            <button
              onClick={() => setActiveFormat('txt')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeFormat === 'txt'
                  ? 'bg-white text-[#1c1917] shadow-xs border border-[#ded9d0]'
                  : 'text-[#78716c] hover:text-[#1c1917]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Plain Text (.txt)</span>
            </button>
          </div>

          <span className="text-xs text-[#8c827a] font-mono">
            {currentExportContent.split('\n').length} lines
          </span>
        </div>

        {/* Preview Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#fdfcfb]">
          <pre className="font-mono text-xs text-[#292524] whitespace-pre-wrap leading-relaxed select-text">
            {currentExportContent}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#f0ede6] bg-[#faf8f5] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#78716c] hover:text-[#1c1917] cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-lg border border-[#ded9d0] hover:bg-white text-xs font-medium text-[#1c1917] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#10b981]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-lg bg-[#1c1917] hover:bg-[#2d2926] text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {activeFormat.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
