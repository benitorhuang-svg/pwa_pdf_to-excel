import * as pdfjsLib from 'pdfjs-dist';
import { InvoiceData } from '../types';

// Vite ?url ensures worker matches npm version
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

interface TextItem {
  text: string;
  x: number;
  y: number;
  w: number;
}

interface ColumnMap {
  receipt: number;
  amount: number;
  invoice: number;
}

export async function parsePdfFile(
  file: File,
  onProgress: (page: number, total: number) => void
): Promise<{ data: InvoiceData[]; totalPages: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.5.207/cmaps/',
    cMapPacked: true,
  }).promise;
  
  const totalPages = pdf.numPages;
  const allData: InvoiceData[] = [];
  let lastDN = "";

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
        w: item.width
      }));

    const lines = reconstructLines(textItems);
    const colMap = detectColumns(lines);
    
    const { pageData, updatedLastDN } = parsePageData(lines, colMap, lastDN);
    allData.push(...pageData);
    lastDN = updatedLastDN;
  }

  const uniqueData = Array.from(new Set(allData.map(item => JSON.stringify(item))))
    .map(str => JSON.parse(str) as InvoiceData);
  
  uniqueData.sort((a, b) => a.date.localeCompare(b.date));

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

function detectColumns(lines: TextItem[][]): ColumnMap {
  const map: ColumnMap = { receipt: 67, amount: 580, invoice: 700 };
  
  for (const line of lines) {
    const text = line.map(l => l.text).join("");
    if (text.includes("驗退收單號") && text.includes("發票號碼")) {
      line.forEach(item => {
        if (item.text.includes("驗退收單號")) map.receipt = item.x;
        if (item.text.includes("付款金額")) map.amount = item.x;
        if (item.text.includes("發票號碼")) map.invoice = item.x;
      });
      return map;
    }
  }
  
  for (const line of lines) {
    const dnItem = line.find(item => item.text.match(/^[A-Z]{2}\d{8}$/) && item.x < 200);
    if (dnItem) {
      map.receipt = dnItem.x;
      const invCombined = line.find(item => item.text.match(/\d+\s+[A-Z]{2}\d{8}/));
      if (invCombined) map.invoice = invCombined.x;
      const amountItem = line.find(item => item.x > 500 && item.x < 650 && item.text.match(/^\d+$/));
      if (amountItem) map.amount = amountItem.x;
      break;
    }
  }
  return map;
}

function parsePageData(lines: TextItem[][], colMap: ColumnMap, initialDN: string): { pageData: InvoiceData[]; updatedLastDN: string } {
  const pageData: InvoiceData[] = [];
  let currentDN = initialDN;

  lines.forEach((line, idx) => {
    const dnItem = line.find(item =>
      Math.abs(item.x - colMap.receipt) < 40 && item.text.match(/^[A-Z]{2}\d{8}$/)
    );
    if (dnItem) currentDN = dnItem.text;

    let invNo = "";
    const invItem = line.find(item => item.x > 500 && item.text.match(/^[A-Z]{2}\d{8}$/));
    if (invItem) invNo = invItem.text;

    if (!invNo) {
      const combinedItem = line.find(item => {
        const match = item.text.match(/(\d+)\s+([A-Z]{2}\d{8})/);
        return match && item.x > 500;
      });
      if (combinedItem) {
        const match = combinedItem.text.match(/(\d+)\s+([A-Z]{2}\d{8})/);
        if (match) invNo = match[2];
      }
    }

    if (invNo) {
      let invDate = "-";
      let amount = 0;

      for (let d = 1; d <= 3; d++) {
        if (idx + d < lines.length) {
          const dateItem = lines[idx + d].find(item => item.text.match(/^1\d{6}$/));
          if (dateItem) { 
            invDate = convertRocToAd(dateItem.text); 
            break; 
          }
        }
      }

      const candidates = line.filter(item => {
        const cleanText = item.text.replace(/,/g, '');
        return item.x > 500 && item.x < 700 && /^\d+(\.\d+)?$/.test(cleanText) && parseFloat(cleanText) > 0;
      });

      if (candidates.length > 0) {
        candidates.sort((a, b) => Math.abs(a.x - colMap.amount) - Math.abs(b.x - colMap.amount));
        amount = parseFloat(candidates[0].text.replace(/,/g, ''));
      }
      
      if (amount === 0) {
        const combinedItem = line.find(item => item.text.match(/^(\d+)\s+[A-Z]{2}\d{8}/));
        if (combinedItem) {
          const match = combinedItem.text.match(/^(\d+)\s+[A-Z]{2}\d{8}/);
          if (match) amount = parseFloat(match[1].replace(/,/g, ''));
        }
      }

      if (amount === 0) amount = findAmountFallback(lines, idx);

      if (invNo && amount > 0) {
        pageData.push({ dn: currentDN || "-", invoice: invNo, date: invDate, amount });
      }
    }
  });

  return { pageData, updatedLastDN: currentDN };
}

function findAmountFallback(lines: TextItem[][], currentIdx: number): number {
  for (let i = currentIdx; i < Math.min(lines.length, currentIdx + 5); i++) {
    const text = lines[i].map(l => l.text).join("");
    if (text.includes("應付金額")) {
      const match = text.match(/應付金額:?\s*([\d,.]+)/);
      if (match) return parseFloat(match[1].replace(/,/g, ''));
    }
  }
  return 0;
}

function convertRocToAd(rocStr: string) {
  if (!rocStr || rocStr === "-" || !rocStr.match(/^1\d{6}$/)) return rocStr;
  const year = parseInt(rocStr.substring(0, 3)) + 1911;
  const month = rocStr.substring(3, 5);
  const day = rocStr.substring(5, 7);
  return `${year}${month}${day}`;
}
