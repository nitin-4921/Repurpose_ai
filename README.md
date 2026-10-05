# RepurposeAI
### Show-Notes & Multi-Platform Repurposing Agent (Phase 1 MVP)

> **One Episode → Understand → Extract Moments → Repurpose → Adapt → Review**

RepurposeAI takes a single long-form YouTube podcast or video URL, extracts its transcript and metadata, analyzes the spoken content using Google Gemini, extracts highlight moments and viral clip opportunities with timestamp boundaries, and generates tailored multi-platform copy (LinkedIn, X/Twitter, Instagram, YouTube) and comprehensive show notes.

---

## 1. System Architecture

```text
┌────────────────────────────────────────────────────────┐
│                   React + Vite Frontend                │
│  - Editorial Workspace UI (Zero AI-Slop Design)        │
│  - Segmented Dashboard ([Show Notes], [Moments], etc.) │
│  - Inline Editing & Instant Clipboard Copy             │
│  - Multi-Format Export (Markdown & Plain Text)         │
└───────────────────────────▲────────────────────────────┘
                            │ HTTP POST /api/analyze-youtube
                            │ HTTP POST /api/regenerate-platform
┌───────────────────────────▼────────────────────────────┐
│                    Express Full-Stack API              │
│               (server.ts / server/routes/)             │
└─────────────┬───────────────────────────┬──────────────┘
              │                           │
              ▼                           ▼
┌───────────────────────────┐ ┌───────────────────────────┐
│ YouTube Transcript Engine │ │      Gemini 3.8 Flash     │
│ (Isolated Backend Service)│ │  - Structured JSON Output │
│ - Canonical ID Extraction │ │  - Grounding Invariants   │
│ - Timed-Text XML Parser   │ │  - Moment & Hook Engine   │
│ - oEmbed Metadata Fetcher │ │  - Platform Adaptations   │
│ - Timestamp Windowing     │ │  - Single-Asset Regen     │
└───────────────────────────┘ └───────────────────────────┘
```

---

## 2. Directory Structure

```text
├── index.html                      # HTML entry with editorial typography
├── metadata.json                   # App capabilities & metadata
├── package.json                    # Project dependencies and full-stack scripts
├── server.ts                       # Express server mounting Vite in dev mode
├── server/
│   ├── routes/
│   │   └── analyze.ts              # API endpoints (/api/analyze-youtube, /api/regenerate-platform)
│   ├── services/
│   │   ├── youtubeTranscript.ts    # Decoupled YouTube metadata & transcript extraction service
│   │   ├── gemini.ts               # Server-side @google/genai SDK integration
│   │   ├── repurposing.ts          # Core orchestration pipeline
│   │   └── sampleTranscripts.ts    # Curated podcast fallback transcripts for instant testing
│   └── prompts/
│       └── repurposePrompt.ts      # Grounded prompts with strict JSON schemas
├── src/
│   ├── components/
│   │   ├── Header.tsx              # Brand identity and main view switcher
│   │   ├── EpisodeInput.tsx        # URL input, sample clickers, custom persona options
│   │   ├── LoadingStages.tsx       # Multi-stage progressive loader
│   │   ├── OverviewTab.tsx         # High-level metrics, summary, takeaways, topic map
│   │   ├── ShowNotesTab.tsx        # Full show notes, chapters, quotes with inline edit
│   │   ├── HighlightsTab.tsx       # Clip opportunities with timestamps and 3s hooks
│   │   ├── PlatformView.tsx        # Platform-native copy (LinkedIn, X, IG, YouTube) + regen
│   │   ├── ExportModal.tsx         # Markdown and Plain Text file download & copy
│   │   ├── ProjectsView.tsx        # Saved episodes workspace
│   │   └── SettingsView.tsx        # Engine verification, grounding rules, cache management
│   ├── types/
│   │   └── index.ts                # TypeScript domain contracts and interfaces
│   ├── App.tsx                     # Primary state container
│   ├── main.tsx                    # Client entry point
│   └── index.css                   # Tailwind v4 theme configuration
```

---

## 3. The Core Processing Pipeline

1. **URL Ingestion & Validation (`extractYouTubeVideoId`)**
   - Supports standard `v=`, `youtu.be/`, `/shorts/`, `/embed/`, `/live/`, and mobile links.
2. **Metadata Retrieval (`fetchYouTubeMetadata`)**
   - Queries YouTube oEmbed endpoint to retrieve canonical title, creator/author, and thumbnail without requiring a heavy external API key.
3. **Transcript Extraction (`fetchYouTubeTranscript`)**
   - Primary: Uses `youtube-transcript` library to retrieve timed caption items.
   - Fallback: Fetches `ytInitialPlayerResponse` caption tracks directly from watch HTML to retrieve timedtext XML.
   - Converts raw offset milliseconds into human-readable timestamp blocks `[mm:ss]` spaced across thoughts.
   - Curated samples available directly for offline or instant testing.
4. **Token Safety & Guardrails**
   - For transcripts exceeding 120k words, the text is bounded cleanly to prevent context truncation.
5. **AI Content Understanding & Moment Extraction (`analyzeTranscript`)**
   - Uses `gemini-3.8-flash` with `responseMimeType: "application/json"`.
   - Temperature set to `0.2` to ensure facts, quotes, and timestamps strictly match the transcript without hallucinations.
   - Extracts: Episode title, short & detailed summary, key takeaways, chapter markers starting at 00:00, verbatim quotes, and 3-6 highlight clip opportunities.
6. **Platform Adaptation (`generatePlatformContent`)**
   - Adapts the factual core into platform-native formats:
     - **LinkedIn**: Narrative thought-leadership post with scannable spacing and CTA question.
     - **X (Twitter)**: Numbered thread (1/N) with magnetic hook and takeaway breakdowns.
     - **Instagram**: Editorial caption with bold opening, bulleted learnings, and hashtag bank.
     - **YouTube**: 3 title variations (curiosity, contrarian, direct benefit), full SEO description, formatted chapters table, and comma-separated tags.
7. **Creator Review & Refinement**
   - Every block features **Edit**, **Copy**, and **Regenerate** buttons.
   - Single-platform regeneration supports custom instructions (e.g. "Focus on the second takeaway", "Make tone more technical").
   - Export to clipboard, `.md` (Markdown), or `.txt`.

---

## 4. Setup & Running Instructions

### Prerequisites
- Node.js (v18 or higher)
- NPM
- A Google Gemini API key (configured in `GEMINI_API_KEY`)

### Environment Setup
Create a `.env` file in the project root:
```env
GEMINI_API_KEY="your_gemini_api_key_here"
PORT=3000
```

### Installation & Run Commands
```bash
# Install dependencies
npm install

# Run the full-stack development server (Express backend + Vite frontend)
npm run dev

# Lint & type-check
npm run lint

# Build for production
npm run build

# Start production server
npm run start
```

Access the application in your browser at `http://localhost:3000`.
