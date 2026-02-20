import { useState, useCallback } from 'react';
import axios from 'axios';
import type { PdfOptions } from '@text2pdf/pdf-engine';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

interface GeneratePdfOptions {
  text: string;
  filename: string;
  options: PdfOptions;
  file: File | null;
}

interface UsePDFGenerationResult {
  loading: boolean;
  status: string;
  error: string;
  generate: (opts: GeneratePdfOptions) => Promise<void>;
}

export function usePDFGeneration(): UsePDFGenerationResult {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const generate = useCallback(async ({ text, filename, options, file }: GeneratePdfOptions) => {
    if (!text.trim() && !file) {
      setError('Provide text or upload a file first.');
      return;
    }
    setLoading(true);
    setError('');
    setStatus('Generating PDF...');
    try {
      let response;
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('filename', filename || file.name);
        formData.append('options', JSON.stringify(options));
        response = await axios.post(`${API_BASE}/api/convert`, formData, {
          responseType: 'blob'
        });
      } else {
        response = await axios.post(
          `${API_BASE}/api/convert`,
          { text, filename, options },
          { responseType: 'blob' }
        );
      }
      const blob = new Blob([response.data as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename || 'text-to-pdf'}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setStatus('PDF ready. Download started.');
    } catch (err: unknown) {
      console.error(err);
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr?.response?.data?.error ?? 'Failed to generate PDF.');
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, status, error, generate };
}
