/**
 * Browser-only CV text extraction. This module is imported only after a visitor selects a file.
 * Lightweight matching data and functions remain in careerTaxonomy.ts for the initial route.
 */
export { demoLists, FIELD_MAP, INDUSTRY_SCOPES } from "./careerTaxonomy";

function normaliseReadableText(rawText: string): string {
  const text = String(rawText || "").replace(/[^\x09\x0A\x0D\x20-\x7E\u0600-\u06FF]/g, " ").replace(/\s{2,}/g, " ").trim();
  const letters = (text.match(/[A-Za-z\u0600-\u06FF]/g) || []).length;
  return letters < 120 ? "" : text;
}

async function readPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  if (typeof window !== "undefined") pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();
  const document = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const pages = await Promise.all(Array.from({ length: document.numPages }, async (_, index) => {
    const page = await document.getPage(index + 1);
    const content = await page.getTextContent();
    return content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
  }));
  return pages.join(" ");
}

async function readDocxText(file: File): Promise<string> {
  const mammoth = await import("mammoth/mammoth.browser.js");
  const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return result.value;
}

/** Extracts plain text only in the visitor's browser; no CV file leaves the page. */
export async function readCvText(file: File, options?: { onExtractionFailure?: () => void }): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  try {
    if (file.type === "application/pdf" || extension === "pdf") return normaliseReadableText(await readPdfText(file));
    if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || extension === "docx") return normaliseReadableText(await readDocxText(file));
    if (file.type === "text/plain" || extension === "txt") return normaliseReadableText(await file.text());
    return "";
  } catch (error) {
    console.warn("Local CV text extraction failed", error);
    options?.onExtractionFailure?.();
    return "";
  }
}
