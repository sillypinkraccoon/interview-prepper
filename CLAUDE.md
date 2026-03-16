# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install all dependencies (run once after cloning)
npm run install:all

# Development — starts both servers concurrently
npm run dev
# Express API → http://localhost:3001
# Vite frontend → http://localhost:5173

# Production build (client only)
npm run build          # outputs to client/dist/
npm start              # serves built client + API from port 3001

# Server only
npm run dev --prefix server   # node --watch index.js

# Client only
npm run dev --prefix client   # vite dev server
```

No test runner is configured. No linter is configured.

## Architecture

Monorepo with two independent `package.json` packages — `server/` (Express, ESM) and `client/` (Vite + React). The root `package.json` only holds `concurrently` and orchestration scripts.

### Request flow

```
Browser → POST /api/generate (multipart/form-data)
  → multer (memoryStorage — PDFs never touch disk)
  │   fields: resume, jobDescriptionFile, companyContextFile, linkedInFile
  → pdfParser.extractText(buffer)        [truncates at 8,000 chars each]
  │   PDF fields take priority over their text body counterparts
  → promptBuilder.buildMessages(...)     [system prompt + user message]
  │   companyContext block injected before linkedIn block when present
  → claudeClient.generateQuestions(...)  [claude-sonnet-4-6, max_tokens 16000]
  → JSON validated (5 categories × 7 questions)
  │   stop_reason === 'max_tokens' detected and surfaced as a 422 error
  → session saved to server/storage/sessions/{uuid}.json
  → full session JSON returned to client
```

### Key architectural decisions

- **PDF buffers stay in RAM** — `multer.memoryStorage()` is intentional; no temp file cleanup needed.
- **ESM throughout** — both `server/` and `client/` use `"type": "module"`. All server imports must use `.js` extensions.
- **Sessions are plain JSON files** — `server/storage/sessions/` holds one `{uuid}.json` per session. This directory is gitignored and auto-created by `server/index.js` on startup.
- **`saveSession` is a named export from `server/routes/sessions.js`**, not the router default. `generate.js` imports it directly to avoid duplicating write logic.
- **Vite proxies `/api` → `localhost:3001`** in dev. In production `npm start`, Express serves `client/dist/` as static files — single process, single port.

### State management (client)

Zustand store at `client/src/store/appStore.js` is the single source of truth. View states: `'new'` (UploadForm), `'generating'` (LoadingView in App.jsx), `'results'` (QuestionBank). `isGenerating` flag drives the loading overlay; `currentSession` drives which main panel renders.

### Claude prompt contract

The system prompt in `server/services/promptBuilder.js` enforces strict JSON-only output with exactly 5 ordered categories and 7 questions each. Question IDs follow the pattern `B1-B7`, `T1-T7`, `L1-L7`, `R1-R7`, `C1-C7`. The server validates this shape after parsing and throws HTTP 422 on failure (the UI shows a Retry button). Two optional context blocks are conditionally appended to the user message: company context (injected first, targets Culture Fit and Role-Specific questions) and hiring manager profile (injected second, adjusts framing and tone). Both accept either pasted text or an uploaded PDF.

### Environment

`server/.env` (gitignored) must contain:
```
ANTHROPIC_API_KEY=sk-ant-...
PORT=3001   # optional
```
A `server/.env.example` is committed as a template.
