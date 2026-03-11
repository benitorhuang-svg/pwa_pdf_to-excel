import { useState } from 'react';
import './App.css';
import WelcomePage from './pages/WelcomePage';
import LoadingPage from './pages/LoadingPage';
import ResultsPage from './pages/ResultsPage';
import { AppScreen, InvoiceData, ParsingStatus } from './types';
import { parsePdfFile } from './services/pdfParser';
import { exportToExcel } from './utils/excelExport';

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
    } catch (err) {
      console.error(err);
      alert('檔案解析出錯，請確認 PDF 格式或重新上傳。');
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
      {screen === 'welcome' && (
        <WelcomePage onFileSelect={handleFileSelect} />
      )}
      
      {screen === 'loading' && (
        <LoadingPage 
          progress={(status.currentPage / status.totalPages) * 100 || 0} 
          statusText={status.text} 
        />
      )}
      
      {screen === 'results' && (
        <ResultsPage 
          data={data} 
          totalPages={totalPages} 
          onBack={() => setScreen('welcome')}
          onExport={() => exportToExcel(data)}
          onCopy={handleCopy}
        />
      )}

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
