import cors from 'cors';
import express from 'express';
import multer from 'multer';
import { z } from 'zod';
import { generatePdfBuffer, PdfOptions } from '@text2pdf/pdf-engine';

const PORT = Number(process.env.PORT) || 4000;
const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'text/plain' || file.mimetype === 'text/markdown') {
      cb(null, true);
    } else {
      cb(new Error('Only .txt and .md files are allowed'));
    }
  }
});

const optionsSchema = z.object({
  pageSize: z.enum(['A4', 'Letter', 'Legal']).optional(),
  orientation: z.enum(['portrait', 'landscape']).optional(),
  fontFamily: z.enum(['serif', 'sans-serif', 'monospace']).optional(),
  fontSize: z.number().min(8).max(18).optional(),
  lineSpacing: z.number().min(1).max(2.5).optional(),
  marginPreset: z.enum(['normal', 'narrow', 'wide']).optional(),
  showPageNumbers: z.boolean().optional(),
  headerTitle: z.string().max(120).optional()
});

const templatePresets = [
  {
    id: 'manuscript',
    label: 'Manuscript',
    options: { fontFamily: 'serif', marginPreset: 'wide', lineSpacing: 2 }
  },
  {
    id: 'tech-notes',
    label: 'Technical Notes',
    options: { fontFamily: 'monospace', fontSize: 11, marginPreset: 'narrow' }
  },
  {
    id: 'report',
    label: 'Executive Report',
    options: { fontFamily: 'sans-serif', headerTitle: 'Report', showPageNumbers: true }
  }
];

app.get('/api/templates', (_req, res) => {
  res.json(templatePresets);
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const sanitizeFilename = (value?: string) => {
  if (!value) return undefined;
  return value.replace(/[^a-z0-9-_ ]/gi, '').trim();
};

app.post('/api/convert', upload.single('file'), async (req, res) => {
  try {
    let text = '';

    if (req.file) {
      text = req.file.buffer.toString('utf-8');
    } else if (req.body.text) {
      text = String(req.body.text);
    }

    if (!text.trim()) {
      return res.status(400).json({ error: 'No text provided' });
    }

    if (text.length > 50_000) {
      return res.status(413).json({ error: 'Text exceeds 50,000 character limit' });
    }

    let options: PdfOptions | undefined;
    if (req.body.options) {
      if (typeof req.body.options === 'string') {
        options = optionsSchema.parse(JSON.parse(req.body.options));
      } else {
        options = optionsSchema.parse(req.body.options);
      }
    }

    const filename = sanitizeFilename(req.body.filename as string | undefined) || text.split('\n')[0];

    const { data, filename: safeName } = await generatePdfBuffer({
      text,
      filename,
      options
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
    res.send(Buffer.from(data));
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.flatten() });
    }
    if (error instanceof Error && error.message.includes('file too large')) {
      return res.status(413).json({ error: 'File exceeds 5MB limit' });
    }
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
