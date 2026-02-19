# Monitoring Guide

## Error Tracking with Sentry

### Backend (Node.js)

```bash
pnpm --filter @text2pdf/api add @sentry/node
```

In `apps/api/src/index.ts`:

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

// Add before other middleware
app.use(Sentry.Handlers.requestHandler());

// Add before error handler
app.use(Sentry.Handlers.errorHandler());
```

Set `SENTRY_DSN` in your environment variables.

### Frontend (React)

```bash
pnpm --filter @text2pdf/web add @sentry/react
```

In `apps/web/src/main.tsx`:

```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE
});
```

---

## Uptime Monitoring

### UptimeRobot (free tier)

1. Sign up at [uptimerobot.com](https://uptimerobot.com).
2. Add a **New Monitor**:
   - **Monitor Type**: HTTP(S)
   - **URL**: `https://your-api.railway.app/api/health`
   - **Monitoring Interval**: 5 minutes
3. Add email/Slack alerts for downtime.

### Pingdom

Similar setup — use `/api/health` as the check URL.

---

## Analytics

### Plausible (privacy-friendly)

Add to `apps/web/index.html`:

```html
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

### Google Analytics 4

Add the GA4 measurement ID to `apps/web/index.html` and configure `VITE_GA_MEASUREMENT_ID`.

---

## Logging

The API logs to stdout in structured JSON format (in production). Use your platform's built-in log aggregation:

- **Railway**: View logs in the Railway dashboard → Service → Logs.
- **Render**: View logs in Render dashboard → Service → Logs.
- **Docker**: `docker compose logs -f api`

For persistent log storage, consider integrating [Logtail](https://betterstack.com/logtail) or [Datadog](https://www.datadoghq.com/).
