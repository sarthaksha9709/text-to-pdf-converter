import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../index.js';

describe('GET /api/health', () => {
  it('returns status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('GET /api/templates', () => {
  it('returns an array of templates', async () => {
    const res = await request(app).get('/api/templates');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('label');
    expect(res.body[0]).toHaveProperty('options');
  });
});

describe('POST /api/convert', () => {
  it('converts text to PDF', async () => {
    const res = await request(app).post('/api/convert').send({ text: 'Hello, World!' });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/pdf/);
    expect(res.headers['content-disposition']).toMatch(/attachment/);
  });

  it('returns 400 when no text provided', async () => {
    const res = await request(app).post('/api/convert').send({ text: '' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 413 when text exceeds limit', async () => {
    const res = await request(app)
      .post('/api/convert')
      .send({ text: 'x'.repeat(50001) });
    expect(res.status).toBe(413);
    expect(res.body.error).toMatch(/50,000/);
  });

  it('accepts PDF options', async () => {
    const res = await request(app)
      .post('/api/convert')
      .send({
        text: 'Options test',
        options: {
          pageSize: 'Letter',
          fontFamily: 'monospace',
          fontSize: 10,
          showPageNumbers: true
        }
      });
    expect(res.status).toBe(200);
  });

  it('returns 400 for invalid options', async () => {
    const res = await request(app)
      .post('/api/convert')
      .send({ text: 'Test', options: { pageSize: 'A3' } });
    expect(res.status).toBe(400);
  });

  it('uses provided filename in Content-Disposition', async () => {
    const res = await request(app)
      .post('/api/convert')
      .send({ text: 'Filename test', filename: 'my-report' });
    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toMatch(/my-report/);
  });
});
