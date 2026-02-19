# Development Guide

## Local Setup

See the root [README](../README.md#getting-started) for the quick-start. This document covers more advanced workflows.

---

## Project Structure

```
apps/
  api/src/index.ts          – Express API entry point
  web/src/App.tsx           – React app root component
  web/src/App.css           – Dark-mode styles
packages/
  pdf-engine/src/index.ts   – PDF generation library
```

---

## Adding a New Feature

### Backend route

1. Add the route handler in `apps/api/src/index.ts` (or create a new file and import it).
2. Validate inputs with Zod.
3. Add an entry to `API_DOCUMENTATION.md`.
4. Write a test in `apps/api/src/__tests__/`.

### Frontend component

1. Create `apps/web/src/components/MyComponent.tsx`.
2. Import and use it in `App.tsx` or another component.
3. Write a test in `apps/web/src/components/__tests__/MyComponent.test.tsx`.

### PDF template

1. Add a template object to the `templatePresets` array in `apps/api/src/index.ts`.
2. The frontend will automatically display it in the Templates section.
3. Optionally add default options to `packages/pdf-engine/src/index.ts`.

---

## Adding a New PDF Template

Templates are defined in `apps/api/src/index.ts`:

```typescript
const templatePresets = [
  {
    id: 'my-template',
    label: 'My Template',
    options: {
      fontFamily: 'sans-serif',
      fontSize: 11,
      marginPreset: 'narrow',
      showPageNumbers: true,
      headerTitle: 'My Document'
    }
  }
];
```

The `options` object accepts any fields from `PdfOptions` in `packages/pdf-engine/src/index.ts`.

---

## Running Tests

```bash
# Unit tests (all packages)
pnpm test

# Unit tests for a specific package
pnpm --filter @text2pdf/web test
pnpm --filter @text2pdf/api test

# With coverage
pnpm test --coverage

# End-to-end tests
pnpm test:e2e
```

---

## Debugging

### API not responding

1. Check that port 4000 is free: `lsof -i :4000`
2. Check the console for startup errors.
3. Verify the shared package is built: `pnpm --filter @text2pdf/pdf-engine build`

### TypeScript errors

1. Run `pnpm lint` to see all type errors.
2. Make sure `packages/pdf-engine` is built before type-checking `apps/api`.
3. The `tsconfig.base.json` paths alias `@text2pdf/pdf-engine` → source for development. Building overrides this via `"paths": {}` in `tsconfig.build.json`.

### Vite proxy issues

The Vite dev server proxies `/api/*` to `http://localhost:4000`. If you see CORS errors in the browser console, make sure the API is running and the proxy target is correct in `apps/web/vite.config.ts`.

---

## Common Issues

| Problem                                     | Solution                                                                   |
| ------------------------------------------- | -------------------------------------------------------------------------- |
| `pnpm: command not found`                   | Run `npm install -g pnpm`                                                  |
| `Cannot find module '@text2pdf/pdf-engine'` | Run `pnpm --filter @text2pdf/pdf-engine build` first                       |
| `Port 3000/4000 already in use`             | Kill the existing process: `lsof -ti :3000 \| xargs kill`                  |
| ESLint errors on `import type`              | `verbatimModuleSyntax` is enabled; use `import type` for type-only imports |
