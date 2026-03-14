import { build } from 'vite';
import fs from 'fs';
import path from 'path';

async function exportSingleHtml() {
  try {
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const outputFileName = `發票提取工具_${dateStr}.html`;

    console.log(`🚀 開始產生單一 HTML 檔案: ${outputFileName}...`);

    // 使用獨立的設定檔進行建置
    await build({
      configFile: path.resolve(process.cwd(), 'vite.config.single.ts'),
    });

    const tempPath = path.resolve(process.cwd(), 'dist-single', 'index.html');
    const rootPath = path.resolve(process.cwd(), outputFileName);

    if (fs.existsSync(tempPath)) {
      if (fs.existsSync(rootPath)) {
        fs.unlinkSync(rootPath);
      }
      fs.copyFileSync(tempPath, rootPath);
      console.log(`\n✨ 產出成功！檔案位於專案根目錄: ${outputFileName}`);
      
      // 清空暫存
      try {
        fs.rmSync(path.resolve(process.cwd(), 'dist-single'), { recursive: true, force: true });
        fs.unlinkSync(path.resolve(process.cwd(), 'vite.config.single.ts'));
      } catch (e) {
        // 忽略清理錯誤
      }
    } else {
      throw new Error('找不到產出的 index.html 檔案。');
    }
  } catch (error) {
    console.error('❌ 產生失敗:', error);
    process.exit(1);
  }
}

exportSingleHtml();
