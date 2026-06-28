/**
 * Robust file text extraction.
 *  - PDF: pdfjs-dist (real text extraction, works for any text-based PDF)
 *  - TXT: direct read
 *  - DOC/DOCX: ask user to export to PDF
 */

import * as pdfjsLib from "pdfjs-dist";
// @ts-ignore — Vite worker import
import PdfWorker from "pdfjs-dist/build/pdf.worker.mjs?worker";

// Wire the worker (Vite bundles it). Falls back silently if env doesn't support it.
try {
  // @ts-ignore
  pdfjsLib.GlobalWorkerOptions.workerPort = new PdfWorker();
} catch {
  // Fallback to CDN worker if bundler import fails.
  // @ts-ignore
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export async function extractTextFromFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".txt")) {
    return (await file.text()).trim();
  }

  if (fileName.endsWith(".pdf")) {
    const buf = await file.arrayBuffer();
    try {
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
      const chunks: string[] = [];
      for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        const content = await page.getTextContent();
        const text = content.items
          .map((it: any) => ("str" in it ? it.str : ""))
          .join(" ");
        if (text.trim()) chunks.push(text);
      }
      const joined = chunks.join("\n\n").replace(/\s+\n/g, "\n").trim();
      if (joined.length < 50) {
        throw new Error(
          "Could not extract text from this PDF. It may be scanned. Please paste your CV content manually."
        );
      }
      return joined;
    } catch (err) {
      throw err instanceof Error
        ? err
        : new Error("Failed to read PDF. Try saving as a text-based PDF or paste manually.");
    }
  }

  if (fileName.endsWith(".doc") || fileName.endsWith(".docx")) {
    throw new Error(
      "DOC/DOCX is not fully supported. Please export your document as PDF and re-upload."
    );
  }

  throw new Error("Unsupported file format. Upload a PDF or TXT file.");
}
