import * as pdfjsLib from 'pdfjs-dist';
import { InvoiceData } from '../types';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function parsePdfFile(
    file: File,
    onProgress: (page: number, total: number) => void
): Promise<{ data: InvoiceData[]; totalPages: number }> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const totalPages = pdf.numPages;
    const allData: InvoiceData[] = [];
    let globalLastDN = "";

    for (let i = 1; i <= totalPages; i++) {
        onProgress(i, totalPages);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const lines = reconstructLines(textContent.items as any[]);
        const colMap = detectColumns(lines);
        
        const pageData = parsePageData(lines, colMap, globalLastDN);
        allData.push(...pageData.data);
        globalLastDN = pageData.lastDN;
    }

    const uniqueData = Array.from(new Set(allData.map(item => JSON.stringify(item))))
        .map(str => JSON.parse(str) as InvoiceData)
        .sort((a, b) => a.date.localeCompare(b.date));

    return { data: uniqueData, totalPages };
}

function reconstructLines(items: any[]) {
    const lineMap: Record<number, any[]> = {};
    items.forEach(item => {
        const y = Math.round(item.transform[5]);
        const foundY = Object.keys(lineMap).find(ey => Math.abs(parseInt(ey) - y) < 4);
        const targetY = foundY ? parseInt(foundY) : y;
        if (!lineMap[targetY]) lineMap[targetY] = [];
        lineMap[targetY].push({
            text: item.str.trim(),
            x: Math.round(item.transform[4]),
            w: item.width
        });
    });
    return Object.keys(lineMap)
        .sort((a, b) => parseInt(b) - parseInt(a))
        .map(y => lineMap[parseInt(y)].sort((a, b) => a.x - b.x));
}

function detectColumns(lines: any[][]) {
    const map = { receipt: 50, amount: 410, invoice: 510 };
    for (const line of lines) {
        const text = line.map(l => l.text).join("");
        if (text.includes("驗退收單號") && text.includes("發票號碼")) {
            line.forEach(item => {
                if (item.text.includes("驗退收單號")) map.receipt = item.x;
                if (item.text.includes("付款金額")) map.amount = item.x;
                if (item.text.includes("發票號碼")) map.invoice = item.x;
            });
            break;
        }
    }
    return map;
}

function parsePageData(lines: any[][], colMap: any, lastDN: string) {
    const data: InvoiceData[] = [];
    let currentLastDN = lastDN;

    lines.forEach((line, idx) => {
        const dnItem = line.find(item =>
            Math.abs(item.x - colMap.receipt) < 40 && item.text.match(/^[A-Z]{2}\d{8}$/)
        );
        if (dnItem) currentLastDN = dnItem.text;

        const invItem = line.find(item =>
            item.x > (colMap.invoice - 30) && item.text.match(/^[A-Z]{2}\d{8}$/)
        );

        if (invItem) {
            const invNo = invItem.text;
            let invDate = "-";
            let amount = 0;

            for (let d = 1; d <= 2; d++) {
                if (idx + d < lines.length) {
                    const dateItem = lines[idx + d].find(item =>
                        Math.abs(item.x - invItem.x) < 60 && item.text.match(/^1\d{6}$/)
                    );
                    if (dateItem) { 
                        invDate = convertRocToAd(dateItem.text); 
                        break; 
                    }
                }
            }

            const candidates = line.filter(item => {
                const cleanText = item.text.replace(/,/g, '');
                return item.x > (colMap.amount - 60) && item.x < (invItem.x - 10) && /^\d+(\.\d+)?$/.test(cleanText);
            });

            if (candidates.length > 0) {
                candidates.sort((a, b) => b.x - a.x);
                const nonZero = candidates.find(c => parseFloat(c.text.replace(/,/g, '')) > 0);
                const selectedItem = nonZero || candidates[0];
                amount = parseFloat(selectedItem.text.replace(/,/g, ''));
            } else {
                amount = findAmountFallback(lines, idx);
            }

            data.push({ dn: currentLastDN || "-", invoice: invNo, date: invDate, amount });
        }
    });

    return { data, lastDN: currentLastDN };
}

function findAmountFallback(lines: any[][], currentIdx: number): number {
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
