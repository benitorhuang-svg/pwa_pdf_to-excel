import fs from 'fs';
import path from 'path';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

async function main() {
  const file = path.resolve('test_data/B1150225150448.S408.pdf');
  const arrayBuffer = new Uint8Array(fs.readFileSync(file));
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('../node_modules/pdfjs-dist/build/pdf.worker.mjs', import.meta.url).href;

  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.5.207/cmaps/',
    cMapPacked: true,
  }).promise;

  console.log('pages', pdf.numPages);

  const allData = [];
  let lastDN = '';

  function reconstructLines(items) {
    const lineMap = {};
    for (const item of items) {
      const y = item.y;
      let foundY;
      for (const ey of Object.keys(lineMap)) {
        if (Math.abs(parseInt(ey) - y) < 4) {
          foundY = parseInt(ey);
          break;
        }
      }
      const targetY = foundY !== undefined ? foundY : y;
      if (!lineMap[targetY]) lineMap[targetY] = [];
      lineMap[targetY].push(item);
    }
    return Object.keys(lineMap)
      .sort((a, b) => parseInt(b) - parseInt(a))
      .map(y => lineMap[parseInt(y)].sort((a, b) => a.x - b.x));
  }

  function detectColumns(lines) {
    const map = { receipt: 67, amount: 580, invoice: 700 };

    for (const line of lines) {
      const text = line.map(l => l.text).join('');
      if (text.includes('驗退收單號') && text.includes('發票號碼')) {
        for (const item of line) {
          if (item.text.includes('驗退收單號')) map.receipt = item.x;
          if (item.text.includes('付款金額')) map.amount = item.x;
          if (item.text.includes('發票號碼')) map.invoice = item.x;
        }
        return map;
      }
    }

    for (const line of lines) {
      const dnItem = line.find(item => /^[A-Z]{2}\d{8}$/.test(item.text) && item.x < 200);
      if (dnItem) {
        map.receipt = dnItem.x;
        const invCombined = line.find(item => /\d+\s+[A-Z]{2}\d{8}/.test(item.text));
        if (invCombined) map.invoice = invCombined.x;
        const amountItem = line.find(item => item.x > 500 && item.x < 650 && /^\d+$/.test(item.text));
        if (amountItem) map.amount = amountItem.x;
        break;
      }
    }

    return map;
  }

  function convertRocToAd(rocStr) {
    if (!rocStr || rocStr === '-' || !/^1\d{6}$/.test(rocStr)) return rocStr;
    const year = parseInt(rocStr.substring(0, 3)) + 1911;
    const month = rocStr.substring(3, 5);
    const day = rocStr.substring(5, 7);
    return `${year}${month}${day}`;
  }

  function findAmountFallback(lines, currentIdx) {
    for (let i = currentIdx; i < Math.min(lines.length, currentIdx + 5); i++) {
      const text = lines[i].map(l => l.text).join('');
      if (text.includes('應付金額')) {
        const match = text.match(/應付金額:?\s*([\d,.]+)/);
        if (match) return parseFloat(match[1].replace(/,/g, ''));
      }
    }
    return 0;
  }

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const textItems = textContent.items
      .filter(item => 'str' in item)
      .map(item => ({
        text: item.str.trim(),
        x: Math.round(item.transform[4]),
        y: Math.round(item.transform[5]),
        w: item.width,
      }));

    const lines = reconstructLines(textItems);
    const colMap = detectColumns(lines);

    let currentDN = lastDN;
    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];

      const dnItem = line.find(item => Math.abs(item.x - colMap.receipt) < 40 && /^[A-Z]{2}\d{8}$/.test(item.text));
      if (dnItem) currentDN = dnItem.text;

      let invNo = '';
      const invItem = line.find(item => item.x > 500 && /^[A-Z]{2}\d{8}$/.test(item.text));
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
        let invDate = '-';
        let amount = 0;

        for (let d = 1; d <= 3; d++) {
          if (idx + d < lines.length) {
            const dateItem = lines[idx + d].find(item => /^1\d{6}$/.test(item.text));
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
          allData.push({ dn: currentDN || '-', invoice: invNo, date: invDate, amount });
        }
      }
    }

    lastDN = currentDN;
  }

  const uniqueData = Array.from(new Set(allData.map(item => JSON.stringify(item)))).map(str => JSON.parse(str));
  uniqueData.sort((a, b) => a.date.localeCompare(b.date));
  console.log('parsed', uniqueData);
}

main().catch(err => { console.error(err); process.exit(1); });
