import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { generatePdfBuffer, PdfOptions } from '@text2pdf/pdf-engine';
import './App.css';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

const defaultOptions: PdfOptions & {
  pageSize: PdfOptions['pageSize'];
  orientation: PdfOptions['orientation'];
  fontFamily: PdfOptions['fontFamily'];
  marginPreset: PdfOptions['marginPreset'];
} = {
  pageSize: 'A4',
  orientation: 'portrait',
  fontFamily: 'serif',
  fontSize: 12,
  lineSpacing: 1.4,
  marginPreset: 'normal',
  showPageNumbers: false,
  headerTitle: ''
};

type TemplatePreset = {
  id: string;
  label: string;
  options: Partial<PdfOptions>;
};

function App() {
  const [text, setText] = useState('');
  const [filename, setFilename] = useState('');
  const [options, setOptions] = useState(defaultOptions);
  const [templates, setTemplates] = useState<TemplatePreset[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const { data } = await axios.get(`${API_BASE}/api/templates`);
        setTemplates(data);
      } catch (err) {
        console.warn('Template fetch failed', err);
      }
    }
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (!text.trim()) {
      setPreviewUrl(null);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        const { data } = await generatePdfBuffer({ text, filename, options });
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
      } catch (err) {
        console.error(err);
        setError('Preview failed. Please check your input.');
      }
    }, 400);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [text, options, filename]);

  const handleFile = async (incoming: File) => {
    if (incoming.size > 5 * 1024 * 1024) {
      setError('File exceeds 5MB limit.');
      return;
    }
    if (!['text/plain', 'text/markdown'].includes(incoming.type)) {
      setError('Only .txt or .md files are allowed.');
      return;
    }
    const content = await incoming.text();
    setText(content.slice(0, 50000));
    setFile(incoming);
    setFilename(incoming.name.replace(/\.[^.]+$/, ''));
    setError('');
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const incoming = event.dataTransfer.files?.[0];
    if (incoming) handleFile(incoming);
  };

  const onDownload = async () => {
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
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename || 'text-to-pdf'}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setStatus('PDF ready. Download started.');
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.error ?? 'Failed to generate PDF.');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplate = (preset: TemplatePreset) => {
    setOptions((current) => ({ ...current, ...preset.options }));
  };

  const clearAll = () => {
    setText('');
    setFile(null);
    setFilename('');
    setOptions(defaultOptions);
    setPreviewUrl(null);
    setError('');
    setStatus('');
  };

  const charCount = useMemo(() => text.length, [text]);

  return (
    <div className="app-shell">
      <header>
        <div>
          <h1>Text → PDF Converter</h1>
          <p>Paste or drop text, tweak layout, preview live, and export.</p>
        </div>
        <button className="ghost" onClick={clearAll}>Clear</button>
      </header>

      <main>
        <section className="panel input-panel">
          <div className="field">
            <label>Document Title</label>
            <input
              type="text"
              placeholder="Auto-generated from first line"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
            />
          </div>

          <div className="field textarea-field">
            <label>
              Text (max 50,000 characters)
              <span>{charCount}/50,000</span>
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 50000))}
              placeholder="Paste or type your content here..."
            />
          </div>

          <div
            className="dropzone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
          >
            <p>Drag & drop .txt or .md files here, or</p>
            <label className="upload-btn">
              Upload a file
              <input
                type="file"
                accept=".txt,.md,text/plain,text/markdown"
                onChange={(e) => {
                  const incoming = e.target.files?.[0];
                  if (incoming) handleFile(incoming);
                }}
              />
            </label>
            {file && <small>Loaded: {file.name}</small>}
          </div>

          <div className="options-grid">
            <div>
              <label>Page Size</label>
              <select
                value={options.pageSize}
                onChange={(e) => setOptions({ ...options, pageSize: e.target.value as PdfOptions['pageSize'] })}
              >
                <option value="A4">A4</option>
                <option value="Letter">Letter</option>
                <option value="Legal">Legal</option>
              </select>
            </div>
            <div>
              <label>Orientation</label>
              <select
                value={options.orientation}
                onChange={(e) => setOptions({ ...options, orientation: e.target.value as PdfOptions['orientation'] })}
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>
            <div>
              <label>Font</label>
              <select
                value={options.fontFamily}
                onChange={(e) => setOptions({ ...options, fontFamily: e.target.value as PdfOptions['fontFamily'] })}
              >
                <option value="serif">Serif</option>
                <option value="sans-serif">Sans-serif</option>
                <option value="monospace">Monospace</option>
              </select>
            </div>
            <div>
              <label>Font Size</label>
              <input
                type="number"
                min={10}
                max={14}
                value={options.fontSize}
                onChange={(e) => setOptions({ ...options, fontSize: Number(e.target.value) })}
              />
            </div>
            <div>
              <label>Line Spacing</label>
              <input
                type="number"
                min={1}
                max={2}
                step={0.1}
                value={options.lineSpacing}
                onChange={(e) => setOptions({ ...options, lineSpacing: Number(e.target.value) })}
              />
            </div>
            <div>
              <label>Margins</label>
              <select
                value={options.marginPreset}
                onChange={(e) => setOptions({ ...options, marginPreset: e.target.value as PdfOptions['marginPreset'] })}
              >
                <option value="normal">Normal</option>
                <option value="narrow">Narrow</option>
                <option value="wide">Wide</option>
              </select>
            </div>
          </div>

          <div className="toggles">
            <label>
              <input
                type="checkbox"
                checked={Boolean(options.showPageNumbers)}
                onChange={(e) => setOptions({ ...options, showPageNumbers: e.target.checked })}
              />
              Show page numbers
            </label>
            <label>
              Header title
              <input
                type="text"
                value={options.headerTitle}
                onChange={(e) => setOptions({ ...options, headerTitle: e.target.value })}
                placeholder="Optional header text"
              />
            </label>
          </div>

          <div className="templates">
            <p>Templates</p>
            <div className="chips">
              {templates.map((template) => (
                <button key={template.id} onClick={() => handleTemplate(template)}>
                  {template.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="error">{error}</p>}
          {status && <p className="status">{status}</p>}

          <div className="actions">
            <button onClick={onDownload} disabled={loading}>
              {loading ? 'Generating…' : 'Generate PDF'}
            </button>
          </div>
        </section>

        <section className="panel preview-panel">
          <h2>Live Preview</h2>
          {!text && <p className="placeholder">Start typing or upload a file to preview.</p>}
          {text && !previewUrl && <p>Preparing preview…</p>}
          {previewUrl && (
            <iframe src={previewUrl} title="Preview" />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
