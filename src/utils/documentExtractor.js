/**
 * NariCare AI Document Text Extractor
 *
 * Converts PDF, DOCX, Plain Text, and Image files into readable text strings
 * before sending to Ollama Cloud AI API.
 *
 * Prevents raw binary data transmission to LLM providers.
 */

import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { createWorker } from 'tesseract.js';

// Configure pdfjs worker if available
try {
  if (pdfjsLib && pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
  }
} catch (e) {
  console.warn('PDF.js worker setup warning:', e);
}

/**
 * Main file text extraction helper
 * @param {File} file - User uploaded document/image file
 * @returns {Promise<{ success: boolean, text: string, errorType?: string, userMessage?: string }>}
 */
export async function extractTextFromFile(file) {
  if (!file) {
    return {
      success: false,
      text: '',
      userMessage: 'No file selected.'
    };
  }

  const fileName = file.name || 'document';
  const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  const fileType = file.type || '';

  try {
    // 1. Plain Text / CSV / JSON
    if (extension === '.txt' || extension === '.csv' || extension === '.json' || fileType.startsWith('text/')) {
      const text = await readAsPlainText(file);
      if (!text || !text.trim()) {
        return {
          success: false,
          text: '',
          userMessage: 'NariCare AI could not extract readable text from this document. The file appears to be empty or unreadable.'
        };
      }
      return { success: true, text: text.trim() };
    }

    // 2. DOCX Files
    if (extension === '.docx' || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result?.value || '';
      if (!text || !text.trim()) {
        return {
          success: false,
          text: '',
          userMessage: 'NariCare AI could not extract readable text from this Word document. Please ensure the file contains plain text or enter test parameters directly.'
        };
      }
      return { success: true, text: text.trim() };
    }

    // 3. PDF Files
    if (extension === '.pdf' || fileType === 'application/pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const pdfText = await extractTextFromPDFBuffer(arrayBuffer);
      if (!pdfText || !pdfText.trim()) {
        return {
          success: false,
          text: '',
          userMessage: 'NariCare AI could not extract readable text from this PDF report. Please ensure the PDF is not an unscanned binary image or enter the report values directly.'
        };
      }
      return { success: true, text: pdfText.trim() };
    }

    // 4. Image Files (PNG / JPG / JPEG / WEBP / GIF)
    if (extension === '.png' || extension === '.jpg' || extension === '.jpeg' || extension === '.webp' || fileType.startsWith('image/')) {
      const ocrText = await performImageOCR(file);
      if (!ocrText || !ocrText.trim()) {
        return {
          success: false,
          text: '',
          userMessage: 'NariCare AI could not read text from this report image. Please upload a clearer scan or enter the lab results manually.'
        };
      }
      return { success: true, text: ocrText.trim() };
    }

    // 5. Fallback for unhandled binary extensions
    return {
      success: false,
      text: '',
      userMessage: `NariCare AI cannot parse binary file format (${extension || 'unknown'}). Please upload a PDF, DOCX, TXT, or Image report.`
    };

  } catch (error) {
    console.error(`Document text extraction error for ${fileName}:`, error);
    return {
      success: false,
      text: '',
      userMessage: 'NariCare AI could not extract readable text from this file. Please make sure the report format is valid or enter test parameters manually.'
    };
  }
}

/**
 * Helper to read plain text files
 */
function readAsPlainText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result || '');
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
}

/**
 * Normalizes extracted document text into clean, human-readable medical report text,
 * removing PDF font markers, stream tags, and technical binary residue while preserving
 * test parameters, values, units, reference ranges, dates, and clinical findings.
 */
