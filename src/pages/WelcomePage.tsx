import React from 'react';
// Badge import removed
import { UploadCard } from '../components/organisms/UploadCard';
import { ScanSearch, CalendarClock, FolderTree, FileSpreadsheet } from 'lucide-react';
import { ThemeToggle } from '../components/atoms/ThemeToggle';

interface WelcomePageProps {
  onFileSelect: (file: File) => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onFileSelect }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'stretch',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      padding: '1.5rem 6rem',
      gap: '3rem'
    }}>
      <div style={{
        position: 'absolute',
        top: '0',
        left: '0',
        width: '50vw',
        height: '100%',
        background: 'radial-gradient(ellipse at center left, rgba(99, 102, 241, 0.1), transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Left Column: Features */}
      <div style={{
        flex: '0 0 300px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        zIndex: 1,
        textAlign: 'left'
      }}>
        
        <div style={{ marginBottom: '2.5rem', paddingLeft: '0.5rem' }}>
          <ThemeToggle />
        </div>

        {/* Feature Highlights - Vertical Stack */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {[
            { icon: <ScanSearch size={22} />, text: '自動定位核心' },
            { icon: <CalendarClock size={22} />, text: '西元日期轉換' },
            { icon: <FolderTree size={22} />, text: '月份自動分類' },
            { icon: <FileSpreadsheet size={22} />, text: '一鍵導出表格' }
          ].map((feature, i) => (
            <div key={i} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              padding: '1rem 1.5rem',
              background: 'var(--card)',
              border: '1px solid var(--glass-border)',
              borderRadius: '100px',
              color: 'var(--text-main)',
              boxShadow: '0 4px 6px var(--card)'
            }}>
              <span style={{ color: 'var(--primary-light)', display: 'flex' }}>
                {feature.icon}
              </span>
              <span style={{ fontSize: '1.1rem', fontWeight: 500, letterSpacing: '0.5px' }}>
                {feature.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Upload Area */}
      <div style={{ 
        flex: 1, 
        zIndex: 1, 
        display: 'flex',
        alignItems: 'stretch'
      }}>
        <UploadCard onFileSelect={onFileSelect} />
      </div>

    </div>
  );
};

export default WelcomePage;

