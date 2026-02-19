"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePdfBuffer = generatePdfBuffer;
const pdf_lib_1 = require("pdf-lib");
const PAGE_SIZES = {
    A4: { width: 595.28, height: 841.89 }, // 8.27 x 11.69 in
    Letter: { width: 612, height: 792 }, // 8.5 x 11 in
    Legal: { width: 612, height: 1008 } // 8.5 x 14 in
};
const MARGINS = {
    normal: 72, // 1 in
    narrow: 36, // 0.5 in
    wide: 108 // 1.5 in
};
const FONT_MAP = {
    serif: pdf_lib_1.StandardFonts.TimesRoman,
    'sans-serif': pdf_lib_1.StandardFonts.Helvetica,
    monospace: pdf_lib_1.StandardFonts.Courier
};
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const sanitizeFilename = (name) => {
    const fallback = 'text-to-pdf';
    if (!name)
        return fallback;
    return name
        .trim()
        .replace(/[^a-zA-Z0-9-_ ]/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase()
        .slice(0, 64) || fallback;
};
const wrapLines = (text, maxWidth, font, fontSize) => {
    const paragraphs = text.replace(/\r\n/g, '\n').split('\n');
    const lines = [];
    paragraphs.forEach((para) => {
        if (para.trim() === '') {
            lines.push('');
            return;
        }
        let current = '';
        const words = para.split(/\s+/);
        words.forEach((word) => {
            const tentative = current ? `${current} ${word}` : word;
            const width = font.widthOfTextAtSize(tentative, fontSize);
            if (width <= maxWidth) {
                current = tentative;
            }
            else {
                if (current)
                    lines.push(current);
                if (font.widthOfTextAtSize(word, fontSize) > maxWidth) {
                    const chars = word.split('');
                    let chunk = '';
                    chars.forEach((char) => {
                        const tentativeChunk = `${chunk}${char}`;
                        if (font.widthOfTextAtSize(tentativeChunk, fontSize) <= maxWidth) {
                            chunk = tentativeChunk;
                        }
                        else {
                            if (chunk)
                                lines.push(chunk);
                            chunk = char;
                        }
                    });
                    if (chunk) {
                        current = chunk;
                    }
                    else {
                        current = '';
                    }
                }
                else {
                    current = word;
                }
            }
        });
        if (current) {
            lines.push(current);
            current = '';
        }
    });
    return lines;
};
async function generatePdfBuffer(payload) {
    const { text, filename, options: { pageSize = 'A4', orientation = 'portrait', fontFamily = 'serif', fontSize = 12, lineSpacing = 1.4, marginPreset = 'normal', showPageNumbers = false, headerTitle } = {} } = payload;
    const sanitizedFontSize = clamp(fontSize, 8, 18);
    const sanitizedLineSpacing = clamp(lineSpacing, 1, 2.5);
    const margin = MARGINS[marginPreset];
    const baseSize = PAGE_SIZES[pageSize];
    const pageDims = orientation === 'landscape'
        ? { width: baseSize.height, height: baseSize.width }
        : baseSize;
    const doc = await pdf_lib_1.PDFDocument.create();
    const font = await doc.embedFont(FONT_MAP[fontFamily]);
    const textLines = wrapLines(text, pageDims.width - margin * 2, font, sanitizedFontSize);
    const lineHeight = sanitizedFontSize * sanitizedLineSpacing;
    let page = doc.addPage([pageDims.width, pageDims.height]);
    let y = pageDims.height - margin;
    let pageIndex = 0;
    const drawHeader = (p, pageNumber) => {
        if (headerTitle) {
            p.drawText(headerTitle, {
                x: margin,
                y: pageDims.height - margin + (sanitizedFontSize / 2),
                size: sanitizedFontSize - 2,
                font,
                color: (0, pdf_lib_1.rgb)(0.3, 0.3, 0.3)
            });
        }
        if (showPageNumbers) {
            const text = `Page ${pageNumber}`;
            const width = font.widthOfTextAtSize(text, sanitizedFontSize - 2);
            p.drawText(text, {
                x: pageDims.width - margin - width,
                y: margin / 2,
                size: sanitizedFontSize - 2,
                font,
                color: (0, pdf_lib_1.rgb)(0.3, 0.3, 0.3)
            });
        }
    };
    drawHeader(page, pageIndex + 1);
    y -= sanitizedFontSize;
    textLines.forEach((line) => {
        if (y <= margin) {
            pageIndex += 1;
            page = doc.addPage([pageDims.width, pageDims.height]);
            y = pageDims.height - margin - sanitizedFontSize;
            drawHeader(page, pageIndex + 1);
        }
        page.drawText(line, {
            x: margin,
            y,
            size: sanitizedFontSize,
            font,
            color: (0, pdf_lib_1.rgb)(0, 0, 0)
        });
        y -= lineHeight;
    });
    const pdfBytes = await doc.save();
    return { data: pdfBytes, filename: `${sanitizeFilename(filename)}.pdf` };
}
