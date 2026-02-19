import { useState, useCallback } from 'react';

const MAX_FILE_SIZE = Number(import.meta.env.VITE_MAX_FILE_SIZE) || 5 * 1024 * 1024;
const ALLOWED_TYPES = ['text/plain', 'text/markdown'];

interface UseFileUploadResult {
  file: File | null;
  error: string;
  handleFile: (incoming: File) => Promise<string | null>;
  clearFile: () => void;
}

export function useFileUpload(): UseFileUploadResult {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const handleFile = useCallback(async (incoming: File): Promise<string | null> => {
    if (incoming.size > MAX_FILE_SIZE) {
      setError('File exceeds 5MB limit.');
      return null;
    }
    if (!ALLOWED_TYPES.includes(incoming.type)) {
      setError('Only .txt or .md files are allowed.');
      return null;
    }
    const content = await incoming.text();
    setFile(incoming);
    setError('');
    return content;
  }, []);

  const clearFile = useCallback(() => {
    setFile(null);
    setError('');
  }, []);

  return { file, error, handleFile, clearFile };
}