function cleanAndNormalizeMedicalText(rawInput) {
  if (!rawInput || typeof rawInput !== 'string') return '';

  let text = rawInput;

  // 1. Remove PDF syntax & font stream artifacts
  text = text
    .replace(/\/Font[\s\S]*?\/Encoding/gi, '')
    .replace(/\/Type\s*\/[a-zA-Z0-9]+/gi, '')
    .replace(/<<[\s\S]*?>>/g, '')
    .replace(/obj[\s\S]*?endobj/gi, '')
    .replace(/stream[\s\S]*?endstream/gi, '')
    .replace(/BT[\s\S]*?ET/gi, (match) => {
      // Extract inner text strings from PDF BT...ET text blocks
      const innerMatches = [];
      const regex = /\(([^()]+)\)/g;
      let m;
      while ((m = regex.exec(match)) !== null) {
        if (m[1] && m[1].length > 1) innerMatches.push(m[1]);
      }
      return innerMatches.length > 0 ? innerMatches.join(' ') : match;
    });

  // 2. Remove unprintable control characters & raw hex bytes
  text = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, ' ');

  // 3. Clean up broken PDF spacing and line breaks
  const lines = text.split('\n');
  const cleanedLines = lines
    .map(line => line.trim())
    .filter(line => {
      if (!line) return false;
      // Filter out pure PDF structural noise lines
      if (/^(xref|trailer|startxref|endstream|endobj|%\s*pdf-|%EOF)/i.test(line)) return false;
      if (/^[0-9]+\s+[0-9]+\s+obj/i.test(line)) return false;
      if (/^(\/Filter|\/Length|\/Root|\/Size|\/Info|\/ID)/i.test(line)) return false;
      return true;
    });

  const joinedText = cleanedLines.join('\n').replace(/[ \t]{2,}/g, ' ').trim();

  return joinedText || rawInput.trim();
}

/**
 * Helper to extract text layer from PDF ArrayBuffer
 */
async function extractTextFromPDFBuffer(arrayBuffer) {
  let extractedText = '';

  try {
    const uint8Array = new Uint8Array(arrayBuffer);
    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      isEvalSupported: false,
      useSystemFonts: true,
      disableFontFace: true
    });

    const pdf = await loadingTask.promise;
    let textPages = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageStrings = textContent.items.map((item) => item.str);
      const pageText = pageStrings.join(' ');

      if (pageText && pageText.trim().length > 10) {
        textPages.push(pageText);
      } else {
        // Fallback: If page has no text layer (scanned PDF image), render canvas and run Tesseract OCR on PDF page
        try {
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
          if (canvas) {
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport }).promise;
            const ocrText = await performCanvasOCR(canvas);
            if (ocrText && ocrText.trim()) {
              textPages.push(ocrText);
            }
          }
        } catch (canvasErr) {
          console.warn(`PDF page ${pageNum} OCR render notice:`, canvasErr.message);
        }
      }
    }

    extractedText = textPages.join('\n');
  } catch (err) {
    console.warn('PDF.js text extraction notice, trying stream scanner:', err.message);
  }

  if (!extractedText || !extractedText.trim()) {
    // Fallback: Scan raw PDF text streams for (Text) Tj / [Text] TJ blocks
    try {
      const bytes = new Uint8Array(arrayBuffer);
      let decoder = new TextDecoder('latin1');
      const rawString = decoder.decode(bytes);
      const matches = [];

      const tjRegex = /\(([^()]{2,})\)\s*(?:Tj|TJ)/g;
      let m;
      while ((m = tjRegex.exec(rawString)) !== null) {
        if (m[1] && m[1].length > 1) {
          matches.push(m[1].replace(/\\([()\\])/g, '$1'));
        }
      }

      if (matches.length > 0) {
        extractedText = matches.join(' ');
      }
    } catch (e) {
      console.warn('Raw PDF stream extraction failed:', e);
    }
  }

  return cleanAndNormalizeMedicalText(extractedText);
}

/**
 * Helper to perform Tesseract OCR on an HTML5 Canvas element
 */
async function performCanvasOCR(canvas) {
  let worker = null;
  try {
    worker = await createWorker('eng');
    const dataUrl = canvas.toDataURL('image/png');
    const ret = await worker.recognize(dataUrl);
    await worker.terminate();
    return cleanAndNormalizeMedicalText(ret?.data?.text || '');
  } catch (ocrErr) {
    console.warn('Canvas OCR notice:', ocrErr.message);
    if (worker) {
      try { await worker.terminate(); } catch (e) {}
    }
    return '';
  }
}

