import fs from 'fs';
import path from 'path';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

async function main() {
  const file = path.resolve('test_data/中榮.pdf');
  const arrayBuffer = new Uint8Array(fs.readFileSync(file));
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('../node_modules/pdfjs-dist/build/pdf.worker.mjs', import.meta.url).href;

  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.5.207/cmaps/',
    cMapPacked: true,
  }).promise;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const textItems = textContent.items
      .map(item => ({
        text: item.str,
        x: Math.round(item.transform[4]),
        y: Math.round(item.transform[5]),
      }));

    const lineMap = {};
    for (const item of textItems) {
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

    console.log(`--- Page ${i} Raw Output ---`);
    const sortedYs = Object.keys(lineMap).sort((a, b) => parseInt(b) - parseInt(a));
    for (const y of sortedYs) {
      const line = lineMap[y].sort((a, b) => a.x - b.x);
      const output = line.map(it => it.text).join('').trim();
      if (output.length > 0) {
        console.log(`[Y=${y}] ${output}`);
      }
    }
  }
}

main().catch(console.error);
