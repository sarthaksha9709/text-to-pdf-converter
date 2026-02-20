import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof z.ZodError) {
    res.status(400).json({ error: err.flatten() });
    return;
  }

  if (err instanceof Error) {
    if (err.message.includes('file too large') || err.message.includes('LIMIT_FILE_SIZE')) {
      res.status(413).json({ error: 'File exceeds 5MB limit' });
      return;
    }
    if (err.message.includes('Only .txt and .md')) {
      res.status(400).json({ error: err.message });
      return;
    }
  }

  const isDev = process.env.NODE_ENV !== 'production';
  console.error('[error]', err);

  res.status(500).json({
    error: 'Internal server error',
    ...(isDev && err instanceof Error ? { message: err.message } : {})
  });
}
