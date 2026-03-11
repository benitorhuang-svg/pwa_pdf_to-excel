import { useState } from 'react';
import './App.css';
import WelcomePage from './pages/WelcomePage';
import LoadingPage from './pages/LoadingPage';
import ResultsPage from './pages/ResultsPage';
import { AppScreen, InvoiceData, ParsingStatus } from './types';
import { parsePdfFile } from './services/pdfParser';
import { exportToExcel } from './utils/excelExport';

import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const [screen, setScreen] = useState<AppScreen>('welcome');
  const [data, setData] = useState<InvoiceData[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [status, setStatus] = useState<ParsingStatus>({
    currentPage: 0,
    totalPages: 0,
    text: '正在啟動...'
  });
  const [showToast, setShowToast] = useState(false);

  const handleFileSelect = async (file: File) => {
    setScreen('loading');
    try {
      const result = await parsePdfFile(file, (current, total) => {
        setStatus({
          currentPage: current,
          totalPages: total,
          text: `正在讀取第 ${current} / ${total} 頁...`
        });
      });
      setData(result.data);
      setTotalPages(result.totalPages);
      setScreen('results');
    } catch (err: any) {
      console.error(err);
      alert(`檔案解析出錯: ${err.message || '未知錯誤'}\n請確認 PDF 格式或重新上傳。`);
      setScreen('welcome');
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div className="main-app glass-panel" style={{
      width: '100%',
      maxWidth: '1200px',
      height: 'calc(100vh - 4rem)',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <AnimatePresence mode="wait">
        {screen === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            style={{ width: '100%', height: '100%' }}
          >
            <WelcomePage onFileSelect={handleFileSelect} />
          </motion.div>
        )}
        
        {screen === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ width: '100%', height: '100%' }}
          >
            <LoadingPage 
              progress={(status.currentPage / status.totalPages) * 100 || 0} 
              statusText={status.text} 
            />
          </motion.div>
        )}
        
        {screen === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5, ease: "circOut" }}
            style={{ width: '100%', height: '100%' }}
          >
            <ResultsPage 
              data={data} 
              totalPages={totalPages} 
              onBack={() => setScreen('welcome')}
              onExport={() => exportToExcel(data)}
              onCopy={handleCopy}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Copy Toast */}
      <div style={{
        position: 'fixed',
        bottom: '2rem',
        left: '50%',
        transform: `translateX(-50%) translateY(${showToast ? '-10px' : '20px'})`,
        background: 'var(--accent)',
        color: 'white',
        padding: '0.75rem 2rem',
        borderRadius: '100px',
        fontWeight: 600,
        boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)',
        zIndex: 1000,
        opacity: showToast ? 1 : 0,
        pointerEvents: 'none',
        transition: 'all 0.3s'
      }}>
        已複製到剪貼簿 ✨
      </div>
    </div>
  );
}

export default App;
