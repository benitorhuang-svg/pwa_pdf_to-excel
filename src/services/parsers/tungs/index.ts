import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { InvoiceData } from '../../../types';
import { VENDORS } from '../../../config/vendorConfig';

// Use a Vite-friendly worker URL so the dev server serves the worker correctly
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

interface TextItem {
  text: string;
  x: number;
  y: number;
}

// NOTE: This parser is tailored to the Taichung Veterans General Hospital (中榮) invoice layout.
export async function parseVghPdfFile(
  file: File,
  onProgress: (page: number, total: number) => void
): Promise<{ data: InvoiceData[]; totalPages: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.5.207/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.5.207/standard_fonts/',
  }).promise;

  const totalPages = pdf.numPages;
  const allData: InvoiceData[] = [];
  let seqCounter = 0;
  let lastDN = '';

  for (let i = 1; i <= totalPages; i++) {
    onProgress(i, totalPages);
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    const textItems: TextItem[] = textContent.items
      .filter((item: any): item is any & { str: string } => 'str' in item)
      .map((item: any) => ({
        text: item.str.trim(),
        x: Math.round(item.transform[4]),
        y: Math.round(item.transform[5]),
      }));

    const lines = reconstructLines(textItems);
    const { pageData, nextSeq, updatedLastDN } = parseVghPageData(lines, seqCounter, file.name, lastDN);
    allData.push(...pageData);
    seqCounter = nextSeq;
    lastDN = updatedLastDN;
  }

  // Final polishing
  const uniqueData = Array.from(new Set(allData.map(item => JSON.stringify(item))))
    .map(str => JSON.parse(str) as InvoiceData);

  // Prefer preserving parse order via seq when available
  uniqueData.sort((a, b) => {
    if (a.seq !== undefined && b.seq !== undefined) return a.seq - b.seq;
    return a.date.localeCompare(b.date);
  });

  return { data: uniqueData, totalPages };
}

function reconstructLines(items: TextItem[]): TextItem[][] {
  const lineMap: Record<number, TextItem[]> = {};
  items.forEach(item => {
    const y = item.y;
    const foundY = Object.keys(lineMap).find(ey => Math.abs(parseInt(ey) - y) < 4);
    const targetY = foundY ? parseInt(foundY) : y;
    if (!lineMap[targetY]) lineMap[targetY] = [];
    lineMap[targetY].push(item);
  });
  return Object.keys(lineMap)
    .sort((a, b) => parseInt(b) - parseInt(a))
    .map(y => lineMap[parseInt(y)].sort((a, b) => a.x - b.x));
}

function parseVghPageData(lines: TextItem[][], seqStart: number, fileName: string, initialDN: string): { pageData: InvoiceData[]; nextSeq: number; updatedLastDN: string } {
  const pageData: InvoiceData[] = [];
  let seq = seqStart;
  let currentBatchDN = initialDN;

  for (const line of lines) {
    const text = line.map(it => it.text).join(' ');
    
    // Relaxed regex: Look for Seq (7-8 digits) followed by Date (8 digits).
    // Amount is now optional as it may be on same line but very far away.
    const batchMatch = text.match(/(\d{7,8})\s+(\d{8})/);
    const hasInvoicePattern = text.match(/[A-Z]{2}\d{8}/);
    
    if (batchMatch && !hasInvoicePattern) {
      currentBatchDN = batchMatch[1];
    }
    
    // Look for Invoice Number (usually 2 Uppercase + 8 Digits)
    const invIdx = line.findIndex(item => item.text.match(/^[A-Z]{2}\d{8}$/));
    if (invIdx !== -1) {
      const invNo = line[invIdx].text;
      let invDate = '-';
      let amount = 0;

      for (let j = invIdx + 1; j < line.length; j++) {
        const textStr = line[j].text.replace(/,/g, '');
        if (invDate === '-' && textStr.match(/^\d{8}$/)) {
          invDate = textStr;
          continue;
        }
        if (amount === 0 && textStr.match(/^\d+(\.\d+)?$/)) {
          const val = parseFloat(textStr);
          if (val > 0) {
            amount = val;
            break; 
          }
        }
      }

      if (invNo && amount > 0) {
        pageData.push({ dn: currentBatchDN || '-', invoice: invNo, date: invDate, amount, seq, fileName, vendorId: VENDORS.vgh.id });
        seq++;
      }
    }
  }

  return { pageData, nextSeq: seq, updatedLastDN: currentBatchDN };
}