/**
 * Helper to perform Tesseract OCR on image file
 */
async function performImageOCR(file) {
  let worker = null;
  try {
    worker = await createWorker('eng');
    const imageUrl = URL.createObjectURL(file);
    const ret = await worker.recognize(imageUrl);
    URL.revokeObjectURL(imageUrl);
    await worker.terminate();
    return cleanAndNormalizeMedicalText(ret?.data?.text || '');
  } catch (ocrErr) {
    console.warn('Tesseract OCR error:', ocrErr.message);
    if (worker) {
      try { await worker.terminate(); } catch (e) {}
    }
    return '';
  }
}

/**
 * Converts extracted medical text and parameters into a downloadable Word (.doc) document Blob
 */
export function generateWordDocumentBlob(title, textContent, sampleValues = []) {
  const safeTitle = title || 'NariCare Converted Health Report';
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  let valuesTableHtml = '';
  if (sampleValues && sampleValues.length > 0) {
    valuesTableHtml = `
      <h3 style="color:#0f766e; font-size:14pt; margin-top:20px; font-family:'Segoe UI', sans-serif;">Extracted Report Biomarkers & Measured Parameters</h3>
      <table style="width:100%; border-collapse:collapse; margin-top:10px; font-size:10pt; font-family:'Segoe UI', sans-serif;">
        <thead>
          <tr style="background-color:#f1f5f9; color:#334155;">
            <th style="border:1px solid #cbd5e1; padding:8px; text-align:left;">Biomarker / Test</th>
            <th style="border:1px solid #cbd5e1; padding:8px; text-align:left;">Measured Value</th>
            <th style="border:1px solid #cbd5e1; padding:8px; text-align:left;">Reference Range</th>
            <th style="border:1px solid #cbd5e1; padding:8px; text-align:left;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${sampleValues.map(v => `
            <tr>
              <td style="border:1px solid #cbd5e1; padding:8px;"><strong>${v.parameter}</strong></td>
              <td style="border:1px solid #cbd5e1; padding:8px; font-weight:bold;">${v.value}</td>
              <td style="border:1px solid #cbd5e1; padding:8px; color:#64748b;">${v.reference || 'Standard'}</td>
              <td style="border:1px solid #cbd5e1; padding:8px; font-weight:bold; color:${v.status === 'LOW' ? '#e11d48' : v.status === 'HIGH' ? '#d97706' : '#0d9488'};">${v.status}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  const docHtml = `
    <html xmlns:o='urn:schemas-microsoft-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${safeTitle}</title>
      <style>
        body { font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #0f172a; line-height: 1.6; margin: 30px; }
        .header { border-bottom: 2.5px solid #7e22ce; padding-bottom: 10px; margin-bottom: 20px; }
        .title { font-size: 20pt; font-weight: bold; color: #6b21a8; margin: 0; }
        .subtitle { font-size: 10pt; color: #64748b; margin-top: 4px; }
        .badge { display: inline-block; background-color: #f3e8ff; color: #6b21a8; padding: 4px 10px; border-radius: 4px; font-size: 9pt; font-weight: bold; margin-top: 8px; }
        .section-header { font-size: 13pt; font-weight: bold; color: #0f766e; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-top: 25px; }
        .content-box { background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 15px; font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; white-space: pre-wrap; word-break: break-word; color: #1e293b; line-height: 1.6; }
        .footer { margin-top: 40px; padding-top: 10px; border-top: 1px solid #e2e8f0; font-size: 8.5pt; color: #94a3b8; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="title">${safeTitle}</h1>
        <div class="subtitle">NariCare AI Health Vault • Converted Medical Document</div>
        <div class="badge">Verified Text Representation • Date: ${dateStr}</div>
      </div>

      ${valuesTableHtml}

      <div class="section-header">Converted Document Text Representation</div>
      <div class="content-box">${textContent || 'No readable text layer extracted.'}</div>

      <div class="footer">
        Confidential Patient Record • Automatically Converted by NariCare AI Document Engine
      </div>
    </body>
    </html>
  `;

  return new Blob(['\ufeff', docHtml], { type: 'application/msword' });
}
