# Text → PDF Converter

[![CI](https://github.com/sarthaksha9709/text-to-pdf-converter/actions/workflows/ci.yml/badge.svg)](https://github.com/sarthaksha9709/text-to-pdf-converter/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org)

A dark-mode web app + API that converts pasted text or uploaded `.txt/.md` files into fully formatted PDFs with live preview, typography controls, and downloadable output.

---

## Features

- **Paste or type text** (up to 50,000 characters)
- **Drag-and-drop file upload** — `.txt` or `.md` files up to 5 MB
- **Live client-side PDF preview** — see your PDF update as you type
- **Typography controls** — font family, font size, line spacing
- **Layout options** — page size (A4/Letter/Legal), orientation, margin presets
- **Page numbers** and custom header title
- **Template presets** — Manuscript, Technical Notes, Executive Report
- **One-click download** via the API
- **Privacy-first** — nothing stored on disk or server

---

## Getting Started

### Prerequisites

- **Node.js** 18.x or 20.x
- **pnpm** 10.x: `npm install -g pnpm`

### Installation

```bash
git clone https://github.com/sarthaksha9709/text-to-pdf-converter.git
cd text-to-pdf-converter
pnpm install
pnpm --filter @text2pdf/pdf-engine build
```

### Development

```bash
# Start both API (port 4000) and web (port 3000) in parallel
pnpm dev
```

The Vite dev server proxies `/api/*` to the Express API automatically.

---

## Stack

| Layer      | Technology                               |
| ---------- | ---------------------------------------- |
| Frontend   | React 19 + TypeScript 5 + Vite 7         |
| Backend    | Node.js + Express 4 + TypeScript         |
| PDF Engine | `@text2pdf/pdf-engine` (pdf-lib wrapper) |
| Monorepo   | pnpm workspaces                          |
| Testing    | Vitest                                   |
| Linting    | ESLint + Prettier                        |

---

## API

| Method | Endpoint         | Description              |
| ------ | ---------------- | ------------------------ |
| `GET`  | `/api/health`    | Health check             |
| `GET`  | `/api/templates` | List styling presets     |
| `POST` | `/api/convert`   | Convert text/file to PDF |

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for full details and examples.

---

## Testing

```bash
pnpm test                                     # run all unit tests
pnpm --filter @text2pdf/pdf-engine test       # pdf-engine tests only
pnpm --filter @text2pdf/api test              # api tests only
pnpm --filter @text2pdf/pdf-engine test:coverage
```

---

## Docker

```bash
docker compose up -d
```

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step guides for Vercel, Railway, Render, and Docker.

### Environment Variables

| Variable         | Default                 | Description                |
| ---------------- | ----------------------- | -------------------------- |
| `VITE_API_URL`   | `""`                    | Backend URL for production |
| `PORT`           | `4000`                  | API server port            |
| `CORS_ORIGIN`    | `http://localhost:3000` | Allowed CORS origin        |
| `RATE_LIMIT_MAX` | `100`                   | Requests per window        |

Copy `.env.example` and `apps/web/.env.example` to get started.

---

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — System design, data flow, technology rationale
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) — Complete API reference with OpenAPI spec
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Step-by-step deployment guides
- [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) — Local dev setup and debugging
- [CONTRIBUTING.md](./CONTRIBUTING.md) — How to contribute
- [SECURITY.md](./SECURITY.md) — Security policy

---

## Troubleshooting

**`pnpm: command not found`** — run `npm install -g pnpm`

**`Cannot find module '@text2pdf/pdf-engine'`** — run `pnpm --filter @text2pdf/pdf-engine build` first

**Port already in use** — change `PORT` in your `.env`

**TypeScript `import type` errors** — `verbatimModuleSyntax` is enabled; use `import type { Foo }` for type-only imports

---

## License

[MIT](./LICENSE) © 2024 sarthaksha9709
