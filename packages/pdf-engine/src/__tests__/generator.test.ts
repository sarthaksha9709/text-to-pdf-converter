import { describe, it, expect } from 'vitest';
import { generatePdfBuffer } from '../index.js';

describe('generatePdfBuffer', () => {
  it('generates a PDF for simple text', async () => {
    const result = await generatePdfBuffer({ text: 'Hello, World!' });
    expect(result.data).toBeInstanceOf(Uint8Array);
    expect(result.data.length).toBeGreaterThan(0);
    // PDF magic bytes: %PDF
    expect(result.data[0]).toBe(0x25); // %
    expect(result.data[1]).toBe(0x50); // P
    expect(result.data[2]).toBe(0x44); // D
    expect(result.data[3]).toBe(0x46); // F
  });

  it('returns a sanitized filename', async () => {
    const result = await generatePdfBuffer({ text: 'Test', filename: 'My Document' });
    expect(result.filename).toBe('my-document.pdf');
  });

  it('uses fallback filename when none provided', async () => {
    const result = await generatePdfBuffer({ text: 'Test' });
    expect(result.filename).toBe('text-to-pdf.pdf');
  });

  it('supports A4 page size', async () => {
    const result = await generatePdfBuffer({
      text: 'A4 page',
      options: { pageSize: 'A4' }
    });
    expect(result.data.length).toBeGreaterThan(0);
  });

  it('supports Letter page size', async () => {
    const result = await generatePdfBuffer({
      text: 'Letter page',
      options: { pageSize: 'Letter' }
    });
    expect(result.data.length).toBeGreaterThan(0);
  });

  it('supports landscape orientation', async () => {
    const result = await generatePdfBuffer({
      text: 'Landscape',
      options: { orientation: 'landscape' }
    });
    expect(result.data.length).toBeGreaterThan(0);
  });

  it('supports different font families', async () => {
    for (const fontFamily of ['serif', 'sans-serif', 'monospace'] as const) {
      const result = await generatePdfBuffer({ text: 'Font test', options: { fontFamily } });
      expect(result.data.length).toBeGreaterThan(0);
    }
  });

  it('clamps font size to valid range', async () => {
    const result = await generatePdfBuffer({
      text: 'Font size test',
      options: { fontSize: 99 }
    });
    expect(result.data.length).toBeGreaterThan(0);
  });

  it('renders page numbers when enabled', async () => {
    const result = await generatePdfBuffer({
      text: 'Page number test',
      options: { showPageNumbers: true }
    });
    expect(result.data.length).toBeGreaterThan(0);
  });

  it('renders header title when provided', async () => {
    const result = await generatePdfBuffer({
      text: 'Header test',
      options: { headerTitle: 'My Report' }
    });
    expect(result.data.length).toBeGreaterThan(0);
  });

  it('handles multi-page text', async () => {
    const longText = 'Line\n'.repeat(1000);
    const result = await generatePdfBuffer({ text: longText });
    expect(result.data.length).toBeGreaterThan(0);
  });

  it('handles empty lines in text', async () => {
    const result = await generatePdfBuffer({ text: 'Para 1\n\nPara 2\n\nPara 3' });
    expect(result.data.length).toBeGreaterThan(0);
  });
});
