import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import fs from 'fs';
import path from 'path';

async function buildApp() {
  try {
    console.log('🔄 開始建置單一 HTML 檔案專案...');
    
    await build({
      plugins: [react(), viteSingleFile()],
      build: {
        outDir: 'dist',
        emptyOutDir: true,
      }
    });

    // 取得當天的西元年月日 YYYYMMDD
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}${month}${day}`;

    // 設定新檔名: pdf_to excel_YYYYMMDD.html
    const newFileName = `pdf_to excel_${dateString}.html`;
    const oldPath = path.resolve(process.cwd(), 'dist', 'index.html');
    const newPath = path.resolve(process.cwd(), 'dist', newFileName);

    // 重新命名輸出的檔案
    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
      console.log(`\n✅ 建置完成！您可以在 [dist/${newFileName}] 找到完整的單一產出檔案。`);
    } else {
      console.warn('⚠️ 找不到產出的 index.html 檔案，無法重新命名。');
    }
    
  } catch (error) {
    console.error('❌ 建置失敗:', error);
    process.exit(1);
  }
}

buildApp();
