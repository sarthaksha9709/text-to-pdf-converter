# Text to PDF Converter

A dark-mode web app + API that converts pasted text or uploaded `.txt/.md` files into fully formatted PDFs with live preview, typography controls, and downloadable output.

## Stack
- **Frontend**: React + TypeScript + Vite (apps/web)
- **Backend**: Node.js + Express + TypeScript (apps/api)
- **Shared package**: `@text2pdf/pdf-engine` (pdf-lib wrapper + shared types)

## Getting Started

```bash
pnpm install
pnpm --filter @text2pdf/pdf-engine build   # build shared package once
pnpm --filter @text2pdf/api dev             # start API on http://localhost:4000
pnpm --filter @text2pdf/web dev             # start web UI on http://localhost:3000
```

The Vite dev server proxies `/api/*` requests to the Express API.

## API
- `GET /api/templates` – list styling presets
- `POST /api/convert` – accepts JSON ({ text, options, filename }) or multipart/form-data with `file`, `options`, `filename`. Returns a PDF buffer.

## Features
- Paste text (validated up to 50k chars) or upload `.txt` / `.md` (5 MB limit)
- Drag-and-drop zone with live file feedback
- Page size, margins, orientation, font families, font size, line spacing, header + page number toggles
- Live preview (client-side pdf-lib)
- Download button (calls server for final PDF)
- Privacy-first: nothing stored on disk/server

## Testing
Use `samples/test.txt` to simulate uploads. A future Lovable deployment can point Vercel to `apps/web` and the API to any Node host.
