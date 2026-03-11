import * as pdfjsLib from 'pdfjs-dist';
import { InvoiceData } from '../types';

// Vite ?url 讓 worker 跟隨 npm 版本，永遠不會版本不匹配
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

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
    globalLastDN = "";

    for (let i = 1; i <= totalPages; i++) {
        onProgress(i, totalPages);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        // v5: items 混合了 TextItem 與 TextMarkedContent，只保留有 str 的 TextItem
        const textItems = textContent.items.filter((item: any) => 'str' in item);
        const lines = reconstructLines(textItems);
        const colMap = detectColumns(lines);
        parsePageData(lines, colMap, allData);
    }

    const uniqueData = Array.from(new Set(allData.map(item => JSON.stringify(item))))
        .map(str => JSON.parse(str) as InvoiceData);
    
    uniqueData.sort((a, b) => a.date.localeCompare(b.date));

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
    // v5 中文表頭亂碼，無法靠中文文字匹配
    // 改用資料行結構：找到第一個 DN 開頭的行來推斷欄位位置
    const map = { receipt: 67, amount: 580, invoice: 700 };
    
    for (const line of lines) {
        // 先嘗試中文匹配（如果 CMap 正確的話）
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
    
    // v5 fallback: 用第一個 DN 行的結構來推斷
    for (const line of lines) {
        const dnItem = line.find(item => item.text.match(/^[A-Z]{2}\d{8}$/) && item.x < 200);
        if (dnItem) {
            map.receipt = dnItem.x;
            // 在同一行找發票號碼 (格式: "金額 XX12345678")
            const invCombined = line.find(item => item.text.match(/\d+\s+[A-Z]{2}\d{8}/));
            if (invCombined) {
                map.invoice = invCombined.x;
            }
            // 金額欄位通常在 x=580-600 附近
            const amountItem = line.find(item => item.x > 500 && item.x < 650 && item.text.match(/^\d+$/));
            if (amountItem) {
                map.amount = amountItem.x;
            }
            break;
        }
    }
    return map;
}

let globalLastDN = "";

function parsePageData(lines: any[][], colMap: any, allData: InvoiceData[]) {
    lines.forEach((line, idx) => {
        // 偵測驗退收單號 (DN)
        const dnItem = line.find(item =>
            Math.abs(item.x - colMap.receipt) < 40 && item.text.match(/^[A-Z]{2}\d{8}$/)
        );
        if (dnItem) globalLastDN = dnItem.text;

        // v5: 發票號碼可能獨立出現，也可能被合併在 "金額 XX12345678" 中
        let invNo = "";

        // 策略 1: 獨立的發票號碼項目
        const invItem = line.find(item =>
            item.x > 500 && item.text.match(/^[A-Z]{2}\d{8}$/)
        );
        if (invItem) {
            invNo = invItem.text;
        }

        // 策略 2: 合併在 "金額 XX12345678" 中 (v5 特有)
        if (!invNo) {
            const combinedItem = line.find(item => {
                const match = item.text.match(/(\d+)\s+([A-Z]{2}\d{8})/);
                return match && item.x > 500;
            });
            if (combinedItem) {
                const match = combinedItem.text.match(/(\d+)\s+([A-Z]{2}\d{8})/);
                if (match) {
                    invNo = match[2];
                }
            }
        }

        if (invNo) {
            let invDate = "-";
            let amount = 0;

            // 尋找日期：在後續行中找 1XXXXXX 格式 (民國日期)
            // v5 中日期可能在 x=724 附近（比 v3 偏右）
            for (let d = 1; d <= 3; d++) {
                if (idx + d < lines.length) {
                    const dateItem = lines[idx + d].find(item =>
                        item.text.match(/^1\d{6}$/)
                    );
                    if (dateItem) { 
                        invDate = convertRocToAd(dateItem.text); 
                        break; 
                    }
                }
            }

            // 在同一行尋找金額
            // 方法 1: 獨立的金額欄位 (x 大約在 580-600)
            const candidates = line.filter(item => {
                const cleanText = item.text.replace(/,/g, '');
                return item.x > 500 && item.x < 700 && /^\d+(\.\d+)?$/.test(cleanText) && parseFloat(cleanText) > 0;
            });

            if (candidates.length > 0) {
                // 找最接近金額欄位位置的非零項目
                candidates.sort((a, b) => Math.abs(a.x - colMap.amount) - Math.abs(b.x - colMap.amount));
                amount = parseFloat(candidates[0].text.replace(/,/g, ''));
            }
            
            // 方法 2: 從合併文字 "金額 XX12345678" 中提取金額
            if (amount === 0) {
                const combinedItem = line.find(item => {
                    const match = item.text.match(/^(\d+)\s+[A-Z]{2}\d{8}/);
                    return match && item.x > 500;
                });
                if (combinedItem) {
                    const match = combinedItem.text.match(/^(\d+)\s+[A-Z]{2}\d{8}/);
                    if (match) {
                        amount = parseFloat(match[1].replace(/,/g, ''));
                    }
                }
            }

            // 方法 3: fallback - 尋找應付金額
            if (amount === 0) {
                amount = findAmountFallback(lines, idx);
            }

            if (invNo && amount > 0) {
                allData.push({ dn: globalLastDN || "-", invoice: invNo, date: invDate, amount });
            }
        }
    });
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
