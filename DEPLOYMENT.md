# Deployment Guide

## Overview

The app consists of two deployable units:

- **Frontend** (`apps/web`) — static React app, deploy to Vercel or any static host
- **Backend** (`apps/api`) — Node.js Express server, deploy to Railway, Render, or any Node.js host

---

## Frontend Deployment (Vercel)

### One-click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sarthaksha9709/text-to-pdf-converter)

### Manual Steps

1. **Install Vercel CLI** (optional): `npm install -g vercel`
2. **Import the repository** on [vercel.com/new](https://vercel.com/new).
3. **Configure the project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `apps/web`
   - **Build Command**: `pnpm --filter @text2pdf/pdf-engine build && pnpm --filter @text2pdf/web build`
   - **Output Directory**: `dist`
4. **Set environment variables** in the Vercel dashboard:
   ```
   VITE_API_URL=https://your-api.railway.app
   ```
5. **Deploy**.

---

## Backend Deployment (Railway)

### Using railway.json

The repository includes a `railway.json` that configures the build and start commands automatically.

1. **Create a new project** on [railway.app](https://railway.app).
2. **Connect your GitHub repository**.
3. **Set environment variables**:
   ```
   NODE_ENV=production
   PORT=4000
   CORS_ORIGIN=https://your-frontend.vercel.app
   RATE_LIMIT_MAX=100
   RATE_LIMIT_WINDOW_MS=900000
   ```
4. **Deploy** — Railway will use `railway.json` for the build.

### Using Render

1. Create a **New Web Service** on [render.com](https://render.com).
2. Connect your GitHub repository.
3. Configure:
   - **Environment**: Node
   - **Build Command**: `npm install -g pnpm && pnpm install && pnpm --filter @text2pdf/pdf-engine build && pnpm --filter @text2pdf/api build`
   - **Start Command**: `cd apps/api && node dist/index.js`
4. Add environment variables (same as Railway above).

---

## Docker Deployment

### Build and run

```bash
# Build images
docker build -f Dockerfile.api -t text2pdf-api .
docker build -f Dockerfile.web -t text2pdf-web .

# Run with docker compose
docker compose up -d
```

### Production compose

For production, override the compose file:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## Environment Variables

### Frontend (`apps/web`)

| Variable               | Default   | Description                              |
| ---------------------- | --------- | ---------------------------------------- |
| `VITE_API_URL`         | `""`      | Backend API URL (empty = use Vite proxy) |
| `VITE_MAX_FILE_SIZE`   | `5242880` | Max upload size in bytes                 |
| `VITE_MAX_TEXT_LENGTH` | `50000`   | Max text length in characters            |

### Backend (`apps/api`)

| Variable               | Default                 | Description                  |
| ---------------------- | ----------------------- | ---------------------------- |
| `PORT`                 | `4000`                  | Server port                  |
| `NODE_ENV`             | `development`           | Environment                  |
| `CORS_ORIGIN`          | `http://localhost:3000` | Allowed CORS origin          |
| `RATE_LIMIT_MAX`       | `100`                   | Max requests per window      |
| `RATE_LIMIT_WINDOW_MS` | `900000`                | Rate limit window (ms)       |
| `MAX_FILE_SIZE`        | `5242880`               | Max file upload size (bytes) |

---

## Custom Domain Setup

### Vercel

1. Go to **Project Settings → Domains**.
2. Add your domain and follow the DNS instructions.
3. SSL is automatic.

### Railway

1. Go to **Service Settings → Networking → Custom Domain**.
2. Add your domain and follow the DNS instructions.

---

## Health Checks and Monitoring

The API exposes `GET /api/health` which returns `{ "status": "ok" }`.

- **Railway**: Set `healthcheckPath: "/api/health"` in `railway.json` (already configured).
- **Render**: Set **Health Check Path** to `/api/health`.
- **UptimeRobot**: Monitor `https://your-api.railway.app/api/health` with HTTP(S) check.

For error tracking, integrate [Sentry](https://sentry.io) — see `docs/MONITORING.md`.

---

## CI/CD Pipeline

The `.github/workflows/ci.yml` workflow runs on every push and PR to `main`:

1. Install dependencies
2. Run linting
3. Build all packages
4. Run tests (if present)

The workflow tests against Node.js 18.x and 20.x in parallel.
